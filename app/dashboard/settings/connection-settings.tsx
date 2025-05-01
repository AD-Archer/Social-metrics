/**
 * Connection settings component.
 * Manages connections to external services like YouTube, including OAuth
 * authentication status (via `useAccounts` context) and RSS feed configuration
 * (via `useSettingsStore`). It receives state and handlers as props from the
 * parent settings page.
 */
"use client";

import type React from "react";
import { Check, HelpCircle, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { YouTubeRssHelp } from "@/components/youtube-rss-help";
import { cn } from "@/lib/utils";
import type { SocialAccount } from "@/context/account-context";
import type { UserSettings } from "./page"; // Import the type

interface ConnectionSettingsProps {
  connectionSettings: UserSettings['connections']; // Receive only connections part
  isLoading: boolean; // Global loading state from store
  accounts: SocialAccount[]; // From Account Context
  handleToggleConnection: (platform: string, isConnected: boolean) => void; // From Account Context logic wrapper
  youtubeRssUrlInput: string; // From store
  handleRssUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Store action wrapper
  handleSaveYoutubeRssUrl: () => Promise<void>; // Store action wrapper
  showHelpComponent: boolean; // From store
  setShowHelpComponent: (show: boolean) => void; // Store action
  rssUrlEmpty: boolean; // From store
}

export function ConnectionSettings({
  connectionSettings,
  isLoading,
  accounts,
  handleToggleConnection,
  youtubeRssUrlInput,
  handleRssUrlChange,
  handleSaveYoutubeRssUrl,
  showHelpComponent,
  setShowHelpComponent,
  rssUrlEmpty,
}: ConnectionSettingsProps) {

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
  };

  // Determine if the currently saved URL (from settings) is invalid
  const isSavedUrlInvalid = connectionSettings?.youtubeRssUrl?.includes('@') ?? false;
  // Determine if the help should be shown based on state, emptiness, or invalid format
  const shouldShowHelp = showHelpComponent || rssUrlEmpty || isSavedUrlInvalid;

  return (
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
            {/* Button uses store action to toggle help visibility */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelpComponent(!showHelpComponent)} // Use store action
              className="flex items-center gap-1"
            >
              <HelpCircle className="h-4 w-4" />
              <span>{showHelpComponent ? "Hide Help" : "Show Help"}</span>
            </Button>
          </div>

          {/* YouTube OAuth Connection (Uses Account Context data/handlers) */}
          {accounts.filter(account => account.platform === 'youtube').map((account: SocialAccount) => (
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
                disabled={isLoading} // Use global loading state
              >
                {isLoading ? "Processing..." : account.connected ? "Disconnect" : "Connect"}
              </Button>
            </div>
          ))}

          {/* YouTube RSS Feed Input (Uses Settings Store data/handlers) */}
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="youtubeRssUrl" className="text-sm font-medium">YouTube RSS Feed URL</Label>
              {/* Badge reflects saved state from store */}
              {connectionSettings?.youtubeRssUrl && (
                 <Badge variant={isSavedUrlInvalid ? "destructive" : "outline"}>
                   {isSavedUrlInvalid ? "Invalid Format" : "Configured"}
                 </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2 mb-2">
              <Input
                id="youtubeRssUrl"
                name="youtubeRssUrl"
                type="url"
                placeholder="https://www.youtube.com/feeds/videos.xml?channel_id=YOUR_CHANNEL_ID"
                value={youtubeRssUrlInput} // Controlled by store state
                onChange={handleRssUrlChange} // Uses store action wrapper
                className="flex-grow"
                disabled={isLoading} // Use global loading state
              />
              <Button
                onClick={handleSaveYoutubeRssUrl} // Uses store action wrapper
                // Disable if loading OR if input hasn't changed from the saved value
                disabled={isLoading || youtubeRssUrlInput === (connectionSettings?.youtubeRssUrl || "")}
              >
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>

            {/* Help component Wrapper with Transition */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-500 ease-in-out",
                shouldShowHelp
                  ? "max-h-[1000px] opacity-100 mt-4" // Show
                  : "max-h-0 opacity-0" // Hide
              )}
            >
              {/* Conditionally render based on derived state */}
              {shouldShowHelp && (
                 <YouTubeRssHelp currentUrl={connectionSettings?.youtubeRssUrl} />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
