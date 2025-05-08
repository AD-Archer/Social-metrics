/**
 * Connection settings component.
 * Manages connections to external services like YouTube, focusing on RSS feed
 * configuration (via `useSettingsStore`). It receives state and handlers as
 * props from the parent settings page. Includes responsive design for mobile devices.
 */
"use client";

import type React from "react";
import { HelpCircle, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { YouTubeRssHelp } from "@/components/youtube-rss-help";
import { cn } from "@/lib/utils";
import type { UserSettings } from "../page"; // Import the type

interface ConnectionSettingsProps {
  connectionSettings: UserSettings['connections'];
  isLoading: boolean;
  youtubeRssUrlInput: string;
  handleRssUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveYoutubeRssUrl: () => Promise<void>;
  showHelpComponent: boolean;
  setShowHelpComponent: (show: boolean) => void;
}

export function ConnectionSettings({
  connectionSettings,
  isLoading,
  youtubeRssUrlInput,
  handleRssUrlChange,
  handleSaveYoutubeRssUrl,
  showHelpComponent,
  setShowHelpComponent,
}: ConnectionSettingsProps) {

  const isSavedUrlInvalid = connectionSettings?.youtubeRssUrl?.includes('@') ?? false;
  const shouldShowHelp = showHelpComponent || isSavedUrlInvalid;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Feeds</CardTitle>
        <CardDescription>Manage RSS feeds for content integration.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* YouTube Section */}
        <div className="space-y-4 p-3 sm:p-4 border rounded-md">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="flex gap-2 items-center">
              <Youtube className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-medium">YouTube Integration</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelpComponent(!showHelpComponent)}
              className="flex items-center gap-1 w-fit"
            >
              <HelpCircle className="h-4 w-4" />
              <span>{showHelpComponent ? "Hide Help" : "Show Help"}</span>
            </Button>
          </div>

          {/* YouTube RSS Feed Input */}
          <div className="pt-2 sm:pt-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Label htmlFor="youtubeRssUrl" className="text-sm font-medium">YouTube RSS Feed URL</Label>
              {connectionSettings?.youtubeRssUrl && (
                <Badge variant={isSavedUrlInvalid ? "destructive" : "outline"}>
                  {isSavedUrlInvalid ? "Invalid Format" : "Configured"}
                </Badge>
              )}
            </div>

            {/* Current URL display if present */}
            {connectionSettings?.youtubeRssUrl && (
              <div className="mb-2 text-sm text-muted-foreground">
                <span className="font-medium">Current URL:</span>
                <div className="mt-1 break-all bg-muted/40 p-2 rounded-sm">
                  {connectionSettings.youtubeRssUrl}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:space-x-2 mb-2">
              <Input
                id="youtubeRssUrl"
                name="youtubeRssUrl"
                type="url"
                placeholder="https://www.youtube.com/feeds/videos.xml?channel_id=YOUR_CHANNEL_ID"
                value={youtubeRssUrlInput}
                onChange={handleRssUrlChange}
                className="flex-grow w-full break-all text-ellipsis"
                disabled={isLoading}
              />
              <Button
                onClick={handleSaveYoutubeRssUrl}
                disabled={isLoading || youtubeRssUrlInput === (connectionSettings?.youtubeRssUrl || "")}
                className="whitespace-nowrap w-full sm:w-auto"
              >
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>

            {/* Help component Wrapper with Transition */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-500 ease-in-out",
                shouldShowHelp
                  ? "max-h-[2000px] opacity-100 mt-4"
                  : "max-h-0 opacity-0"
              )}
            >
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
