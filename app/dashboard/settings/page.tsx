"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Bell, Check, Key, Lock, User } from "lucide-react"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
// Add EmailAuthProvider for checking password provider
import { useAuthState } from "react-firebase-hooks/auth"
import { EmailAuthProvider } from "firebase/auth";

// Import Firebase instances
import { auth, db } from "@/lib/firebase";
// Import UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
// Import custom hooks
import { useAccounts } from "@/context/account-context";

// Define platform type to avoid using 'any'
type SocialPlatform = 'instagram' | 'youtube' | 'tiktok' | 'twitch' | 'twitter';

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
};

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, loadingAuth] = useAuthState(auth); // Get loading state from useAuthState
  // Fetch sign-in methods to check for password provider - Replaced useSignInMethods
  // const [signInMethods, loadingSignInMethods] = useSignInMethods(auth);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const { accounts, connectAccount, disconnectAccount } = useAccounts()
  const { toast } = useToast()

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
          setSettings({
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
          });
        } else {
          // Create default settings document for new users
          await setDoc(userDocRef, {
            firstName: "",
            lastName: "",
            email: user.email || "",
            username: "",
            bio: "",
            avatarUrl: "/placeholder.svg?height=96&width=96",
            notifications: defaultSettings.notifications,
            createdAt: new Date(),
          });
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
  }, [user, toast]); // Keep dependencies as they are, toast is stable

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

  const handleToggleConnection = (platform: string, isConnected: boolean) => {
    setIsLoading(true);

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
    }, 1000);
  }

  // Show loading state if user auth or settings are still initializing
  // Use loadingAuth from useAuthState
  if (isLoading || loadingAuth || !user) { // Removed loadingSignInMethods
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
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>Manage your connected social media accounts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {/* Add type for 'account' parameter */}
                {accounts.filter(account => account.platform === 'youtube').map((account: { platform: string; connected: boolean }) => {
                  // Only include YouTube in platform colors and icons
                  const platformColors: Record<string, string> = {
                    youtube: "#FF0000",
                  }
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
                    <div key={account.platform} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: platformColors[account.platform] }}
                        >
                          {platformIcons[account.platform]}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium capitalize">{account.platform}</h3>
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
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">Last synced: {new Date().toLocaleDateString()}</p>
              <Button>Sync All Accounts</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
