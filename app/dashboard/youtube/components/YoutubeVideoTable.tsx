/**
 * Component displaying a table of recent YouTube videos and their statistics.
 * Fetches data from the YouTube RSS feed via props.
 * Allows viewing video descriptions via a callback function.
 */
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RssFeedItemWithStats } from "@/store/youtube-store"; // Import the type
import { Info } from "lucide-react";

// Define the type for the selected video passed to the dialog handler
export interface SelectedVideoType {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  guid?: string;
  contentSnippet?: string;
  views?: number;
  likes?: number;
  comments?: number;
}


interface YoutubeVideoTableProps {
  feedItems: RssFeedItemWithStats[];
  handleOpenDialog: (video: SelectedVideoType) => void;
  formatDate: (dateString?: string) => string;
  formatNumber: (num?: number) => string;
  isMobile: boolean;
}

export function YoutubeVideoTable({
  feedItems, handleOpenDialog, formatDate, formatNumber, isMobile
}: YoutubeVideoTableProps) {

  if (feedItems.length === 0) {
    return null; // Don't render the card if there are no items
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Videos & Stats</CardTitle>
        <CardDescription>
          Latest videos from your RSS feed with generated analytics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Video Title</TableHead>
                <TableHead className="text-right whitespace-nowrap">Published</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Likes</TableHead>
                <TableHead className="text-right">Comments</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedItems.map((item) => (
                <TableRow key={item.guid || item.link} className="group hover:bg-muted/50">
                  <TableCell className="font-medium max-w-[180px] truncate" title={item.title}>{item.title || "No Title"}</TableCell>
                  <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                    {formatDate(item.pubDate || item.isoDate)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatNumber(item.views)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatNumber(item.likes)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatNumber(item.comments)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      {item.contentSnippet && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenDialog(item)}
                          title="View Description"
                          className={`gap-1 ${isMobile ? 'p-2' : ''}`}
                        >
                          <Info className="h-4 w-4" />
                          {!isMobile && 'Info'}
                        </Button>
                      )}
                      {/* Link button removed as per original code logic */}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
