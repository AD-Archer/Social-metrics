/**
 * Component displaying summary statistics cards for the YouTube dashboard.
 * Shows total views, likes, and comments based on the provided feed items.
 * Uses custom div elements for layout and icons for visual representation.
 */
// Removed unused Card and CardContent imports
import { Eye, ThumbsUp, MessageSquare } from "lucide-react";
import { RssFeedItemWithStats } from "@/store/youtube-store"; // Import the type

interface YoutubeSummaryCardsProps {
  feedItems: RssFeedItemWithStats[];
  formatNumber: (num?: number) => string;
  totalStats: { views: number; likes: number; comments: number };
}

export function YoutubeSummaryCards({ feedItems, formatNumber, totalStats }: YoutubeSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3 pt-4 border-t border-border">
      <div className="flex items-center space-x-4 p-4 rounded-md bg-muted/40">
        <div className="p-2 rounded-full bg-background border border-border">
          <Eye className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium mb-0.5">Total Views</p>
          <div className="text-2xl font-bold">{formatNumber(totalStats.views)}</div>
          <p className="text-xs text-muted-foreground">Across {feedItems.length} videos</p>
        </div>
      </div>

      <div className="flex items-center space-x-4 p-4 rounded-md bg-muted/40">
        <div className="p-2 rounded-full bg-background border border-border">
          <ThumbsUp className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium mb-0.5">Total Likes</p>
          <div className="text-2xl font-bold">{formatNumber(totalStats.likes)}</div>
          <p className="text-xs text-muted-foreground">Estimated total engagement</p>
        </div>
      </div>

      <div className="flex items-center space-x-4 p-4 rounded-md bg-muted/40">
        <div className="p-2 rounded-full bg-background border border-border">
          <MessageSquare className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium mb-0.5">Total Comments</p>
          <div className="text-2xl font-bold">{formatNumber(totalStats.comments)}</div>
          <p className="text-xs text-muted-foreground">Estimated total interactions</p>
        </div>
      </div>
    </div>
  );
}

