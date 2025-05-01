/**
 * Dialog component for displaying YouTube video details.
 * Shows the video title, publication date, and description.
 * Provides buttons to close the dialog and watch the video on YouTube.
 */
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink } from "lucide-react";
import { SelectedVideoType } from './YoutubeVideoTable'; // Import type from table component

interface YoutubeVideoDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedVideo: SelectedVideoType | null;
  formatDate: (dateString?: string) => string;
}

export function YoutubeVideoDialog({
  isOpen, onOpenChange, selectedVideo, formatDate
}: YoutubeVideoDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="truncate" title={selectedVideo?.title}>
            {selectedVideo?.title || "Video Description"}
          </DialogTitle>
          <DialogDescription>
            Published: {formatDate(selectedVideo?.pubDate || selectedVideo?.isoDate)}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] my-4 pr-6">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {selectedVideo?.contentSnippet || "No description available."}
          </p>
        </ScrollArea>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          {selectedVideo?.link && (
            <a href={selectedVideo.link} target="_blank" rel="noopener noreferrer">
              <Button type="button" variant="outline">
                Watch on YouTube <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
