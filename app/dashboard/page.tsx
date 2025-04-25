"use client"

import { Youtube } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Chart } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useAccounts } from "@/context/account-context"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

const overviewData = [
  { name: "Jan", youtube: 2400 },
  { name: "Feb", youtube: 1398 },
  { name: "Mar", youtube: 9800 },
  { name: "Apr", youtube: 3908 },
  { name: "May", youtube: 4800 },
  { name: "Jun", youtube: 3800 },
  { name: "Jul", youtube: 4300 },
]

export default function DashboardPage() {
  const { accounts } = useAccounts()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const youtubeAccount = accounts.find((account) => account.platform === "youtube")
  const isYoutubeConnected = youtubeAccount?.connected

  useEffect(() => {
    if (!isLoading && !isYoutubeConnected) {
      router.push("/welcome")
    }
  }, [isLoading, isYoutubeConnected, router])

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

  if (!isYoutubeConnected) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Checking account status...</h2>
          <p className="text-muted-foreground">Redirecting if necessary.</p>
        </div>
      </div>
    )
  }

  // YouTube-only dashboard view
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">YouTube Dashboard</h1>
        <p className="text-muted-foreground">Your YouTube analytics overview.</p>
      </div>

      {/* YouTube Account Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Youtube className="h-4 w-4" /> YouTube
            </CardTitle>
            <div className={`h-2 w-2 rounded-full ${isYoutubeConnected ? "bg-green-500" : "bg-gray-300"}`}></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{youtubeAccount?.followers?.toLocaleString() ?? "-"}</div>
            <p className="text-xs text-muted-foreground">Subscribers</p>
          </CardContent>
        </Card>
        {/* Add more YouTube-specific summary cards here if needed */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Youtube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{youtubeAccount?.views?.toLocaleString() ?? "-"}</div>
            <p className="text-xs text-muted-foreground">+18.7% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <Youtube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+14.2%</div>
            <p className="text-xs text-muted-foreground">+2.3% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="youtube" className="space-y-4">
        <TabsList>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
        </TabsList>
        <TabsContent value="youtube" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audience Growth</CardTitle>
              <CardDescription>Subscriber growth over time</CardDescription>
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
                    <Line type="monotone" dataKey="youtube" stroke="#FF0000" />
                  </LineChart>
                </ResponsiveContainer>
              </Chart>
            </CardContent>
          </Card>
          {/* Add more YouTube analytics cards here if needed */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
