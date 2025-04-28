/**
 * User settings page component that manages profile information, account security,
 * notification preferences, and social media account connections. This page handles
 * YouTube RSS feed configuration that powers the dashboard's content display.
 * The component integrates with Firebase for user authentication and data storage.
 */
"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Bell, Check, Key, Lock, User, Youtube, HelpCircle } from "lucide-react"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { EmailAuthProvider } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAccounts } from "@/context/account-context";
import { YouTubeRssHelp } from "@/components/youtube-rss-help";
import { cn } from "@/lib/utils"; // Import cn utility

// Define platform type to avoid using 'any'
type SocialPlatform = 'youtube'; // Simplified for current scope

// Define user settings interface
interface UserSettings {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    bio: string;
    avatarUrl: string;
  };
  notifications: {
    performanceAlerts: boolean;
    engagementReports: boolean;
    followerMilestones: boolean;
    contentSuggestions: boolean;
    trendsAlerts: boolean;
    productUpdates: boolean;
  };
  connections?: { // Add connections field to store RSS URLs etc.
    youtubeRssUrl?: string;
  };
}

// Default settings
const defaultSettings: UserSettings = {
  profile: {
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    bio: "",
    avatarUrl: "/placeholder.svg?height=96&width=96",
  },
  notifications: {
    performanceAlerts: true,
    engagementReports: true,
    followerMilestones: false,
    contentSuggestions: true,
    trendsAlerts: false,
    productUpdates: false,
  },
  connections: { // Initialize connections
    youtubeRssUrl: "",
  },
};

export default function SettingsPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [youtubeRssUrlInput, setYoutubeRssUrlInput] = useState<string>("");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { accounts, connectAccount, disconnectAccount } = useAccounts();
  const [showHelpComponent, setShowHelpComponent] = useState(false);
  const [rssUrlEmpty, setRssUrlEmpty] = useState(true);

  // Determine if the user has a password account by checking providerData
  const hasPasswordProvider = user?.providerData.some(
    (provider) => provider.providerId === EmailAuthProvider.PROVIDER_ID
  );

  // Fetch user settings on component mount
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          // Get existing settings or set defaults for missing fields
          const userData = userDoc.data();
          const fetchedSettings = { // Build settings object carefully
            profile: {
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              email: userData.email || user.email || "",
              username: userData.username || "",
              bio: userData.bio || "",
              avatarUrl: userData.avatarUrl || "/placeholder.svg?height=96&width=96",
            },
            notifications: {
              performanceAlerts: userData.notifications?.performanceAlerts ?? true,
              engagementReports: userData.notifications?.engagementReports ?? true,
              followerMilestones: userData.notifications?.followerMilestones ?? false,
              contentSuggestions: userData.notifications?.contentSuggestions ?? true,
              trendsAlerts: userData.notifications?.trendsAlerts ?? false,
              productUpdates: userData.notifications?.productUpdates ?? false,
            },
            connections: { // Load connections data
              youtubeRssUrl: userData.connections?.youtubeRssUrl || "",
            },
          };
          setSettings(fetchedSettings);
          // Initialize the input field state with the fetched URL
          const savedRssUrl = fetchedSettings.connections?.youtubeRssUrl || "";
          setYoutubeRssUrlInput(savedRssUrl);
          setRssUrlEmpty(savedRssUrl === "");
          
          // Auto-show help if URL contains @ symbol (problematic format)
          if (savedRssUrl.includes("@")) {
            setShowHelpComponent(true);
          }
        } else {
          // Create default settings document for new users
          const initialData = {
            ...defaultSettings.profile, // Spread default profile
            email: user.email || "", // Ensure email is set
            notifications: defaultSettings.notifications,
            connections: defaultSettings.connections, // Add default connections
            createdAt: new Date(),
          };
          await setDoc(userDocRef, initialData);
          setSettings(defaultSettings); // Set local state to defaults
          setYoutubeRssUrlInput(""); // Ensure input is empty
          setRssUrlEmpty(true);
        }
      } catch (error) {
        console.error("Error fetching user settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserSettings();
  }, [user, toast]); // Keep dependencies as they are

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const profileData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      username: formData.get("username") as string,
      bio: formData.get("bio") as string,
    };
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, profileData);
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          ...profileData,
        }
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
      setIsLoading(false);
    }
  }

  const handleSavePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Password changes would typically use Firebase Auth methods
    // This would be implemented separately as it requires current password verification
    setIsLoading(true);

    toast({
      title: "Feature not implemented",
      description: "Password changes through Firebase Auth will be implemented in a future update.",
    });
    
    setIsLoading(false);
  }

  const handleToggleNotification = async (settingName: keyof UserSettings['notifications']) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Update local state immediately for UI responsiveness
      setSettings(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [settingName]: !prev.notifications[settingName],
        }
      }));
      
      // Update in Firebase
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        [`notifications.${settingName}`]: !settings.notifications[settingName],
      });
      
    } catch (error) {
      console.error("Error updating notification settings:", error);
      
      // Revert local state if Firebase update fails
      setSettings(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [settingName]: settings.notifications[settingName],
        }
      }));
      
      toast({
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        notifications: settings.notifications,
      });
      
      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      console.error("Error saving notifications:", error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save the YouTube RSS URL
  const handleSaveYoutubeRssUrl = async () => {
    if (!user) {
      console.error("Settings Save Error: User not logged in.");
      toast({ title: "Error", description: "User not logged in.", variant: "destructive" });
      return;
    }
    
    // Basic validation
    if (!youtubeRssUrlInput) {
      toast({ title: "Info", description: "RSS URL cannot be empty.", variant: "default" });
      return;
    }
    
    // Check for @ symbol in URL (indicates wrong format)
    if (youtubeRssUrlInput.includes("@")) {
      toast({
        title: "Invalid URL Format",
        description: "URL includes @ symbol. Use channel_id format instead. See help section below.",
        variant: "destructive"
      });
      setShowHelpComponent(true);
      return;
    }
    
    // Basic URL validation
    try {
      const url = new URL(youtubeRssUrlInput);
      if (!url.hostname.includes("youtube.com") || !url.pathname.includes("feeds/videos.xml")) {
        toast({
          title: "Invalid YouTube RSS URL",
          description: "URL must be in the format: youtube.com/feeds/videos.xml?channel_id=...",
          variant: "destructive"
        });
        setShowHelpComponent(true);
        return;
      }
      
      // Check if it uses channel_id parameter
      const channelId = url.searchParams.get("channel_id");
      if (!channelId) {
        toast({
          title: "Missing channel_id parameter",
          description: "URL must contain ?channel_id=YOUR_CHANNEL_ID",
          variant: "destructive"
        });
        setShowHelpComponent(true);
        return;
      }
    } catch (error) {
      console.error('Settings: Invalid YouTube RSS URL format', error);
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid URL',
        variant: 'destructive'
      });
      setShowHelpComponent(true);
      return;
    }

    console.log(`Settings: Attempting to save YouTube RSS URL: ${youtubeRssUrlInput} for user ${user.uid}`);
    setIsLoading(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        "connections.youtubeRssUrl": youtubeRssUrlInput, // Update nested field
      });

      // Update local state
      setSettings(prev => ({
        ...prev,
        connections: {
          ...prev.connections,
          youtubeRssUrl: youtubeRssUrlInput,
        }
      }));
      setRssUrlEmpty(false);

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
      setIsLoading(false);
    }
  };

  // Modify handleToggleConnection if needed (e.g., clear RSS URL on disconnect)
  const handleToggleConnection = (platform: string, isConnected: boolean) => {
    setIsLoading(true);

    // Example: Clear RSS URL when disconnecting YouTube OAuth
    if (platform === 'youtube' && isConnected) {
      // Optional: Ask user if they want to clear RSS URL too, or just do it
      // For now, let's assume disconnecting OAuth doesn't automatically clear RSS
      // You might want separate logic or keep them independent
      console.log("Disconnecting YouTube OAuth. RSS URL remains unchanged unless explicitly cleared.");
    }

    // In a real implementation, you would store connected platforms in Firebase
    setTimeout(() => {
      if (isConnected) {
        disconnectAccount(platform as SocialPlatform);
        toast({
          title: "Account disconnected",
          description: `Your ${platform} account has been disconnected.`,
        });
      } else {
        connectAccount(platform as SocialPlatform);
        toast({
          title: "Account connected",
          description: `Your ${platform} account has been connected successfully.`,
        });
      }
      setIsLoading(false)
    }, 1000); // Simulating API call
  }

  // Handle URL input change
  const handleRssUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeRssUrlInput(e.target.value);
    setRssUrlEmpty(e.target.value === "");
    
    // Auto-show help if URL contains @ symbol (problematic format)
    if (e.target.value.includes("@") && !showHelpComponent) {
      setShowHelpComponent(true);
    }
  };

  // Show loading state if user auth or settings are still initializing
  if (isLoading || loadingAuth || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <form onSubmit={handleSaveProfile}>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your profile information and avatar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 md:items-center">
                  <div className="relative w-24 h-24">
                    <Image
                      src={settings.profile.avatarUrl || "/placeholder.svg?height=96&width=96"}
                      alt="Avatar"
                      className="rounded-full border"
                      width={96}
                      height={96}
                    />
                    <Button variant="outline" size="sm" className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0">
                      <User className="h-4 w-4" />
                      <span className="sr-only">Change avatar</span>
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground">
                      Click the edit button to change your profile picture
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      defaultValue={settings.profile.firstName} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      defaultValue={settings.profile.lastName} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      defaultValue={settings.profile.email} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      name="username" 
                      defaultValue={settings.profile.username} 
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input 
                      id="bio" 
                      name="bio" 
                      defaultValue={settings.profile.bio} 
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="account" className="space-y-4">
          {/* Conditionally render password card */}
          {hasPasswordProvider && (
            <Card>
              <form onSubmit={handleSavePassword}>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Change your password here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="currentPassword" name="currentPassword" type="password" className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="newPassword" name="newPassword" type="password" className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="confirmPassword" name="confirmPassword" type="password" className="pl-9" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update password"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
          {/* Keep Delete Account card */}
          <Card>
            <CardHeader>
              <CardTitle>Delete Account</CardTitle>
              <CardDescription>Permanently delete your account and all of your content.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="destructive">Delete account</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <Label htmlFor="performanceAlerts" className="font-normal">
                      Performance Alerts
                    </Label>
                  </div>
                  <Switch 
                    id="performanceAlerts" 
                    checked={settings.notifications.performanceAlerts}
                    onCheckedChange={() => handleToggleNotification('performanceAlerts')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <Label htmlFor="engagementReports" className="font-normal">
                      Weekly Engagement Reports
                    </Label>
                  </div>
                  <Switch 
                    id="engagementReports" 
                    checked={settings.notifications.engagementReports}
                    onCheckedChange={() => handleToggleNotification('engagementReports')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <Label htmlFor="followerMilestones" className="font-normal">
                      Follower Milestone Alerts
                    </Label>
                  </div>
                  <Switch 
                    id="followerMilestones" 
                    checked={settings.notifications.followerMilestones}
                    onCheckedChange={() => handleToggleNotification('followerMilestones')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <Label htmlFor="contentSuggestions" className="font-normal">
                      Content Strategy Suggestions
                    </Label>
                  </div>
                  <Switch 
                    id="contentSuggestions" 
                    checked={settings.notifications.contentSuggestions}
                    onCheckedChange={() => handleToggleNotification('contentSuggestions')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <Label htmlFor="trendsAlerts" className="font-normal">
                      Industry Trends Alerts
                    </Label>
                  </div>
                  <Switch 
                    id="trendsAlerts" 
                    checked={settings.notifications.trendsAlerts}
                    onCheckedChange={() => handleToggleNotification('trendsAlerts')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <Label htmlFor="productUpdates" className="font-normal">
                      Product Updates & Features
                    </Label>
                  </div>
                  <Switch 
                    id="productUpdates" 
                    checked={settings.notifications.productUpdates}
                    onCheckedChange={() => handleToggleNotification('productUpdates')}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveNotifications} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save preferences"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts & Feeds</CardTitle>
              <CardDescription>Manage OAuth connections and RSS feeds.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* YouTube Section */}
              <div className="space-y-4 p-4 border rounded-md">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <Youtube className="h-5 w-5 text-red-600" />
                    <h3 className="text-lg font-medium">YouTube Integration</h3>
                  </div>
                  {/* Button to toggle YouTube RSS Help visibility */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowHelpComponent(!showHelpComponent)} // Toggle state on click
                    className="flex items-center gap-1"
                  >
                    <HelpCircle className="h-4 w-4" />
                    {/* Dynamically change button text */}
                    <span>{showHelpComponent ? "Hide Help" : "Show Help"}</span>
                  </Button>
                </div>

                {/* YouTube OAuth Connection */}
                {accounts.filter(account => account.platform === 'youtube').map((account) => {
                  const platformColors: Record<string, string> = { youtube: "#FF0000" };
                  const platformIcons: Record<string, React.ReactNode> = {
                    youtube: (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                        <path d="m10 15 5-3-5-3z" />
                      </svg>
                    ),
                  }

                  return (
                    <div key={`${account.platform}-oauth`} className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center space-x-4">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: platformColors[account.platform] }}
                        >
                          {platformIcons[account.platform]}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium capitalize">{account.platform} OAuth</h3>
                          <p className="text-xs text-muted-foreground">
                            {account.connected ? (
                              <span className="flex items-center text-green-600">
                                <Check className="h-3 w-3 mr-1" /> Connected
                              </span>
                            ) : (
                              "Not connected"
                            )}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={account.connected ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleToggleConnection(account.platform, account.connected)}
                        disabled={isLoading}
                      >
                        {isLoading ? "Processing..." : account.connected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  )
                })}

                {/* YouTube RSS Feed Input */}
                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="youtubeRssUrl" className="text-sm font-medium">YouTube RSS Feed URL</Label>
                    {settings.connections?.youtubeRssUrl && (
                      <Badge variant={settings.connections.youtubeRssUrl.includes('@') ? "destructive" : "outline"}>
                        {settings.connections.youtubeRssUrl.includes('@') ? "Invalid Format" : "Configured"}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <Input
                      id="youtubeRssUrl"
                      name="youtubeRssUrl"
                      type="url"
                      placeholder="https://www.youtube.com/feeds/videos.xml?channel_id=YOUR_CHANNEL_ID"
                      value={youtubeRssUrlInput}
                      onChange={handleRssUrlChange}
                      className="flex-grow"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSaveYoutubeRssUrl}
                      disabled={isLoading || youtubeRssUrlInput === (settings.connections?.youtubeRssUrl || "")}
                    >
                      {isLoading ? "Saving..." : "Save"}
                    </Button>
                  </div>
                  
                  {/* Help component Wrapper with Transition */}
                  <div 
                    className={cn(
                      "overflow-hidden transition-all duration-500 ease-in-out",
                      (showHelpComponent || rssUrlEmpty || (settings.connections?.youtubeRssUrl && settings.connections.youtubeRssUrl.includes('@'))) 
                        ? "max-h-[1000px] opacity-100 mt-4" // Adjust max-h as needed, ensure it's large enough
                        : "max-h-0 opacity-0"
                    )}
                  >
                    {/* Render help component only when it should be visible or transitioning out */}
                    {(showHelpComponent || rssUrlEmpty || (settings.connections?.youtubeRssUrl && settings.connections.youtubeRssUrl.includes('@'))) && (
                      <YouTubeRssHelp currentUrl={settings.connections?.youtubeRssUrl} />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
