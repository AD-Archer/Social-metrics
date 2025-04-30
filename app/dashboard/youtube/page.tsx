/**
 * YouTube dashboard page component displaying RSS feed content and channel statistics.
 * Fetches YouTube RSS feed data using the useYoutubeStore Zustand store,
 * processes and displays recent videos with publication dates and links.
 * Includes placeholder analytics data (views, likes, comments) for presentation.
 * Allows viewing video descriptions in a dialog.
 * Features interactive charts for visualizing video statistics with responsive design.
 */
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from "next/link";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ExternalLink,
  AlertCircle,
  Settings,
  Eye,
  ThumbsUp,
  MessageSquare,
  Info,
} from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/context/account-context";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useYoutubeStore } from '@/store/youtube-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from '@/components/ui/use-mobile';

interface SelectedVideoType {
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

// Define colors for consistency
const COLORS = {
  views: 'hsl(var(--primary))',
  likes: 'hsl(var(--chart-2))', // Ensure chart-2 is defined in globals.css or tailwind config
  comments: 'hsl(var(--chart-3))', // Ensure chart-3 is defined
};

export default function YoutubePage() {
  const [user, loadingAuth] = useAuthState(auth);
  const { accounts } = useAccounts();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const {
    feedItems,
    isLoading,
    error,
    rssConfigured,
    fetchFeed,
  } = useYoutubeStore();

  const [selectedVideo, setSelectedVideo] = useState<SelectedVideoType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'likes' | 'comments'>('views');

  const youtubeAccount = accounts.find((a) => a.platform === "youtube" && a.connected);

  useEffect(() => {
    if (!loadingAuth) {
      fetchFeed(user, toast);
    }
  }, [user, loadingAuth, fetchFeed, toast]);

  const totalStats = useMemo(() => {
    return feedItems.reduce(
      (acc, item) => {
        acc.views = (acc.views ?? 0) + (item.views ?? 0);
        acc.likes = (acc.likes ?? 0) + (item.likes ?? 0);
        acc.comments = (acc.comments ?? 0) + (item.comments ?? 0);
        return acc;
      },
      { views: 0, likes: 0, comments: 0 } as { views: number; likes: number; comments: number }
    );
  }, [feedItems]);

  const chartData = useMemo(() => {
    // Keep data sorted chronologically (oldest first) for line/area charts
    return feedItems.slice().reverse().map(item => ({
      name: item.title ? (item.title.length > 30 ? item.title.substring(0, 27) + '...' : item.title) : 'Untitled',
      views: item.views ?? 0,
      likes: item.likes ?? 0,
      comments: item.comments ?? 0,
    }));
  }, [feedItems]);

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

  const formatNumber = (num?: number): string => {
    if (num === undefined || num === null) return 'N/A';
    return num.toLocaleString('en-US');
  };

  const handleOpenDialog = (video: SelectedVideoType) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };

  // Common chart props to avoid repetition
  const commonChartProps = {
    margin: isMobile 
      ? { top: 5, right: 5, left: 0, bottom: 5 }
      : { top: 5, right: 20, left: 10, bottom: 5 },
  };

  const commonTooltipProps = {
    cursor: { fill: 'hsl(var(--muted))', fillOpacity: 0.3 },
    contentStyle: {
      backgroundColor: 'hsl(var(--background))',
      borderColor: 'hsl(var(--border))',
      borderRadius: 'var(--radius)',
      padding: '8px',
      fontSize: isMobile ? '12px' : '14px',
    },
    formatter: (value: number, name: string) => [
      formatNumber(value),
      name?.toString().charAt(0).toUpperCase() + name?.toString().slice(1)
    ],
  };

  const commonYAxisProps = {
    tickLine: false,
    axisLine: false,
    tickFormatter: (value: number) => isMobile ? formatCompactNumber(value) : formatNumber(value),
    tick: { fontSize: isMobile ? 10 : 12 },
    width: isMobile ? 35 : 60,
  };

  const commonXAxisProps = {
    dataKey: "name",
    tickLine: false,
    axisLine: false,
    tick: false,
  };

  const formatCompactNumber = (num?: number): string => {
    if (num === undefined || num === null) return 'N/A';
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    return (num / 1000000).toFixed(1) + 'M';
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {/* Skeleton for summary cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          {/* Skeleton for table */}
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      );
    }

    if (error) {
      const isPermissionError = error.toLowerCase().includes("permission");
      const configError = error.toLowerCase().includes("configured") || error.toLowerCase().includes("url") || error.toLowerCase().includes("format");

      return (
        <Alert variant={isPermissionError || configError ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{isPermissionError ? "Permission Error" : configError ? "Configuration Issue" : "Error Fetching Feed"}</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>{error}</p>
              {(isPermissionError || configError) && (
                <p>
                  Please check your <Link href="/dashboard/settings?tab=connections" className="underline">settings</Link> and ensure your YouTube RSS feed URL is correctly configured using the Channel ID format.
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
            You haven&apos;t configured your YouTube RSS feed URL yet.
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
            No videos found in your RSS feed, or the feed could not be processed. Ensure your YouTube RSS feed URL is correctly set in <Link href="/dashboard/settings?tab=connections" className="underline">Settings</Link>.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Summary Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(totalStats.views)}</div>
              <p className="text-xs text-muted-foreground">Across {feedItems.length} videos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(totalStats.likes)}</div>
               <p className="text-xs text-muted-foreground">Estimated total engagement</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(totalStats.comments)}</div>
               <p className="text-xs text-muted-foreground">Estimated total interactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section - Refactored with Chart Type Selector */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <CardTitle>Video Performance Trends</CardTitle>
                  <CardDescription>
                    Visualizing generated stats per video (oldest to newest).
                  </CardDescription>
                </div>
                <div className={`flex ${isMobile ? 'flex-col w-full' : 'items-center'} gap-2`}>
                   {/* Chart Type Selector */}
                   <Select value={chartType} onValueChange={(value: 'bar' | 'line' | 'area') => setChartType(value)}>
                    <SelectTrigger className={isMobile ? "w-full" : "w-[120px]"}>
                      <SelectValue placeholder="Chart Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Keep Tabs only for Bar Chart */}
                  {chartType === 'bar' && (
                    <Tabs value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as 'views' | 'likes' | 'comments')} className={isMobile ? "w-full" : "w-auto"}>
                      <TabsList className={isMobile ? "w-full grid grid-cols-3" : ""}>
                        <TabsTrigger value="views" className={isMobile ? "flex-1" : ""}>Views</TabsTrigger>
                        <TabsTrigger value="likes" className={isMobile ? "flex-1" : ""}>Likes</TabsTrigger>
                        <TabsTrigger value="comments" className={isMobile ? "flex-1" : ""}>Comments</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[350px] pt-4">
              {chartType === 'bar' ? (
                 <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} {...commonChartProps}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis {...commonXAxisProps} />
                    <YAxis {...commonYAxisProps} />
                    <Tooltip {...commonTooltipProps} />
                    <Legend />
                    <Bar
                      dataKey={selectedMetric}
                      fill={COLORS[selectedMetric]}
                      name={selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : chartType === 'line' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} {...commonChartProps}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis {...commonXAxisProps} />
                    <YAxis {...commonYAxisProps} />
                    <Tooltip {...commonTooltipProps} />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke={COLORS.views} name="Views" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="likes" stroke={COLORS.likes} name="Likes" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="comments" stroke={COLORS.comments} name="Comments" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : chartType === 'area' ? (
                 <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} {...commonChartProps}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.views} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.views} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.likes} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.likes} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.comments} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.comments} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis {...commonXAxisProps} />
                    <YAxis {...commonYAxisProps} />
                    <Tooltip {...commonTooltipProps} />
                    <Legend />
                    <Area type="monotone" dataKey="views" stroke={COLORS.views} fillOpacity={1} fill="url(#colorViews)" name="Views" strokeWidth={2} />
                    <Area type="monotone" dataKey="likes" stroke={COLORS.likes} fillOpacity={1} fill="url(#colorLikes)" name="Likes" strokeWidth={2} />
                    <Area type="monotone" dataKey="comments" stroke={COLORS.comments} fillOpacity={1} fill="url(#colorComments)" name="Comments" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Video Table with Stats */}
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
                              {!isMobile && <span>View</span>}
                            </Button>
                          )}
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Watch on YouTube"
                              className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors h-7 w-7 ml-1"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span className="sr-only">Watch video</span>
                            </a>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <footer className="text-center text-xs text-muted-foreground pt-4">
          Analytics data shown is illustrative.
        </footer>
      </div>
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

      {/* Render main content */}
      {renderContent()}

      {/* Video Description Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
    </div>
  );
}
