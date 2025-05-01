/**
 * Zustand store for managing user settings across the settings page components.
 * This store centralizes state like user settings data, loading status,
 * input field values (e.g., YouTube RSS URL), and UI state (e.g., help component visibility).
 * It also encapsulates the asynchronous logic for fetching and saving settings data
 * using Firebase Firestore.
 */
import { create } from 'zustand';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from '@/lib/firebase'; // Assuming auth is handled separately or passed in
import type { UserSettings } from '@/app/dashboard/settings/page'; // Import the type

// Default settings structure - ensure consistency with page.tsx
const defaultSettings: UserSettings = {
  profile: {
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    bio: "",
    avatarUrl: "/placeholder.svg?height=96&width=96",
  },
  connections: {
    youtubeRssUrl: "",
  },
};

interface SettingsState {
  settings: UserSettings;
  isLoading: boolean;
  youtubeRssUrlInput: string;
  showHelpComponent: boolean;
  rssUrlEmpty: boolean; // Derived state, but useful to keep synced
  setSettings: (settings: UserSettings) => void;
  setLoading: (loading: boolean) => void;
  setYoutubeRssUrlInput: (url: string) => void;
  setShowHelpComponent: (show: boolean) => void;
  setRssUrlEmpty: (isEmpty: boolean) => void;
  fetchUserSettings: (user: User, toast: (options: any) => void) => Promise<void>;
  saveProfile: (user: User, profileData: Partial<UserSettings['profile']>, toast: (options: any) => void) => Promise<void>;
  saveYoutubeRssUrl: (user: User, toast: (options: any) => void) => Promise<void>;
  // Placeholder for password save if needed later
  // savePassword: (user: User, passwordData: any, toast: (options: any) => void) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  isLoading: true, // Start loading initially
  youtubeRssUrlInput: "",
  showHelpComponent: false,
  rssUrlEmpty: true,

  setSettings: (settings) => set({ settings }),
  setLoading: (isLoading) => set({ isLoading }),
  setYoutubeRssUrlInput: (youtubeRssUrlInput) => {
    const isEmpty = youtubeRssUrlInput === "";
    const showHelp = get().showHelpComponent || youtubeRssUrlInput.includes("@");
    set({ youtubeRssUrlInput, rssUrlEmpty: isEmpty, showHelpComponent: showHelp });
  },
  setShowHelpComponent: (showHelpComponent) => set({ showHelpComponent }),
  setRssUrlEmpty: (rssUrlEmpty) => set({ rssUrlEmpty }), // Keep this if direct setting is needed

  fetchUserSettings: async (user, toast) => {
    if (!user) {
      set({ isLoading: false, settings: defaultSettings, youtubeRssUrlInput: "", rssUrlEmpty: true });
      return;
    }
    set({ isLoading: true });
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const fetchedSettings: UserSettings = {
          profile: {
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || user.email || "",
            username: userData.username || "",
            bio: userData.bio || "",
            avatarUrl: userData.avatarUrl || defaultSettings.profile.avatarUrl,
          },
          connections: {
            youtubeRssUrl: userData.connections?.youtubeRssUrl || "",
          },
        };
        const savedRssUrl = fetchedSettings.connections?.youtubeRssUrl || "";
        set({
          settings: fetchedSettings,
          youtubeRssUrlInput: savedRssUrl,
          rssUrlEmpty: savedRssUrl === "",
          showHelpComponent: savedRssUrl.includes("@"), // Auto-show help if URL has '@'
        });
      } else {
        // Create default settings document for new users
        const initialData = {
          ...defaultSettings.profile,
          email: user.email || "",
          connections: defaultSettings.connections,
          createdAt: new Date(),
        };
        await setDoc(userDocRef, initialData);
        set({ settings: defaultSettings, youtubeRssUrlInput: "", rssUrlEmpty: true });
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings. Please try again.",
        variant: "destructive",
      });
      // Optionally reset to defaults on error
      set({ settings: defaultSettings, youtubeRssUrlInput: "", rssUrlEmpty: true });
    } finally {
      set({ isLoading: false });
    }
  },

  saveProfile: async (user, profileData, toast) => {
    if (!user) return;
    set({ isLoading: true });
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, profileData);

      // Update local store state
      set((state) => ({
        settings: {
          ...state.settings,
          profile: {
            ...state.settings.profile,
            ...profileData,
          },
        },
      }));

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  saveYoutubeRssUrl: async (user, toast) => {
    if (!user) {
      console.error("Settings Save Error: User not logged in.");
      toast({ title: "Error", description: "User not logged in.", variant: "destructive" });
      return;
    }

    const { youtubeRssUrlInput } = get(); // Get current input value from store

    // Basic validation
    if (!youtubeRssUrlInput) {
      toast({ title: "Info", description: "RSS URL cannot be empty.", variant: "default" });
      return;
    }

    // Check for @ symbol
    if (youtubeRssUrlInput.includes("@")) {
      toast({
        title: "Invalid URL Format",
        description: "URL includes @ symbol. Use channel_id format instead. See help section.",
        variant: "destructive"
      });
      set({ showHelpComponent: true });
      return;
    }

    // Basic URL validation
    try {
      const url = new URL(youtubeRssUrlInput);
      if (!url.hostname.includes("youtube.com") || !url.pathname.includes("feeds/videos.xml")) {
        throw new Error("URL must be a valid YouTube feed URL.");
      }
      const channelId = url.searchParams.get("channel_id");
      if (!channelId) {
        throw new Error("URL must contain ?channel_id=YOUR_CHANNEL_ID");
      }
    } catch (error: any) {
      console.error('Settings: Invalid YouTube RSS URL format', error);
      toast({
        title: 'Invalid URL',
        description: error.message || 'Please enter a valid URL (e.g., youtube.com/feeds/videos.xml?channel_id=...).',
        variant: 'destructive'
      });
      set({ showHelpComponent: true });
      return;
    }

    console.log(`Settings Store: Attempting to save YouTube RSS URL: ${youtubeRssUrlInput} for user ${user.uid}`);
    set({ isLoading: true });
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        "connections.youtubeRssUrl": youtubeRssUrlInput,
      });

      // Update local store state
      set((state) => ({
        settings: {
          ...state.settings,
          connections: {
            ...state.settings.connections,
            youtubeRssUrl: youtubeRssUrlInput,
          },
        },
        rssUrlEmpty: false, // URL is saved, so not empty
      }));

      toast({
        title: "YouTube RSS URL Saved",
        description: "Your YouTube RSS feed URL has been updated."
      });
    } catch (saveError) {
      console.error("Settings Save Error: Error saving YouTube RSS URL:", saveError);
      toast({
        title: "Error",
        description: "Failed to save YouTube RSS URL. Check console for details.",
        variant: "destructive",
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));