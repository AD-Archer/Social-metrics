/**
 * YouTube dashboard page component displaying RSS feed content and channel statistics.
 * Fetches YouTube RSS feed data using the useYoutubeStore Zustand store,
 * processes and displays recent videos with publication dates and links.
 * Includes placeholder analytics data (views, likes, comments) for presentation.
 * Allows viewing video descriptions in a dialog.
 * Features interactive charts for visualizing video statistics with responsive design.
 * Provides trends analysis for comparing performance over time periods.
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
  ComposedChart,
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
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ExternalLink,
  AlertCircle,
  Settings,
  ThumbsUp,
  MessageSquare,
  Info,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Percent,
  Eye,
} from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useAccounts } from '@/context/account-context';

import { useYoutubeStore } from '@/store/youtube-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from '@/components/ui/use-mobile';
import { Badge } from "@/components/ui/badge";

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
  
  // Calculate total stats for summary cards
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
  
  // Access trend data from the store
  const monthlyComparisonData = useMemo(() => {
    return trendData?.monthly || {
      views: [],
      likes: [],
      comments: [],
    };
  }, [trendData]);

  const yearlyComparisonData = useMemo(() => {
    return trendData?.yearly || {
      views: [],
      likes: [],
      comments: [],
    };
  }, [trendData]);
  
  const conversionRateData = useMemo(() => {
    if (!trendData?.conversion) {
      return [];
    }
    
    // Map conversion rate data to include icons
    return trendData.conversion.map((item) => {
      const icon = item.name.includes("Likes") ? 
        <ThumbsUp className="h-4 w-4" /> : 
        <MessageSquare className="h-4 w-4" />;
      
      return {
        ...item,
        icon,
      };
    });
  }, [trendData]);

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
        {/* Charts Section - Refactored with Chart Type Selector */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <CardTitle>Recent Video Performance Trends</CardTitle>
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
            <CardContent className="space-y-6">
              <div className="h-[350px] pt-4">
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
              </div>
              
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
            </CardContent>
          </Card>
        )}

      {/* Trends Analysis Section */}
      <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  Overall Performance Trends
                </CardTitle>
                <CardDescription>
                  Compare metrics over time and measure conversion rates
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={trendsTab} onValueChange={(value) => setTrendsTab(value as 'month' | 'year' | 'conversion')}>
              <div className={`flex ${isMobile ? 'flex-col w-full' : 'justify-end'} gap-2 mb-4`}>
                <TabsList className={isMobile ? "w-full grid grid-cols-3" : ""}>
                  <TabsTrigger value="month" className={isMobile ? "flex-1" : ""}>Month-to-Month</TabsTrigger>
                  <TabsTrigger value="year" className={isMobile ? "flex-1" : ""}>Year-to-Year</TabsTrigger>
                  <TabsTrigger value="conversion" className={isMobile ? "flex-1" : ""}>Conversion</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="month">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <h3 className="text-lg font-medium">Month-to-Month Comparison</h3>
                  <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as 'views' | 'likes' | 'comments')}>
                    <SelectTrigger className={isMobile ? "w-full" : "w-[160px]"}>
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="views">Views</SelectItem>
                      <SelectItem value="likes">Likes</SelectItem>
                      <SelectItem value="comments">Comments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={monthlyComparisonData[selectedMetric]} {...commonChartProps}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis {...commonYAxisProps} />
                      <Tooltip 
                        {...commonTooltipProps} 
                        formatter={(value: number, name: string) => [
                          formatNumber(value),
                          name === 'current' ? 'Current Period' : 'Previous Period'
                        ]} 
                      />
                      <Legend />
                      <Bar dataKey="previous" fill={COLORS.previous} name="Previous Period" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="current" fill={COLORS.current} name="Current Period" radius={[4, 4, 0, 0]} />
                      <Line
                        type="monotone"
                        dataKey="changePercent"
                        stroke={COLORS.neutral}
                        strokeWidth={2}
                        dot={true}
                        name="% Change"
                        yAxisId={1}
                      />
                      <YAxis 
                        yAxisId={1} 
                        orientation="right" 
                        tickFormatter={(value) => `${value.toFixed(1)}%`} 
                        domain={[-20, 20]} 
                        width={60} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid gap-4 md:grid-cols-3 mt-4">
                  {monthlyComparisonData[selectedMetric].slice(0, 3).map((item, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            <h4 className="text-2xl font-bold">{formatNumber(item.current)}</h4>
                          </div>
                          <div>
                            <Badge 
                              variant={item.change > 0 ? 'default' : 'destructive'}
                              className="flex items-center gap-1"
                            >
                              {item.change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                              {item.changePercent.toFixed(1)}%
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">vs {formatNumber(item.previous)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="year">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <h3 className="text-lg font-medium">Year-to-Year Analysis</h3>
                  <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as 'views' | 'likes' | 'comments')}>
                    <SelectTrigger className={isMobile ? "w-full" : "w-[160px]"}>
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="views">Views</SelectItem>
                      <SelectItem value="likes">Likes</SelectItem>
                      <SelectItem value="comments">Comments</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yearlyComparisonData[selectedMetric]} {...commonChartProps}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis {...commonYAxisProps} />
                      <Tooltip {...commonTooltipProps} />
                      <Legend />
                      {(() => {
                        const currentYear = new Date().getFullYear();
                        return [currentYear-2, currentYear-1, currentYear].map((year, index) => (
                          <Bar 
                            key={year} 
                            dataKey={`${year}`} 
                            name={`${year}`}
                            fill={`hsl(var(--chart-${index+1}))`} 
                            radius={[4, 4, 0, 0]}
                          />
                        ));
                      })()}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  {(() => {
                    const currentYear = new Date().getFullYear();
                    return [
                      { year: currentYear, prev: currentYear-1 },
                      { year: currentYear-1, prev: currentYear-2 }
                    ].map((item) => (
                      <Badge key={item.year} variant="outline" className="py-1 px-3">
                        <span className="font-semibold">{item.year}</span>
                        <ArrowRight className="h-3 w-3 mx-1" />
                        <span className="text-muted-foreground">{((yearlyComparisonData[selectedMetric][0][`${item.year}`] as number) / 
                          (yearlyComparisonData[selectedMetric][0][`${item.prev}`] as number) * 100 - 100).toFixed(1)}% YoY</span>
                      </Badge>
                    ));
                  })()}
                </div>
              </TabsContent>
              
              <TabsContent value="conversion">
                <h3 className="text-lg font-medium mb-4">Conversion Rate Metrics</h3>
                
                <div className="grid gap-4 md:grid-cols-3">
                  {conversionRateData.map((item, idx) => (
                    <Card key={idx}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          {item.icon}
                          {item.name}
                        </CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="text-2xl font-bold">{item.value.toFixed(2)}%</div>
                          <Badge 
                            variant={item.change > 0 ? 'default' : 'destructive'}
                            className="flex items-center gap-1"
                          >
                            {item.change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {Math.abs(item.change).toFixed(1)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.change > 0 ? 'Increased' : 'Decreased'} from last period
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">What These Metrics Mean</h4>
                  <ul className="text-sm space-y-2">
                    <li><span className="font-medium">Likes to Views:</span> The percentage of viewers who like your videos, indicating content quality and viewer satisfaction.</li>
                    <li><span className="font-medium">Comments to Views:</span> The percentage of viewers who comment on your videos, showing audience engagement and community activity.</li>
                    <li><span className="font-medium">Comments to Likes:</span> The ratio between comments and likes, indicating how discussion-oriented your content is.</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

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
