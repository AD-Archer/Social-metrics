/**
 * Header component for the YouTube Dashboard page.
 * Displays the main title, description, connection status indicator,
 * and a link to the settings page.
 * Receives connection status as a prop.
 */
import Link from "next/link";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SocialAccount } from "@/context/account-context"; // Use SocialAccount type

interface YoutubePageHeaderProps {
  youtubeAccount: SocialAccount | undefined; // Update type annotation
}

export function YoutubePageHeader({ youtubeAccount }: YoutubePageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">YouTube Dashboard</h1>
        <p className="text-muted-foreground">Manage and track your YouTube content</p>
      </div>

      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${youtubeAccount ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
        <p className="text-sm text-muted-foreground">
          {youtubeAccount ? "Connected" : "Not Connected"}
        </p>
        <Link href="/dashboard/settings?tab=connections">
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
