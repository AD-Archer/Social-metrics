/**
 * Component for displaying YouTube performance trends analysis.
 * Includes tabs for Month-to-Month, Year-to-Year, and Conversion Rate comparisons.
 * Uses Recharts for visualizations and custom components for layout.
 */
import {
  BarChart, Bar, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  TooltipProps, YAxisProps // Import specific prop types
} from 'recharts';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendData, TrendComparisonData, ConversionRate } from "@/store/youtube-store"; // Import the type
import { ReactNode } from 'react';
import {
  TrendingUp, ArrowUpRight, ArrowDownRight, ArrowRight, Percent, ThumbsUp, MessageSquare
} from "lucide-react";

// Define a type for common chart margin props
interface CommonChartMarginProps {
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
}

interface YoutubeTrendsAnalysisProps {
  trendData: TrendData | null;
  trendsTab: 'month' | 'year' | 'conversion';
  selectedMetric: 'views' | 'likes' | 'comments';
  setTrendsTab: (value: 'month' | 'year' | 'conversion') => void;
  setSelectedMetric: (value: 'views' | 'likes' | 'comments') => void;
  isMobile: boolean;
  formatNumber: (num?: number) => string;
  commonChartProps: CommonChartMarginProps; // Use defined type
  commonTooltipProps: TooltipProps<number, string>; // Use imported type
  commonYAxisProps: YAxisProps; // Use imported type
  COLORS: { [key: string]: string };
}

export function YoutubeTrendsAnalysis({
  trendData, trendsTab, selectedMetric, setTrendsTab, setSelectedMetric, isMobile,
  formatNumber, commonChartProps, commonTooltipProps, commonYAxisProps, COLORS
}: YoutubeTrendsAnalysisProps) {

  if (!trendData) {
    // Optionally render a loading state or null
    return <Card><CardHeader><CardTitle>Trends Analysis</CardTitle></CardHeader><CardContent>Loading trend data...</CardContent></Card>;
  }

  const monthlyComparisonData = trendData.monthly;
  const yearlyComparisonData = trendData.yearly;
  const conversionRateData = trendData.conversion.map((item: ConversionRate) => {
      const icon = item.name.includes("Likes") ?
        <ThumbsUp className="h-4 w-4" /> :
        <MessageSquare className="h-4 w-4" />;
      return { ...item, icon };
    });


  return (
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
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
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
              {monthlyComparisonData[selectedMetric].slice(0, 3).map((item: TrendComparisonData, idx: number) => (
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
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
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
                const yearData = yearlyComparisonData[selectedMetric];
                // Ensure data exists before trying to access it
                if (!yearData || yearData.length === 0 || !yearData[0][`${currentYear}`] || !yearData[0][`${currentYear-1}`] || !yearData[0][`${currentYear-2}`]) {
                    return null; // Or render a placeholder/message
                }
                return [
                  { year: currentYear, prev: currentYear-1 },
                  { year: currentYear-1, prev: currentYear-2 }
                ].map((item) => {
                    const currentVal = yearData[0][`${item.year}`] as number;
                    const prevVal = yearData[0][`${item.prev}`] as number;
                    const changePercent = prevVal !== 0 ? ((currentVal - prevVal) / prevVal * 100) : 0;
                    return (
                      <Badge key={item.year} variant="outline" className="py-1 px-3">
                        <span className="font-semibold">{item.year}</span>
                        <ArrowRight className="h-3 w-3 mx-1" />
                        <span className="text-muted-foreground">{changePercent.toFixed(1)}% YoY</span>
                      </Badge>
                    );
                });
              })()}
            </div>
          </TabsContent>

          <TabsContent value="conversion">
            <h3 className="text-lg font-medium mb-4">Conversion Rate Metrics</h3>

            <div className="grid gap-4 md:grid-cols-3">
              {conversionRateData.map((item: ConversionRate & { icon: ReactNode }, idx: number) => (
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
  );
}
