/**
 * Zustand store for managing the state of trending topics.
 * This store handles fetching, storing, and providing access to trending Wikipedia articles.
 * It includes state for the articles themselves, loading and error states, and the selected date for which trends are displayed.
 * A selector is provided to easily extract article titles for AI processing.
 */
import { create } from 'zustand';

// Define the structure for a Wikipedia trending article
interface WikipediaTrendingItem {
  article: string;
  views: number;
  rank: number;
}

// Define the state structure for the store
interface TrendingState {
  trendingArticles: WikipediaTrendingItem[];
  isLoading: boolean;
  error: string | null;
  selectedDate: Date;
  fetchTrendingArticles: (date: Date) => Promise<void>;
  setSelectedDate: (date: Date) => void;
  getArticlesForAI: () => string[]; // Selector for AI processing
}

// Helper function to filter unwanted articles
const filterArticles = (articles: WikipediaTrendingItem[]): WikipediaTrendingItem[] => {
  return articles.filter(
    (item) =>
      item.article !== "Main_Page" &&
      item.article !== "Special:Search" &&
      item.article !== "Wikipedia:Featured_pictures"
  );
};

export const useTrendingStore = create<TrendingState>((set, get) => ({
  trendingArticles: [],
  isLoading: true,
  error: null,
  selectedDate: (() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  })(),
  fetchTrendingArticles: async (date: Date) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `/api/wikipedia/trending?date=${date.toISOString().split('T')[0]}`
      );

      if (!response.ok) {
        throw new Error(`API error! status: ${response.status}`);
      }

      const data = await response.json();
      set({ trendingArticles: data, isLoading: false });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Failed to fetch Wikipedia trending articles:", err);
      set({ error: errorMessage, isLoading: false, trendingArticles: [] });
    }
  },
  setSelectedDate: (date: Date) => {
    set({ selectedDate: date });
    get().fetchTrendingArticles(date); // Refetch articles when date changes
  },
  getArticlesForAI: () => {
    // Returns an array of article titles, which can be easily fed to an AI
    return get().trendingArticles.map(item => item.article.replace(/_/g, " "));
  },
}));

// Initialize fetch for the default selected date
// useTrendingStore.getState().fetchTrendingArticles(useTrendingStore.getState().selectedDate);
