/**
 * Dashboard main page displaying YouTube RSS feed and Wikipedia trending articles.
 * Enhanced with modern UI: animated gradient background, glassmorphism cards, improved spacing, and visual accents.
 * Uses existing UI components and Tailwind utilities for a polished, professional look.
 */
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Youtube, ExternalLink, Settings, AlertCircle, BookOpen, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useAccounts } from "@/context/account-context"
import { useToast } from "@/components/ui/use-toast"
import { YoutubeAIChat } from "@/components/ai-chat"

// Define the structure for a Wikipedia trending article
interface WikipediaTrendingItem {
  article: string;
  views: number;
  rank: number;
}

export default function DashboardPage() {
  const { accounts } = useAccounts()
  const [user, loadingAuth] = useAuthState(auth)
  const [mounted, setMounted] = useState(false)
  const [rssConfigured, setRssConfigured] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // State for Wikipedia Trending
  const [trendingWikipediaArticles, setTrendingWikipediaArticles] = useState<WikipediaTrendingItem[]>([])
  const [isLoadingWikipedia, setIsLoadingWikipedia] = useState(true)
  const [wikipediaError, setWikipediaError] = useState<string | null>(null)
  
  const { toast } = useToast()
  
  const youtubeAccount = accounts.find((a) => a.platform === "youtube" && a.connected)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch RSS feed when user auth state is resolved
  useEffect(() => {
    if (!loadingAuth && user) {
      const fetchRss = async () => {
        setError(null)
        try {
          // First check if the user has configured an RSS URL
          const userDocRef = doc(db, "users", user.uid)
          const userDoc = await getDoc(userDocRef)
          if (userDoc.exists()) {
            const userData = userDoc.data()
            const rssUrl = userData?.connections?.youtubeRssUrl
            // Validate RSS URL format before considering it configured
            const isValidRssUrl =
              typeof rssUrl === "string" &&
              rssUrl.length > 0 &&
              rssUrl.includes("youtube.com/feeds/videos.xml") &&
              rssUrl.includes("channel_id=") &&
              !rssUrl.includes("@")
            if (isValidRssUrl) {
              setRssConfigured(true)
              // If RSS URL is configured, fetch feed from API using the rssUrl
              const encodedRssUrl = encodeURIComponent(rssUrl);
              const response = await fetch(`/api/youtube/rss?rssUrl=${encodedRssUrl}`, {
                cache: 'no-store',
                headers: {
                  'Content-Type': 'application/json',
                }
              })
              if (!response.ok) {
                if (response.status === 400 && rssUrl.includes('@')) {
                  const data = await response.json()
                  if (data.extractedUsername) {
                    toast({
                      title: "Invalid RSS URL format",
                      description: `The URL you provided is not in the correct RSS format. You need to use the Channel ID format.`,
                      variant: "destructive"
                    })
                    throw new Error(`You need to use the YouTube RSS format with channel_id. Check settings for more info.`)
                  }
                }
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
              }
              await response.json() // We don't need to store the items anymore
            } else {
              setRssConfigured(false)
            }
          }
        } catch (err: unknown) {
          console.error("Failed to fetch YouTube RSS feed:", err);
          setError(err instanceof Error ? err.message : "An unknown error occurred while fetching the feed");
          toast({
            title: "Error",
            description: err instanceof Error ? err.message : "An unknown error occurred while fetching the feed",
            variant: "destructive"
          })
        }
      }
      fetchRss()
    }
  }, [user, loadingAuth, toast])

  // Fetch Wikipedia trending articles
  useEffect(() => {
    const fetchWikipediaTrends = async () => {
      setIsLoadingWikipedia(true)
      setWikipediaError(null)
      try {
        // Get yesterday's date for the API call
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const year = yesterday.getFullYear()
        const month = (yesterday.getMonth() + 1).toString().padStart(2, '0')
        const day = yesterday.getDate().toString().padStart(2, '0')

        const response = await fetch(`https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${year}/${month}/${day}`)
        
        if (!response.ok) {
          throw new Error(`Wikimedia API error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.items && data.items.length > 0 && data.items[0].articles) {
          // Limit to top 10 articles for the dashboard
          setTrendingWikipediaArticles(data.items[0].articles.slice(0, 10))
        } else {
          setTrendingWikipediaArticles([])
        }
      } catch (err: unknown) {
        console.error("Failed to fetch Wikipedia trending articles:", err);
        setWikipediaError(err instanceof Error ? err.message : "An unknown error occurred while fetching Wikipedia trends");
      } finally {
        setIsLoadingWikipedia(false)
      }
    }
    
    fetchWikipediaTrends()
  }, [])

  // Render Wikipedia trending articles
  const renderWikipediaTrends = () => {
    if (isLoadingWikipedia) {
      return (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      )
    }
    
    if (wikipediaError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error fetching Wikipedia trends</AlertTitle>
          <AlertDescription>{wikipediaError}</AlertDescription>
        </Alert>
      )
    }
    
    if (trendingWikipediaArticles.length === 0) {
      return <p className="text-sm text-muted-foreground">No trending articles found for yesterday.</p>
    }
    
    return (
      <ul className="space-y-2">
        {trendingWikipediaArticles.map((item) => (
          <li key={item.article} className="text-sm">
            <a
              href={`https://en.wikipedia.org/wiki/${item.article.replace(/ /g, '_')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-primary flex items-center justify-between group"
            >
              <span>{item.rank}. {item.article.replace(/_/g, ' ')}</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </li>
        ))}
      </ul>
    )
  }

  // Add gradient background and center content
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center px-2 pb-10 overflow-x-hidden">
      {/* Animated gradient background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 animate-gradient-move bg-gradient-to-br from-blue-100/60 via-fuchsia-100/40 to-emerald-100/60 dark:from-[#232946] dark:via-[#1a1a2e] dark:to-[#0f172a] blur-2xl opacity-80"
      />

      {/* Header */}
      <div className="relative z-10 mb-10 text-center w-full max-w-3xl mx-auto animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary drop-shadow-lg">
          <span className="bg-gradient-to-r from-blue-600 via-fuchsia-500 to-emerald-500 bg-clip-text text-transparent">Social Metrics</span>
        </h1>
        <p className="text-lg text-muted-foreground mt-2 font-medium">
          Your YouTube content at a glance
        </p>
      </div>

      {/* Notifier for more YouTube stats */}
      <div className="w-full max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-center bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3 gap-2 text-blue-900 dark:text-blue-200 text-sm font-medium shadow-sm">
          <Info className="h-4 w-4 text-blue-500 dark:text-blue-300" />
          For detailed YouTube analytics and trends, visit the <Link href="/dashboard/youtube" className="underline hover:text-blue-700 dark:hover:text-blue-100 transition">YouTube Dashboard</Link>.
        </div>
      </div>

      {/* YouTube Channel Status Card */}
      <div className="relative z-10 w-full max-w-4xl mb-8">
        <Card className="glass-card shadow-xl border border-primary/10 backdrop-blur-md bg-white/70 dark:bg-[#18181b]/70 hover:scale-[1.01] transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-600 animate-pulse" />
              YouTube Channel
            </CardTitle>
            {mounted && (
              <div className={`h-2 w-2 rounded-full ${youtubeAccount ? 'bg-green-500' : 'bg-yellow-500'} shadow`}></div>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {youtubeAccount ? (
                    <span className="text-green-600">Connected</span>
                  ) : (
                    <span className="text-yellow-600">No OAuth Connection</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {rssConfigured ? (
                    <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400"><span className="h-2 w-2 rounded-full bg-green-400 inline-block" />RSS Feed Configured</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-yellow-700 dark:text-yellow-400"><span className="h-2 w-2 rounded-full bg-yellow-400 inline-block" />RSS Feed Not Configured</span>
                  )}
                </p>
                {error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>RSS Feed Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
              <Link href="/dashboard/settings?tab=connections">
                <Button variant="outline" size="sm" className="gap-2 shadow">
                  <Settings className="h-4 w-4" />
                  <span>Configure</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* YouTube AI Chat Component */}
      {youtubeAccount && rssConfigured && (
        <div className="relative z-10 w-full max-w-4xl animate-fade-in mb-8">
          <YoutubeAIChat />
        </div>
      )}


      {/* Wikipedia Trending Card */}
      <div className="relative z-10 w-full max-w-4xl animate-fade-in">
        <Card className="glass-card shadow-lg border border-primary/10 backdrop-blur-md bg-white/80 dark:bg-[#18181b]/80 hover:scale-[1.01] transition-transform duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              Wikipedia Daily Trends
            </CardTitle>
            <CardDescription>
              Need Recommendations on what to make? find the top 10 trending articles on English Wikipedia from yesterday.
              <Link href="/dashboard/trending" className="ml-2 text-sm text-blue-500 hover:underline">
                View more
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg">
              {renderWikipediaTrends()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
