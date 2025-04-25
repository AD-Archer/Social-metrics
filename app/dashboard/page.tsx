"use client"

import { Youtube } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Chart } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useAccounts } from "@/context/account-context"
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
  const [mounted, setMounted] = useState(false)
  const youtubeAccount = accounts.find((a) => a.platform === "youtube" && a.connected)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Add gradient background and center content
  return (
    <div className="w-full flex flex-col items-center px-2">
      {/* Header */}
      <div className="mb-8 text-center animate-fade-in w-full max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">Social Dashboard</h1>
        <p className="text-lg text-muted-foreground mt-2">Your YouTube analytics overview.</p>
      </div>
      {/* Cards with glassmorphism effect */}
      {youtubeAccount ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 w-full max-w-6xl mb-6 justify-center mx-auto">
            <Card className="glass-card hover:scale-[1.03] transition-transform duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Youtube className="h-4 w-4" /> YouTube
                </CardTitle>
                {mounted && (
                  <div className={`h-2 w-2 rounded-full bg-green-500`}></div>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold animate-count">{youtubeAccount.followers?.toLocaleString() ?? "-"}</div>
                <p className="text-xs text-muted-foreground">Subscribers</p>
              </CardContent>
            </Card>
            {/* Add more summary cards here if needed */}
          </div>
          <div className="grid gap-6 md:grid-cols-2 w-full max-w-4xl mb-6 justify-center mx-auto">
            <Card className="glass-card hover:scale-[1.03] transition-transform duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Youtube className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{youtubeAccount.views?.toLocaleString() ?? "-"}</div>
                <p className="text-xs text-muted-foreground">+18.7% from last month</p>
              </CardContent>
            </Card>
            <Card className="glass-card hover:scale-[1.03] transition-transform duration-200">
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
          <Tabs defaultValue="youtube" className="space-y-4 w-full max-w-4xl animate-fade-in">
            <TabsList>
              <TabsTrigger value="youtube">YouTube</TabsTrigger>
            </TabsList>
            <TabsContent value="youtube" className="space-y-4">
              <Card className="glass-card">
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
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="w-full max-w-2xl mx-auto text-center py-20">
          <h2 className="text-2xl font-semibold text-muted-foreground mb-4">No connected YouTube account</h2>
          <p className="text-muted-foreground mb-6">Connect your YouTube account in settings to see your dashboard analytics.</p>
        </div>
      )}
    </div>
  )
}
