/**
 * Component for displaying YouTube video performance charts.
 * Allows switching between Bar, Line, and Area chart types.
 * Visualizes views, likes, and comments for recent videos.
 * Uses Recharts library for chart rendering.
 */
import React, { useState, useMemo } from "react"; // Added missing React hooks
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  TooltipProps, XAxisProps, YAxisProps // Import specific prop types
} from 'recharts';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { YoutubeSummaryCards } from './YoutubeSummaryCards'; // Import summary cards
import { RssFeedItemWithStats } from '@/store/youtube-store'; // Import the type
import { Calendar } from "@/components/ui/calendar"; // Replaced DatePicker with Calendar
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"; // Adjusted import
import { DateRange } from "react-day-picker"; // Import DateRange type

// Extended ChartDataItem type to include date and platform properties
interface ChartDataItem {
  name: string;
  views: number;
  likes: number;
  comments: number;
  date: string; // Added date property
  platform: string; // Added platform property
}

// Define a type for common chart margin props
interface CommonChartMarginProps {
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
}

interface YoutubePerformanceChartProps {
  chartData: ChartDataItem[];
  chartType: 'bar' | 'line' | 'area';
  selectedMetric: 'views' | 'likes' | 'comments';
  setChartType: (value: 'bar' | 'line' | 'area') => void;
  setSelectedMetric: (value: 'views' | 'likes' | 'comments') => void;
  isMobile: boolean;
  commonChartProps: CommonChartMarginProps; // Use defined type
  commonTooltipProps: TooltipProps<number, string>; // Use imported type
  commonXAxisProps: XAxisProps; // Use imported type
  commonYAxisProps: YAxisProps; // Use imported type
  COLORS: { [key: string]: string };
  // Props for summary cards
  feedItems: RssFeedItemWithStats[];
  formatNumber: (num?: number) => string;
  totalStats: { views: number; likes: number; comments: number };
}

export function YoutubePerformanceChart({
  chartData, chartType, selectedMetric, setChartType, setSelectedMetric, isMobile,
  commonChartProps, commonTooltipProps, commonXAxisProps, commonYAxisProps, COLORS,
  feedItems, formatNumber, totalStats
}: YoutubePerformanceChartProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [platformFilters, setPlatformFilters] = useState(['YouTube']);

  const filteredChartData = useMemo(() => {
    return chartData.filter((item) => {
      const withinDateRange = !dateRange?.from || !dateRange?.to ||
        (new Date(item.date) >= new Date(dateRange.from) && new Date(dateRange.to));
      const matchesPlatform = platformFilters.includes(item.platform);
      return withinDateRange && matchesPlatform;
    });
  }, [chartData, dateRange, platformFilters]);

  if (chartData.length === 0) {
    return null; // Don't render the card if there's no data
  }

  return (
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
            <Select value={chartType} onValueChange={setChartType}>
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
        <div className="flex flex-wrap gap-4">
          <Calendar
            selected={dateRange}
            onSelect={(range: DateRange | undefined) => setDateRange(range)}
            aria-label="Select Date Range"
          />
          <ToggleGroup
            type="multiple" // Added required 'type' property
            value={platformFilters}
            onValueChange={setPlatformFilters}
          >
            <ToggleGroupItem value="YouTube">YouTube</ToggleGroupItem>
            <ToggleGroupItem value="Twitch">Twitch</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="h-[350px] pt-4">
          {chartType === 'bar' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredChartData} {...commonChartProps}>
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
              <LineChart data={filteredChartData} {...commonChartProps}>
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
              <AreaChart data={filteredChartData} {...commonChartProps}>
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

        {/* Include Summary Cards within the Performance Chart Card */}
        <YoutubeSummaryCards
          feedItems={feedItems}
          formatNumber={formatNumber}
          totalStats={totalStats}
        />
      </CardContent>
    </Card>
  );
}
