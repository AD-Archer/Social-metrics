import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// Sample data for Twitter charts
const followerData = [
  { name: "Jan", followers: 18400 },
  { name: "Feb", followers: 19800 },
  { name: "Mar", followers: 21500 },
  { name: "Apr", followers: 23400 },
  { name: "May", followers: 25600 },
  { name: "Jun", followers: 28100 },
  { name: "Jul", followers: 30800 },
]

const engagementData = [
  { name: "Jan", likes: 4200, retweets: 820, replies: 340 },
  { name: "Feb", likes: 3800, retweets: 750, replies: 290 },
  { name: "Mar", likes: 5100, retweets: 940, replies: 410 },
  { name: "Apr", likes: 5800, retweets: 1020, replies: 480 },
  { name: "May", likes: 6300, retweets: 1150, replies: 520 },
  { name: "Jun", likes: 7100, retweets: 1280, replies: 590 },
  { name: "Jul", likes: 7800, retweets: 1420, replies: 650 },
]

const tweetPerformanceData = [
  { name: "Tweet 1", impressions: 25000 },
  { name: "Tweet 2", impressions: 18000 },
  { name: "Tweet 3", impressions: 32000 },
  { name: "Tweet 4", impressions: 16000 },
  { name: "Tweet 5", impressions: 28000 },
]

export default function TwitterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Twitter Analytics</h1>
        <p className="text-muted-foreground">Detailed metrics and insights for your Twitter account.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Followers</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground h-4 w-4"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">30.8K</div>
            <p className="text-xs text-muted-foreground">+9.6% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground h-4 w-4"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245.3K</div>
            <p className="text-xs text-muted-foreground">+12.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground h-4 w-4"
            >
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">+0.4% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Visits</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground h-4 w-4"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="10" r="3" />
              <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4K</div>
            <p className="text-xs text-muted-foreground">+7.8% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="tweets">Tweets</TabsTrigger>
          <TabsTrigger value="mentions">Mentions</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Follower Growth</CardTitle>
                <CardDescription>Total followers over time</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <Chart>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={followerData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="followers" stroke="#1DA1F2" />
                    </LineChart>
                  </ResponsiveContainer>
                </Chart>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Tweets</CardTitle>
                <CardDescription>Best performing tweets by impressions</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <Chart>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={tweetPerformanceData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="impressions" fill="#1DA1F2" />
                    </BarChart>
                  </ResponsiveContainer>
                </Chart>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>Likes, retweets, and replies over time</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <Chart>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={engagementData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="likes"
                      stackId="1"
                      stroke="#1DA1F2"
                      fill="#1DA1F2"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="retweets"
                      stackId="1"
                      stroke="#14171A"
                      fill="#14171A"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="replies"
                      stackId="1"
                      stroke="#657786"
                      fill="#657786"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Chart>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audience Demographics</CardTitle>
              <CardDescription>Age, gender, and location breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Select the Audience tab to view detailed audience demographics.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tweets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tweet Performance</CardTitle>
              <CardDescription>Detailed metrics for your tweets</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Select the Tweets tab to view detailed tweet performance metrics.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="mentions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mentions Analytics</CardTitle>
              <CardDescription>Analysis of mentions and replies</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Select the Mentions tab to view detailed mentions analytics.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
