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

// Define interfaces for the data structure
interface RssFeedItem {
    title?: string;
    link?: string;
    pubDate?: string;
    isoDate?: string;
    guid?: string;
    contentSnippet?: string;
}

// Export this interface so it can be imported elsewhere
export interface RssFeedItemWithStats extends RssFeedItem {
    views?: number;
    likes?: number;
    comments?: number;
    aiAnalysis?: VideoAIAnalysis;
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

// Export this interface so it can be imported elsewhere
export interface TrendData {
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

// AI Analysis interfaces
interface VideoAIAnalysis {
    summary?: string;
    keywords?: string[] | string; // Allow string for comma-separated or array
    targetAudience?: string;
    performanceBoostIdeas?: string[] | string; // Can be array or string
    contentSuggestions?: string[] | string; // Can be array or string
    isLoading?: boolean;
    error?: string;
    raw_analysis?: string; // To store raw response if parsing fails
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
// Export this interface so it can be imported elsewhere
export interface YoutubeState {
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

// Define the initial state values
const initialState = {
    feedItems: [],
    trendData: null,
    isLoading: true,
    error: null,
    rssConfigured: false,
};

// Create the Zustand store with persistence middleware
export const useYoutubeStore = create<YoutubeState>()(
    persist(
        (set, get) => ({
            ...initialState,

            // Action to fetch the YouTube RSS feed
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
                    // Fetch from the API endpoint
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

                    // Process and enhance feed items with stats
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

            // Action to analyze a video with AI
            analyzeVideoWithAI: async (videoId, showToast) => {
                const { feedItems } = get();
                
                // Find the video by its guid or link (which contain the video ID)
                const videoIndex = feedItems.findIndex(item => 
                    (item.guid && item.guid.includes(videoId)) || 
                    (item.link && item.link.includes(videoId))
                );
                
                if (videoIndex === -1) {
                    showToast({
                        title: "Analysis Error",
                        description: "Video not found in your feed.",
                        variant: "destructive",
                    });
                    return;
                }
                
                // Mark video as loading analysis
                const updatedItems = [...feedItems];
                updatedItems[videoIndex] = {
                    ...updatedItems[videoIndex],
                    aiAnalysis: {
                        ...updatedItems[videoIndex].aiAnalysis,
                        isLoading: true,
                        error: undefined,
                        raw_analysis: undefined, // Clear previous raw analysis
                    }
                };
                
                set({ feedItems: updatedItems });
                
                try {
                    // Get the video title and description for analysis
                    const { title, contentSnippet } = updatedItems[videoIndex];
                    
                    // Call the AI analysis API
                    const response = await fetch('/api/youtube/ai', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            title,
                            description: contentSnippet
                        }),
                    });
                    
                    const analysisData = await response.json();
                    
                    if (!response.ok) {
                        // Handle API errors specifically
                        throw new Error(analysisData.error || `Failed to analyze video (Status: ${response.status})`);
                    }

                    // Check if the analysis itself reported an error (e.g., parsing failed on server)
                    if (analysisData.error) {
                         console.warn("AI Analysis reported an error:", analysisData.error);
                         // Store the raw analysis if available
                         const finalUpdatedItems = [...get().feedItems];
                         finalUpdatedItems[videoIndex] = {
                             ...finalUpdatedItems[videoIndex],
                             aiAnalysis: {
                                 isLoading: false,
                                 error: analysisData.error,
                                 raw_analysis: analysisData.raw_analysis,
                             }
                         };
                         set({ feedItems: finalUpdatedItems });
                         showToast({
                             title: "Analysis Partially Failed",
                             description: analysisData.error,
                             variant: "default",
                         });
                         return; // Stop further processing
                    }

                    // Update video with analysis results
                    const finalUpdatedItems = [...get().feedItems];
                    finalUpdatedItems[videoIndex] = {
                        ...finalUpdatedItems[videoIndex],
                        aiAnalysis: {
                            summary: analysisData.summary,
                            // Handle both array and comma-separated string for keywords
                            keywords: Array.isArray(analysisData.keywords)
                                ? analysisData.keywords
                                : typeof analysisData.keywords === 'string'
                                    ? analysisData.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
                                    : [],
                            targetAudience: analysisData.targetAudience,
                            // Handle both array and string for ideas/suggestions
                            performanceBoostIdeas: analysisData.performanceBoostIdeas,
                            contentSuggestions: analysisData.contentSuggestions,
                            isLoading: false,
                            error: undefined
                        }
                    };
                    
                    set({ feedItems: finalUpdatedItems });
                    
                    showToast({
                        title: "Analysis Complete",
                        description: "AI insights for your video are ready.",
                    });
                    
                } catch (err) {
                    console.error("AI analysis error:", err);
                    
                    // Update video with error information
                    const errorItems = [...get().feedItems];
                    const errorMessage = err instanceof Error ? err.message : "Failed to analyze video";
                    errorItems[videoIndex] = {
                        ...errorItems[videoIndex],
                        aiAnalysis: {
                            ...errorItems[videoIndex].aiAnalysis,
                            isLoading: false,
                            error: errorMessage,
                        }
                    };
                    
                    set({ feedItems: errorItems });
                    
                    showToast({
                        title: "Analysis Failed",
                        description: errorMessage,
                        variant: "destructive",
                    });
                }
            },
            
            // Helper method to check if a video is currently being analyzed
            isAnalyzingVideo: (videoId) => {
                const { feedItems } = get();
                const video = feedItems.find(item => 
                    (item.guid && item.guid.includes(videoId)) || 
                    (item.link && item.link.includes(videoId))
                );
                return video?.aiAnalysis?.isLoading || false;
            },
            
            // Helper method to get video analysis results
            getVideoAnalysis: (videoId) => {
                const { feedItems } = get();
                const video = feedItems.find(item => 
                    (item.guid && item.guid.includes(videoId)) || 
                    (item.link && item.link.includes(videoId))
                );
                return video?.aiAnalysis;
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
