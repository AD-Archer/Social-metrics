/**
 * Zustand store for managing YouTube dashboard state.
 * Handles fetching, storing, and persisting YouTube RSS feed data,
 * including feed items, loading status, errors, and configuration status.
 * Data is persisted to local storage to retain state across sessions.
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

interface RssFeedItemWithStats extends RssFeedItem {
    views?: number;
    likes?: number;
    comments?: number;
}

// Helper function to generate placeholder statistics
const generatePlaceholderStat = (base: number, variance: number): number => {
    return Math.floor(base + (Math.random() - 0.5) * variance * 2);
};

// Define the state structure and actions
interface YoutubeState {
    feedItems: RssFeedItemWithStats[];
    isLoading: boolean;
    error: string | null;
    rssConfigured: boolean;
    fetchFeed: (user: User | null | undefined, showToast: typeof toast) => Promise<void>;
    resetState: () => void;
}

// Define the initial state values
const initialState = {
    feedItems: [],
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
            // Action to reset the store to its initial state
            resetState: () => set(initialState),
        }),
        {
            name: 'youtube-feed-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ feedItems: state.feedItems, rssConfigured: state.rssConfigured }),
        }
    )
);
