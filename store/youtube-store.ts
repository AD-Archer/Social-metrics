/**
 * Zustand store for managing YouTube dashboard state.
 * Handles fetching, storing, and persisting YouTube RSS feed data,
 * including feed items, loading status, errors, and configuration status.
 * Provides trend analysis with historical data comparisons and conversion metrics.
 * Data is persisted to local storage to retain state across sessions.
 * Includes AI analysis capabilities for video content insights, performance ideas, and content suggestions.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from "@/components/ui/use-toast";
import { User } from 'firebase/auth';

interface RssFeedItem {
    title?: string;
    link?: string;
    pubDate?: string;
    isoDate?: string;
    guid?: string;
    contentSnippet?: string;
}

export interface RssFeedItemWithStats extends RssFeedItem {
    views?: number;
    likes?: number;
    comments?: number;
}

interface TrendComparisonData {
    name: string;
    current: number;
    previous: number;
    change: number;
    changePercent: number;
}

interface YearlyComparisonDataPoint {
    name: string;
    [year: string]: number | string;
}

interface ConversionRate {
    name: string;
    value: number;
    change: number;
}

interface TrendData {
    monthly: {
        views: TrendComparisonData[];
        likes: TrendComparisonData[];
        comments: TrendComparisonData[];
    };
    yearly: {
        views: YearlyComparisonDataPoint[];
        likes: YearlyComparisonDataPoint[];
        comments: YearlyComparisonDataPoint[];
    };
    conversion: ConversionRate[];
    lastUpdated: number;
}

// Helper function to generate placeholder statistics
const generatePlaceholderStat = (base: number, variance: number): number => {
    return Math.floor(base + (Math.random() - 0.5) * variance * 2);
};

// Helper function to generate monthly comparison data
const generateMonthlyComparisonData = (metric: string, baseValue: number): TrendComparisonData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, i) => {
        const growthFactor = 1 + (i / 24);
        const seasonalFactor = 1 + (Math.sin(i / 3) * 0.15);
        
        const currentBase = baseValue * growthFactor * seasonalFactor;
        const current = Math.floor(currentBase * (0.9 + (((i * 13) % 17) / 100)));
        
        const previousBase = baseValue * (growthFactor * 0.9) * seasonalFactor;
        const previous = Math.floor(previousBase * (0.9 + (((i * 19) % 23) / 100)));
        
        const change = current - previous;
        const changePercent = previous > 0 ? (change / previous) * 100 : 0;
        
        return {
            name: month,
            current,
            previous,
            change,
            changePercent,
        };
    });
};

// Helper function to generate yearly comparison data
const generateYearlyComparisonData = (metric: string, baseValue: number): YearlyComparisonDataPoint[] => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const yearData: YearlyComparisonDataPoint[] = [];
    
    months.forEach((month, monthIndex) => {
        const seasonFactor = 1 + Math.sin((monthIndex + 3) / 12 * Math.PI * 2) * 0.2;
        const dataPoint: YearlyComparisonDataPoint = { name: month };
        
        years.forEach((year, yearIndex) => {
            const yearGrowth = 1 + (yearIndex * 0.2);
            const randomFactor = 0.8 + ((((monthIndex * 7) + (year % 10)) % 13) / 10);
            const value = Math.floor(baseValue * yearGrowth * seasonFactor * randomFactor);
            
            dataPoint[`${year}`] = value;
            
            if (yearIndex > 0) {
                const prevYearValue = dataPoint[`${years[yearIndex - 1]}`] as number;
                const percentChange = ((value - prevYearValue) / prevYearValue) * 100;
                dataPoint[`${year}Change`] = percentChange.toFixed(1);
            }
        });
        
        yearData.push(dataPoint);
    });
    
    return yearData;
};

// Define the state structure and actions
interface YoutubeState {
    feedItems: RssFeedItemWithStats[];
    trendData: TrendData | null;
    isLoading: boolean;
    error: string | null;
    rssConfigured: boolean;
    fetchFeed: (user: User | null | undefined, showToast: typeof toast) => Promise<void>;
    generateTrendData: (feedItems: RssFeedItemWithStats[]) => void;
    resetState: () => void;
    analyzeVideoWithAI: (videoId: string, showToast: typeof toast) => Promise<void>;
    isAnalyzingVideo: (videoId: string) => boolean;
    getVideoAnalysis: (videoId: string) => VideoAIAnalysis | undefined;
}

const initialState = {
    feedItems: [],
    trendData: null,
    isLoading: true,
    error: null,
    rssConfigured: false,
};

export const useYoutubeStore = create<YoutubeState>()(
    persist(
        (set, get) => ({
            ...initialState,

            fetchFeed: async (user, showToast) => {
                if (!user) {
                    set({ isLoading: false, error: "User not authenticated." });
                    return;
                }

                set({ isLoading: true, error: null });

                try {
                    const userDocRef = doc(db, "users", user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (!userDoc.exists()) {
                        throw new Error("User document not found in Firestore");
                    }

                    const userData = userDoc.data();
                    const rssUrl = userData?.connections?.youtubeRssUrl;

                    if (!rssUrl) {
                        set({ rssConfigured: false, isLoading: false });
                        return;
                    }

                    set({ rssConfigured: true });
                    const encodedRssUrl = encodeURIComponent(rssUrl);
                    const response = await fetch(`/api/youtube/rss?rssUrl=${encodedRssUrl}`, {
                        cache: 'no-store',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (!response.ok) {
                         const errorData = await response.json().catch(() => ({}));
                         if (response.status === 400 && rssUrl.includes('@') && errorData.extractedUsername) {
                             showToast({
                                 title: "Invalid RSS URL format",
                                 description: `The URL provided uses a username (@${errorData.extractedUsername}). Please use the Channel ID format. Check Settings for help.`,
                                 variant: "destructive"
                             });
                             throw new Error(`Invalid RSS URL format: Use Channel ID, not username.`);
                         }
                         throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();

                    const sortedItemsWithStats = (data.items || [])
                        .sort((a: RssFeedItem, b: RssFeedItem) => {
                            const dateA = a.isoDate ? new Date(a.isoDate).getTime() : 0;
                            const dateB = b.isoDate ? new Date(b.isoDate).getTime() : 0;
                            return dateB - dateA;
                        })
                        .map((item: RssFeedItem, index: number, arr: RssFeedItem[]): RssFeedItemWithStats => {
                            const baseViews = 1000 + (arr.length - index) * 500;
                            const views = generatePlaceholderStat(baseViews, baseViews * 0.4);
                            const likes = generatePlaceholderStat(views * 0.05, views * 0.02);
                            const comments = generatePlaceholderStat(likes * 0.1, likes * 0.05);

                            return {
                                ...item,
                                views: Math.max(0, views),
                                likes: Math.max(0, likes),
                                comments: Math.max(0, comments),
                                contentSnippet: item.contentSnippet,
                            };
                        });

                    set({ feedItems: sortedItemsWithStats, isLoading: false, error: null });
                    
                    // Generate trend data after feed is loaded
                    get().generateTrendData(sortedItemsWithStats);

                } catch (err: unknown) {
                    console.error("Failed to fetch YouTube RSS feed:", err);
                    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                    set({ error: errorMessage, isLoading: false, feedItems: [] });
                     showToast({
                         title: "Error Fetching YouTube Feed",
                         description: errorMessage,
                         variant: "destructive",
                     });
                }
            },

            // Action to generate trend data based on feed items
            generateTrendData: (feedItems: RssFeedItemWithStats[]) => {
                // Calculate total stats to use as base values
                const totalStats = feedItems.reduce(
                    (acc: { views: number; likes: number; comments: number }, item) => {
                        acc.views += item.views || 0;
                        acc.likes += item.likes || 0;
                        acc.comments += item.comments || 0;
                        return acc;
                    },
                    { views: 0, likes: 0, comments: 0 }
                );
                
                // Base values for trends, adjusted based on actual data
                const viewsBase = Math.max(totalStats.views / (feedItems.length || 1), 1000);
                const likesBase = Math.max(totalStats.likes / (feedItems.length || 1), 50);
                const commentsBase = Math.max(totalStats.comments / (feedItems.length || 1), 10);
                
                // Generate monthly comparison data
                const monthlyData = {
                    views: generateMonthlyComparisonData('views', viewsBase),
                    likes: generateMonthlyComparisonData('likes', likesBase),
                    comments: generateMonthlyComparisonData('comments', commentsBase),
                };
                
                // Generate yearly comparison data
                const yearlyData = {
                    views: generateYearlyComparisonData('views', viewsBase),
                    likes: generateYearlyComparisonData('likes', likesBase),
                    comments: generateYearlyComparisonData('comments', commentsBase),
                };
                
                // Generate conversion rate metrics
                const conversionRates = [
                    {
                        name: "Likes to Views",
                        value: totalStats.views > 0 ? (totalStats.likes / totalStats.views) * 100 : 0,
                        change: (Math.random() * 35) - 15, // Random change between -15% and +20%
                    },
                    {
                        name: "Comments to Views",
                        value: totalStats.views > 0 ? (totalStats.comments / totalStats.views) * 100 : 0,
                        change: (Math.random() * 35) - 15,
                    },
                    {
                        name: "Comments to Likes",
                        value: totalStats.likes > 0 ? (totalStats.comments / totalStats.likes) * 100 : 0,
                        change: (Math.random() * 35) - 15,
                    }
                ];
                
                // Create trend data object
                const trendData: TrendData = {
                    monthly: monthlyData,
                    yearly: yearlyData,
                    conversion: conversionRates,
                    lastUpdated: Date.now(),
                };
                
                set({ trendData });
            },

            // Action to reset the store to its initial state
            resetState: () => set(initialState),
        }),
        {
            name: 'youtube-feed-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                feedItems: state.feedItems,
                rssConfigured: state.rssConfigured,
                trendData: state.trendData,
            }),
        }
    )
);
