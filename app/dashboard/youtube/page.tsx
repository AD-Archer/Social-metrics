/**
 * YouTube dashboard page component displaying RSS feed content and channel stats.
 * Fetches YouTube RSS feed data from the configured URL in user settings,
 * processes and displays recent videos with publication dates and links.
 * Uses client-side Firestore queries for better authentication handling.
 */
"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, AlertCircle, Settings } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/context/account-context";
import { useToast } from "@/components/ui/use-toast";

// Interface for RSS feed items returned from the API
interface RssFeedItem {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  guid?: string;
}

export default function YoutubePage() {
  const [user, loadingAuth] = useAuthState(auth);
  const [feedItems, setFeedItems] = useState<RssFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rssConfigured, setRssConfigured] = useState(false);
  const { accounts } = useAccounts();
  const { toast } = useToast();
  
  const youtubeAccount = accounts.find((a) => a.platform === "youtube" && a.connected);

  useEffect(() => {
    if (!loadingAuth && user) {
      const fetchFeed = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          // First check if the RSS URL is configured using client-side Firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const rssUrl = userData?.connections?.youtubeRssUrl;
            
            if (rssUrl) {
              setRssConfigured(true);
              
              // Fetch from the API with credentials
              const response = await fetch(`/api/youtube/rss?userId=${user.uid}`, {
                credentials: 'include',
                cache: 'no-store',
                headers: {
                  'Content-Type': 'application/json',
                }
              });
              
              if (!response.ok) {
                if (response.status === 400 && rssUrl.includes('@')) {
                  // Handle username format error
                  const data = await response.json();
                  
                  if (data.extractedUsername) {
                    toast({
                      title: "Invalid RSS URL format",
                      description: `The URL you provided is not in the correct format. You need to use the Channel ID version.`,
                      variant: "destructive"
                    });
                    
                    throw new Error(`You need to use the YouTube RSS format with channel_id. Check settings for more info.`);
                  }
                }
                
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
              }
              
              const data = await response.json();
              
              // Sort items by date, newest first
              const sortedItems = (data.items || []).sort((a: RssFeedItem, b: RssFeedItem) => {
                const dateA = a.isoDate ? new Date(a.isoDate).getTime() : 0;
                const dateB = b.isoDate ? new Date(b.isoDate).getTime() : 0;
                return dateB - dateA;
              });
              
              setFeedItems(sortedItems);
            } else {
              setRssConfigured(false);
            }
          } else {
            setError("User document not found in Firestore");
          }
        } catch (err: any) {
          console.error("Failed to fetch YouTube RSS feed:", err);
          setError(err.message || "An unknown error occurred while fetching the feed.");
          setFeedItems([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchFeed();
    } else if (!loadingAuth && !user) {
      setError("User not authenticated. Please log in.");
      setIsLoading(false);
    }
  }, [user, loadingAuth, toast]);

  // Helper function to format date strings
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString; 
    }
  };

  // Function to render the main content based on state
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      );
    }

    if (error) {
      // Special handling for permissions errors to provide clearer guidance
      const isPermissionError = error.toLowerCase().includes("permission");
      const configError = error.toLowerCase().includes("configured") || error.toLowerCase().includes("url");
      
      return (
        <Alert variant={isPermissionError ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{isPermissionError ? "Permission Error" : "Error Fetching Feed"}</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>{error}</p>
              {(isPermissionError || configError) && (
                <p>
                  Please check your <Link href="/dashboard/settings?tab=connections" className="underline">settings</Link> and ensure your RSS feed URL is correctly configured.
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    if (!rssConfigured) {
      return (
        <div className="text-center py-6">
          <p className="text-muted-foreground mb-4">
            You haven't configured your YouTube RSS feed URL yet.
          </p>
          <Link href="/dashboard/settings?tab=connections">
            <Button>Configure YouTube RSS Feed</Button>
          </Link>
        </div>
      );
    }
    
    if (feedItems.length === 0) {
      return (
        <div className="text-center py-6">
          <p className="text-muted-foreground">
            No videos found in your RSS feed. Ensure your YouTube RSS feed URL is correctly set in <Link href="/dashboard/settings?tab=connections" className="underline">Settings</Link>.
          </p>
        </div>
      );
    }

    // Display feed items in a table
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Video Title</TableHead>
            <TableHead className="text-right">Published Date</TableHead>
            <TableHead className="w-[50px] text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedItems.map((item) => (
            <TableRow key={item.guid || item.link} className="group hover:bg-muted/50">
              <TableCell className="font-medium">{item.title || 'No Title'}</TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatDate(item.pubDate || item.isoDate)}
              </TableCell>
              <TableCell className="text-right">
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Watch on YouTube"
                    className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Watch video</span>
                  </a>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* YouTube RSS Feed Card */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Videos</CardTitle>
          <CardDescription>
            Latest videos published on your YouTube channel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
