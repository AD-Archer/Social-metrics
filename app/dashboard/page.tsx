/**
 * Dashboard main page displaying YouTube RSS feed as the primary content.
 * Fetches recent YouTube videos from the user's configured RSS feed and displays them
 * on the main dashboard. Uses the RSS feed API with cookie authentication to ensure
 * proper authorization when fetching user data.
 */
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Youtube, ExternalLink, Settings, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useAccounts } from "@/context/account-context"
import { useToast } from "@/components/ui/use-toast"

// Define the structure of a YouTube feed item from the RSS API
interface RssFeedItem {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  guid?: string;
}

export default function DashboardPage() {
  const { accounts } = useAccounts()
  const [user, loadingAuth] = useAuthState(auth)
  const [mounted, setMounted] = useState(false)
  const [feedItems, setFeedItems] = useState<RssFeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rssConfigured, setRssConfigured] = useState(false)
  const { toast } = useToast()
  
  const youtubeAccount = accounts.find((a) => a.platform === "youtube" && a.connected)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch RSS feed when user auth state is resolved
  useEffect(() => {
    if (!loadingAuth && user) {
      const fetchRss = async () => {
        setIsLoading(true)
        setError(null)
        
        try {
          // First check if the user has configured an RSS URL
          const userDocRef = doc(db, "users", user.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            const rssUrl = userData?.connections?.youtubeRssUrl
            
            if (rssUrl) {
              setRssConfigured(true)
              
              // If RSS URL is configured, fetch feed from API
              // Using credentials: 'include' to send cookies
              const response = await fetch(`/api/youtube/rss?userId=${user.uid}`, {
                credentials: 'include',
                cache: 'no-store',
                headers: {
                  'Content-Type': 'application/json',
                }
              })
              
              if (!response.ok) {
                if (response.status === 400 && rssUrl.includes('@')) {
                  // Handle username format error
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
              
              const data = await response.json()
              
              // Sort items by date (newest first)
              const sortedItems = (data.items || []).sort((a: RssFeedItem, b: RssFeedItem) => {
                const dateA = a.isoDate ? new Date(a.isoDate).getTime() : 0
                const dateB = b.isoDate ? new Date(b.isoDate).getTime() : 0
                return dateB - dateA
              })
              
              setFeedItems(sortedItems)
            } else {
              setRssConfigured(false)
            }
          }
        } catch (err: any) {
          console.error("Failed to fetch YouTube RSS feed:", err)
          setError(err.message || "An unknown error occurred while fetching the feed")
        } finally {
          setIsLoading(false)
        }
      }
      
      fetchRss()
    }
  }, [user, loadingAuth, toast])

  // Helper function to format date strings
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  // Render loading state
  const renderLoading = () => (
    <div className="space-y-4 w-full">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
  
  // Render error state
  const renderError = () => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error fetching videos</AlertTitle>
      <AlertDescription>
        {error}
        <div className="mt-2">
          <Link href="/dashboard/settings?tab=connections" className="underline">
            Check your settings
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  )
  
  // Render the feed content
  const renderFeed = () => {
    if (isLoading) return renderLoading()
    if (error) return renderError()
    
    if (!rssConfigured) {
      return (
        <div className="text-center py-6">
          <p className="text-muted-foreground mb-4">
            You haven't configured your YouTube RSS feed URL yet.
          </p>
          <Link href="/dashboard/settings?tab=connections">
            <Button>Configure YouTube RSS Feed</Button>
          </Link>
        </div>
      )
    }
    
    if (feedItems.length === 0) {
      return (
        <div className="text-center py-6">
          <p className="text-muted-foreground">No videos found in your RSS feed.</p>
        </div>
      )
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="text-right">Published</TableHead>
            <TableHead className="w-[50px] text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedItems.map((item) => (
            <TableRow key={item.guid || item.link} className="group hover:bg-muted/50">
              <TableCell className="font-medium">{item.title || 'No Title'}</TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatDate(item.pubDate || item.isoDate)}
              </TableCell>
              <TableCell className="text-right">
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Watch on YouTube"
                    className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">View video</span>
                  </a>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  // Add gradient background and center content
  return (
    <div className="w-full flex flex-col items-center px-2">
      {/* Header */}
      <div className="mb-8 text-center animate-fade-in w-full max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">Social Dashboard</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Your YouTube content at a glance
        </p>
      </div>
      
      {/* YouTube Channel Status Card */}
      <div className="w-full max-w-4xl mb-6">
        <Card className="glass-card hover:scale-[1.01] transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-600" /> 
              YouTube Channel
            </CardTitle>
            {mounted && (
              <div className={`h-2 w-2 rounded-full ${youtubeAccount ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-2xl font-bold">
                  {youtubeAccount ? "Connected" : "No OAuth Connection"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {rssConfigured ? "RSS Feed Configured" : "RSS Feed Not Configured"}
                </p>
              </div>
              <Link href="/dashboard/settings?tab=connections">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Configure</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* RSS Feed Display */}
      <div className="w-full max-w-4xl animate-fade-in">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Videos</CardTitle>
            <CardDescription>
              Latest content from your YouTube channel
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderFeed()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
