/**
 * YouTube dashboard page component orchestrating various sub-components.
 * Fetches YouTube RSS feed data using the useYoutubeStore Zustand store.
 * Manages UI state for chart types, selected metrics, and dialog visibility.
 * Renders header, charts, trends, video table, AI chat, and dialog components.
 */
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from "next/link";
import { AlertCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useAccounts } from '@/context/account-context';

import { useYoutubeStore } from '@/store/youtube-store';

import { YoutubePageHeader } from './components/YoutubePageHeader';
import { YoutubePerformanceChart } from './components/YoutubePerformanceChart';
import { YoutubeTrendsAnalysis } from './components/YoutubeTrendsAnalysis';
import { YoutubeVideoTable, SelectedVideoType } from './components/YoutubeVideoTable';
import { YoutubeVideoDialog } from './components/YoutubeVideoDialog';
import { YoutubeAIChat } from '@/components/youtube-ai-chat';

const COLORS = {
  views: 'hsl(var(--primary))',
  likes: 'hsl(var(--chart-2))',
  comments: 'hsl(var(--chart-3))',
  current: 'hsl(var(--chart-2))',
  previous: 'hsl(var(--chart-1))',
  positive: 'hsl(var(--chart-2))',
  negative: 'hsl(var(--chart-3))',
  neutral: 'hsl(var(--chart-4))',
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
    trendData,
  } = useYoutubeStore();

  const [selectedVideo, setSelectedVideo] = useState<SelectedVideoType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'likes' | 'comments'>('views');
  const [trendsTab, setTrendsTab] = useState<'month' | 'year' | 'conversion'>('month');

  const youtubeAccount = accounts.find((a) => a.platform === "youtube" && a.connected);

  useEffect(() => {
    if (!loadingAuth && user) {
      fetchFeed(user, toast);
    } else if (!loadingAuth && !user) {
        console.log("User not logged in.");
    }
  }, [user, loadingAuth, fetchFeed, toast]);

  const totalStats = useMemo(() => {
    return feedItems.reduce(
      (acc: { views: number; likes: number; comments: number }, item) => {
        acc.views += item.views || 0;
        acc.likes += item.likes || 0;
        acc.comments += item.comments || 0;
        return acc;
      },
      { views: 0, likes: 0, comments: 0 }
    );
  }, [feedItems]);

  const chartData = useMemo(() => {
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

   const formatCompactNumber = (num?: number): string => {
    if (num === undefined || num === null) return 'N/A';
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    return (num / 1000000).toFixed(1) + 'M';
  };

  const handleOpenDialog = (video: SelectedVideoType) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };

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

  const renderContent = () => {
    if (isLoading || loadingAuth) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
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

    if (feedItems.length === 0 && rssConfigured) {
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
        <YoutubePerformanceChart
          chartData={chartData}
          chartType={chartType}
          selectedMetric={selectedMetric}
          setChartType={setChartType}
          setSelectedMetric={setSelectedMetric}
          isMobile={isMobile}
          commonChartProps={commonChartProps}
          commonTooltipProps={commonTooltipProps}
          commonXAxisProps={commonXAxisProps}
          commonYAxisProps={commonYAxisProps}
          COLORS={COLORS}
          feedItems={feedItems}
          formatNumber={formatNumber}
          totalStats={totalStats}
        />

        <YoutubeTrendsAnalysis
          trendData={trendData}
          trendsTab={trendsTab}
          selectedMetric={selectedMetric}
          setTrendsTab={setTrendsTab}
          setSelectedMetric={setSelectedMetric}
          isMobile={isMobile}
          formatNumber={formatNumber}
          commonChartProps={commonChartProps}
          commonTooltipProps={commonTooltipProps}
          commonYAxisProps={commonYAxisProps}
          COLORS={COLORS}
        />

        <YoutubeVideoTable
          feedItems={feedItems}
          handleOpenDialog={handleOpenDialog}
          formatDate={formatDate}
          formatNumber={formatNumber}
          isMobile={isMobile}
        />

        <YoutubeAIChat />

        <footer className="text-center text-xs text-muted-foreground pt-4">
          Analytics data shown is illustrative. AI responses are generated and may require verification.
        </footer>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <YoutubePageHeader youtubeAccount={youtubeAccount} />

      {renderContent()}

      <YoutubeVideoDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedVideo={selectedVideo}
        formatDate={formatDate}
      />
    </div>
  );
}
