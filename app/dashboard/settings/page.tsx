/**
 * User settings page component that orchestrates profile and connection
 * settings sub-components. It utilizes the `useSettingsStore` for state management,
 * fetches user data, handles tab navigation via URL hash fragments, and passes
 * necessary data and handlers down to the child components.
 */
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useSettingsStore } from "@/store/settings-store";

// Import the child components
import { ProfileSettings } from "./components/profile-settings";
import { ConnectionSettings } from "./components/connection-settings";
import { AccountSettings } from "./components/account-settings";

export type SocialPlatform = 'youtube';

// Define user settings interface (can be moved to a shared types file)
// Ensure this interface is exported or accessible by child components and the store
export interface UserSettings {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    bio: string;
    avatarUrl: string;
  };
  connections?: {
    youtubeRssUrl?: string;
  };
}

export default function SettingsPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("profile");

  // Access state and actions from Zustand store
  const {
    settings,
    isLoading,
    youtubeRssUrlInput,
    showHelpComponent,
    fetchUserSettings,
    saveProfile,
    saveYoutubeRssUrl,
    setYoutubeRssUrlInput,
    setShowHelpComponent,
  } = useSettingsStore();

  // Effect to set active tab based on URL hash on initial load
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    // Now include "account" in valid tabs
    if (hash && ["profile", "account", "connections"].includes(hash)) {
      setActiveTab(hash);
    } else {
      setActiveTab("profile");
      // Optionally update URL if hash was invalid/missing
      // router.replace('/dashboard/settings#profile', { scroll: false });
    }
  }, []); // Run only once on mount

  // Effect to update URL hash when activeTab changes
  useEffect(() => {
    const currentHash = window.location.hash.substring(1);
    if (activeTab !== currentHash) {
      router.replace(`/dashboard/settings#${activeTab}`, { scroll: false });
    }
  }, [activeTab, router]);

  // Fetch user settings via store action when user is available
  useEffect(() => {
    if (user) {
      fetchUserSettings(user, toast);
    }
    // If user logs out, the store should ideally reset, handled in fetchUserSettings
  }, [user, fetchUserSettings, toast]);

  // --- Event Handlers ---

  // Profile save handler (calls store action)
  const handleSaveProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const profileData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      username: formData.get("username") as string,
      bio: formData.get("bio") as string,
    };
    await saveProfile(user, profileData, toast);
  };

  // YouTube RSS URL save handler (calls store action)
  const handleSaveYoutubeRssUrlClick = async () => {
    if (!user) return;
    await saveYoutubeRssUrl(user, toast);
  };

  // YouTube RSS URL input change handler (calls store action)
  const handleRssUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeRssUrlInput(e.target.value);
  };

  // Handler for changing tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Show loading state from store or if auth is loading
  if (isLoading || loadingAuth || !user) {
    // Added !user check for clarity during initial load/logout
    return <div className="flex items-center justify-center min-h-screen">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
        </TabsList>

        {/* Pass state and handlers from store/context */}
        <TabsContent value="profile" className="space-y-4">
          <ProfileSettings
            profileSettings={settings.profile}
            isLoading={isLoading}
            handleSaveProfile={handleSaveProfileSubmit}
          />
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <AccountSettings />
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <ConnectionSettings
            connectionSettings={settings.connections}
            isLoading={isLoading}
            youtubeRssUrlInput={youtubeRssUrlInput}
            handleRssUrlChange={handleRssUrlInputChange}
            handleSaveYoutubeRssUrl={handleSaveYoutubeRssUrlClick}
            showHelpComponent={showHelpComponent}
            setShowHelpComponent={setShowHelpComponent}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
