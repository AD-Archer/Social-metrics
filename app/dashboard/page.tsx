"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PlusCircle, Instagram, Youtube, TwitterIcon, Twitch, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Chart } from "@/components/ui/chart"
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
import { Button } from "@/components/ui/button"
import { useAccounts } from "@/context/account-context"

// Sample data for charts
const overviewData = [
  { name: "Jan", instagram: 4000, youtube: 2400, tiktok: 2400, twitch: 1200, twitter: 3200 },
  { name: "Feb", instagram: 3000, youtube: 1398, tiktok: 2800, twitch: 900, twitter: 2900 },
  { name: "Mar", instagram: 2000, youtube: 9800, tiktok: 3200, twitch: 1700, twitter: 2300 },
  { name: "Apr", instagram: 2780, youtube: 3908, tiktok: 3800, twitch: 2300, twitter: 2600 },
  { name: "May", instagram: 1890, youtube: 4800, tiktok: 4300, twitch: 2800, twitter: 3800 },
  { name: "Jun", instagram: 2390, youtube: 3800, tiktok: 5200, twitch: 3200, twitter: 4300 },
  { name: "Jul", instagram: 3490, youtube: 4300, tiktok: 6200, twitch: 3800, twitter: 5200 },
]

const engagementData = [
  { name: "Instagram", value: 35 },
  { name: "YouTube", value: 25 },
  { name: "TikTok", value: 20 },
  { name: "Twitch", value: 10 },
  { name: "Twitter", value: 10 },
]

const platformColors = {
  instagram: "#E1306C",
  youtube: "#FF0000",
  tiktok: "#000000",
  twitch: "#6441A4",
  twitter: "#1DA1F2",
}

export default function DashboardPage() {
  const { accounts } = useAccounts()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const connectedAccounts = accounts.filter((account) => account.connected)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading your dashboard...</h2>
          <p className="text-muted-foreground">Please wait while we fetch your data.</p>
        </div>
      </div>
    )
  }

  if (connectedAccounts.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Connect your social media accounts to see your analytics.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>No Accounts Connected</CardTitle>
              <CardDescription>Connect your social media accounts to start tracking your analytics.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center p-6">
              <div className="rounded-full bg-muted p-6 mb-4">
                <PlusCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Connect Your First Account</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your social media accounts to see analytics, track growth, and measure engagement.
              </p>
              <Link href="/dashboard/settings">
                <Button className="w-full">Go to Settings</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Demo Data Available</CardTitle>
              <CardDescription>You can explore the dashboard with demo data to see how it works.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center p-6">
              <div className="rounded-full bg-muted p-6 mb-4">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">View Demo Analytics</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Explore sample analytics data to see how the dashboard works with connected accounts.
              </p>
              <Button variant="outline" className="w-full">
                View Demo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>Learn how to connect your accounts and use the dashboard.</CardDescription>
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
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Getting Started Guide</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Check out our documentation to learn how to connect your accounts and use the dashboard.
              </p>
              <Button variant="outline" className="w-full">
                View Guide
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Regular dashboard view with connected accounts
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your social media analytics overview across all platforms.</p>
      </div>

      {/* Connected Accounts Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {accounts.map((account) => {
          const platformIcons = {
            instagram: <Instagram className="h-4 w-4" />,
            youtube: <Youtube className="h-4 w-4" />,
            tiktok: <BarChart3 className="h-4 w-4" />,
            twitch: <Twitch className="h-4 w-4" />,
            twitter: <TwitterIcon className="h-4 w-4" />,
          }

          return (
            <Card key={account.platform} className={!account.connected ? "opacity-50" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize flex items-center gap-2">
                  {platformIcons[account.platform as keyof typeof platformIcons]}
                  {account.platform}
                </CardTitle>
                <div className={`h-2 w-2 rounded-full ${account.connected ? "bg-green-500" : "bg-gray-300"}`}></div>
              </CardHeader>
              <CardContent>
                {account.connected ? (
                  <>
                    <div className="text-2xl font-bold">{account.followers?.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </>
                ) : (
                  <Link href="/dashboard/settings">
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Connect
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
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
            <div className="text-2xl font-bold">
              {connectedAccounts.reduce((sum, account) => sum + (account.followers || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
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
            <div className="text-2xl font-bold">345.6K</div>
            <p className="text-xs text-muted-foreground">+8.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
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
            <div className="text-2xl font-bold">
              {connectedAccounts.reduce((sum, account) => sum + (account.views || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+18.7% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
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
              <path d="m22 7-8.5 8.5-5-5L2 17" />
              <path d="M16 7h6v6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+14.2%</div>
            <p className="text-xs text-muted-foreground">+2.3% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Platforms</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
          <TabsTrigger value="tiktok">TikTok</TabsTrigger>
          <TabsTrigger value="twitch">Twitch</TabsTrigger>
          <TabsTrigger value="twitter">Twitter</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Audience Growth</CardTitle>
                <CardDescription>Follower growth across all platforms over time</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <Chart>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={overviewData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {connectedAccounts.map((account) => (
                        <Line
                          key={account.platform}
                          type="monotone"
                          dataKey={account.platform}
                          stroke={platformColors[account.platform as keyof typeof platformColors]}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </Chart>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Engagement Distribution</CardTitle>
                <CardDescription>Percentage of engagement by platform</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <Chart>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={engagementData.filter((item) =>
                        connectedAccounts.some((account) => account.platform === item.name.toLowerCase()),
                      )}
                      margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Chart>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>Views and engagement metrics across all platforms</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <Chart>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={overviewData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {connectedAccounts.map((account) => (
                      <Area
                        key={account.platform}
                        type="monotone"
                        dataKey={account.platform}
                        stackId="1"
                        stroke={platformColors[account.platform as keyof typeof platformColors]}
                        fill={platformColors[account.platform as keyof typeof platformColors]}
                        fillOpacity={0.6}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </Chart>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="instagram" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Instagram Analytics</CardTitle>
              <CardDescription>Detailed metrics for your Instagram account</CardDescription>
            </CardHeader>
            <CardContent>
              {accounts.find((a) => a.platform === "instagram")?.connected ? (
                <p className="text-sm text-muted-foreground">View detailed analytics for your Instagram account.</p>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your Instagram account to view detailed analytics.
                  </p>
                  <Link href="/dashboard/settings">
                    <Button>Connect Instagram</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="youtube" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>YouTube Analytics</CardTitle>
              <CardDescription>Detailed metrics for your YouTube channel</CardDescription>
            </CardHeader>
            <CardContent>
              {accounts.find((a) => a.platform === "youtube")?.connected ? (
                <p className="text-sm text-muted-foreground">View detailed analytics for your YouTube channel.</p>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your YouTube account to view detailed analytics.
                  </p>
                  <Link href="/dashboard/settings">
                    <Button>Connect YouTube</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tiktok" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>TikTok Analytics</CardTitle>
              <CardDescription>Detailed metrics for your TikTok account</CardDescription>
            </CardHeader>
            <CardContent>
              {accounts.find((a) => a.platform === "tiktok")?.connected ? (
                <p className="text-sm text-muted-foreground">View detailed analytics for your TikTok account.</p>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your TikTok account to view detailed analytics.
                  </p>
                  <Link href="/dashboard/settings">
                    <Button>Connect TikTok</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="twitch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Twitch Analytics</CardTitle>
              <CardDescription>Detailed metrics for your Twitch channel</CardDescription>
            </CardHeader>
            <CardContent>
              {accounts.find((a) => a.platform === "twitch")?.connected ? (
                <p className="text-sm text-muted-foreground">View detailed analytics for your Twitch channel.</p>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your Twitch account to view detailed analytics.
                  </p>
                  <Link href="/dashboard/settings">
                    <Button>Connect Twitch</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="twitter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Twitter Analytics</CardTitle>
              <CardDescription>Detailed metrics for your Twitter account</CardDescription>
            </CardHeader>
            <CardContent>
              {accounts.find((a) => a.platform === "twitter")?.connected ? (
                <p className="text-sm text-muted-foreground">View detailed analytics for your Twitter account.</p>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your Twitter account to view detailed analytics.
                  </p>
                  <Link href="/dashboard/settings">
                    <Button>Connect Twitter</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
