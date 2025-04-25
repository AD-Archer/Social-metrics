"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAccounts } from "@/context/account-context"
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

// Sample data for Twitch charts
const followerData = [
  { name: "Jan", followers: 8200 },
  { name: "Feb", followers: 9100 },
  { name: "Mar", followers: 10300 },
  { name: "Apr", followers: 11800 },
  { name: "May", followers: 13500 },
  { name: "Jun", followers: 15400 },
  { name: "Jul", followers: 17600 },
]

const viewerData = [
  { name: "Jan", viewers: 420, subscribers: 180 },
  { name: "Feb", viewers: 480, subscribers: 210 },
  { name: "Mar", viewers: 560, subscribers: 250 },
  { name: "Apr", viewers: 650, subscribers: 290 },
  { name: "May", viewers: 750, subscribers: 340 },
  { name: "Jun", viewers: 870, subscribers: 390 },
  { name: "Jul", viewers: 980, subscribers: 450 },
]

const streamData = [
  { name: "Stream 1", viewers: 1250, duration: 4.5 },
  { name: "Stream 2", viewers: 980, duration: 3.2 },
  { name: "Stream 3", viewers: 1420, duration: 5.0 },
  { name: "Stream 4", viewers: 860, duration: 2.8 },
  { name: "Stream 5", viewers: 1680, duration: 6.2 },
]

export default function TwitchPage() {
  const { isConnected } = useAccounts()
  const isTwitchConnected = isConnected("twitch")
  
  // Not connected state
  if (!isTwitchConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Twitch Analytics</h1>
          <p className="text-muted-foreground">Connect your Twitch account to view analytics.</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Not Connected</CardTitle>
            <CardDescription>
              You need to connect your Twitch account to view analytics and insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center p-6">
            <div className="rounded-full bg-muted p-6 mb-4">
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
                className="h-8 w-8 text-muted-foreground"
              >
                <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Connect Twitch</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Twitch account to access analytics, track growth, and measure engagement.
            </p>
            <Link href="/dashboard/settings?tab=connections">
              <Button className="w-full">Go to Settings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Connected state - show analytics
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Twitch Analytics</h1>
        <p className="text-muted-foreground">Detailed metrics and insights for your Twitch channel.</p>
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
            <div className="text-2xl font-bold">17.6K</div>
            <p className="text-xs text-muted-foreground">+14.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
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
              <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
              <path d="M1 21h22" />
              <path d="M8 21v-4" />
              <path d="M16 21v-4" />
              <path d="M12 21v-4" />
              <path d="M12 7v.01" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">450</div>
            <p className="text-xs text-muted-foreground">+15.4% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Viewers</CardTitle>
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
            <div className="text-2xl font-bold">980</div>
            <p className="text-xs text-muted-foreground">+12.6% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stream Hours</CardTitle>
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
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42.5</div>
            <p className="text-xs text-muted-foreground">+8.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="streams">Streams</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
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
                      <Line type="monotone" dataKey="followers" stroke="#6441A4" />
                    </LineChart>
                  </ResponsiveContainer>
                </Chart>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Stream Performance</CardTitle>
                <CardDescription>Average viewers per stream</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <Chart>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={streamData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="viewers" fill="#6441A4" />
                    </BarChart>
                  </ResponsiveContainer>
                </Chart>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Viewers & Subscribers</CardTitle>
              <CardDescription>Growth over time</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <Chart>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={viewerData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="viewers"
                      stackId="1"
                      stroke="#6441A4"
                      fill="#6441A4"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="subscribers"
                      stackId="2"
                      stroke="#B9A3E3"
                      fill="#B9A3E3"
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
        <TabsContent value="streams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stream Analytics</CardTitle>
              <CardDescription>Detailed metrics for your streams</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Select the Streams tab to view detailed stream performance metrics.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Subscriptions, bits, and donations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Select the Revenue tab to view detailed revenue analytics.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
