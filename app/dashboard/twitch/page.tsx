/**
 * Twitch dashboard page component.
 * This page will display statistics and information related to a connected Twitch account.
 * It checks if a Twitch account is linked via the AccountContext and prompts the user
 * to connect their account in settings if not already done.
 * Future implementations will fetch and display Twitch API data like stream status,
 * follower count, viewer count, etc.
 */
"use client";

import Link from "next/link";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useAccounts } from '@/context/account-context';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Twitch } from 'lucide-react'; // Assuming you might want the Twitch icon

// Placeholder for a potential Twitch-specific header component
// import { TwitchPageHeader } from "./components/TwitchPageHeader";

export default function TwitchPage() {
  // Destructure only loadingAuth from useAuthState as user is not needed
  const [, loadingAuth] = useAuthState(auth);
  const { accounts } = useAccounts(); // Adjusted to remove loading state

  // Find if a Twitch account is connected
  const twitchAccount = accounts.find((a) => a.platform === "twitch" && a.connected);
  const isLoading = loadingAuth; // Adjusted to only consider loadingAuth

  const renderContent = () => {
    if (isLoading) {
      // You can add Skeleton loaders here later
      return <p>Loading account information...</p>;
    }

    if (!twitchAccount) {
      return (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Connect Your Twitch Account</CardTitle>
            <CardDescription>
              To see your Twitch statistics, you need to connect your account first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/settings?tab=connections">
              <Button>Go to Settings</Button>
            </Link>
          </CardContent>
        </Card>
      );
    }

    // Placeholder for where Twitch stats will be displayed
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <Twitch className="h-5 w-5" /> Twitch Dashboard
          </CardTitle>
          <CardDescription>
            Your Twitch statistics will appear here soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: Implement components to fetch and display Twitch data */}
          <p>Follower Count: [Placeholder]</p>
          <p>Stream Status: [Placeholder]</p>
          <p>Current Viewers: [Placeholder]</p>
          {/* Add more placeholders for other stats */}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Placeholder for Header */}
      {/* <TwitchPageHeader twitchAccount={twitchAccount} /> */}
      <h1 className="text-2xl font-semibold flex items-center gap-2">
        <Twitch className="h-6 w-6" /> Twitch Analytics
      </h1>

      {renderContent()}

      {/* Footer Note - Optional */}
      <footer className="text-center text-xs text-muted-foreground pt-4">
        Twitch data is fetched directly from the Twitch API.
      </footer>
    </div>
  );
}
