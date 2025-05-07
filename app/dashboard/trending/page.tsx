/**
 * Trending Wikipedia Articles Dashboard for YouTubers.
 * Shows trending Wikipedia articles, lets users expand each for summary, image, facts, related topics, and pageview history.
 * Designed to help creators spot hot topics, brainstorm content, and identify unique video opportunities.
 * Uses Zustand for state, fetches extra data from Wikipedia APIs on demand.
 */
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ExternalLink, AlertCircle, BookOpen, ArrowLeft, Search, Lightbulb, BarChart2, ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useTrendingStore } from "@/store/trending-store"
import { AiIdeaPopup } from '@/components/ai-idea-popup';

interface ArticleDetails {
  summary?: string
  imageUrl?: string
  extract?: string
  pageviews?: number[]
  pageviewDates?: string[]
  related?: string[]
  length?: number
  isStub?: boolean
  loading: boolean
  error?: string
}

interface WikiPageviewItem {
  views: number
  timestamp: string
}

interface WikiSummaryData {
  extract?: string
  thumbnail?: {
    source: string
  }
  length?: number
}

interface WikiRelatedData {
  pages?: Array<{
    title: string
  }>
}

export function WikiDashboardPage() {
  const {
    trendingArticles,
    isLoading,
    error,
    selectedDate,
    fetchTrendingArticles,
    setSelectedDate,
  } = useTrendingStore();


  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [details, setDetails] = useState<Record<string, ArticleDetails>>({});
  const [aiPopupOpen, setAiPopupOpen] = useState(false);
  const [aiPopupTopic, setAiPopupTopic] = useState<string | null>(null);
  const [aiPopupSummary, setAiPopupSummary] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchTrendingArticles(selectedDate);
  }, [fetchTrendingArticles, selectedDate]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(event.target.value)
    const today = new Date();
    today.setHours(0,0,0,0); 
    
    if (newDate >= today) {
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        setSelectedDate(yesterday);
    } else {
        setSelectedDate(newDate);
    }
  };

  /**
   * Fetches Wikipedia summary, image, pageviews, and related articles for a given article.
   * Related articles are now fetched via the Next.js API route to avoid CORS issues.
   */
  const fetchArticleDetails = async (title: string) => {
    setDetails((prev) => ({ ...prev, [title]: { ...(prev[title] || {}), loading: true, error: undefined } }))
    try {
      // Summary & image
      const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
      const summaryData = await summaryRes.json() as WikiSummaryData
      // Pageviews (last 7 days)
      const today = new Date();
      const end = today.toISOString().split('T')[0].replace(/-/g, '');
      const startDate = new Date(today); startDate.setDate(today.getDate() - 6);
      const start = startDate.toISOString().split('T')[0].replace(/-/g, '');
      const pageviewsRes = await fetch(`https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/${encodeURIComponent(title)}/daily/${start}/${end}`)
      const pageviewsData = await pageviewsRes.json()
      // Related articles (via backend to avoid CORS)
      const relatedRes = await fetch(`/api/wikipedia/related?title=${encodeURIComponent(title)}`)
      const relatedData = await relatedRes.json() as WikiRelatedData
      // Detect stub/short
      const isStub = summaryData.extract ? summaryData.extract.length < 400 : undefined
      setDetails((prev) => ({
        ...prev,
        [title]: {
          summary: summaryData.extract,
          imageUrl: summaryData.thumbnail?.source,
          length: summaryData.length,
          isStub,
          pageviews: pageviewsData.items?.map((d: WikiPageviewItem) => d.views) || [],
          pageviewDates: pageviewsData.items?.map((d: WikiPageviewItem) => d.timestamp?.slice(0,8)) || [],
          related: relatedData.pages?.map((p) => p.title) || [],
          loading: false,
        }
      }))
    } catch (error) {
      console.error("Failed to fetch article details:", error);
      setDetails((prev) => ({ 
        ...prev, 
        [title]: { 
          ...(prev[title] || {}), 
          loading: false, 
          error: error instanceof Error ? error.message : 'Failed to load details.'
        } 
      }))
    }
  }

  const handleExpand = (title: string) => {
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }))
    if (!details[title]) fetchArticleDetails(title)
  }

  const renderLoading = () => (
    <div className="space-y-3">
      {[...Array(10)].map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )

  const renderError = () => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error Fetching Wikipedia Trends</AlertTitle>
      <AlertDescription>
        {error}
        <p className="mt-2">Please try again later or select a different date.</p>
      </AlertDescription>
    </Alert>
  )

  const renderTrendingArticles = () => {
    if (isLoading) return renderLoading()
    if (error) return renderError()

    if (trendingArticles.length === 0) {
      return (
        <p className="text-center text-muted-foreground py-6">
          No trending articles found for the selected date (after filtering).
        </p>
      )
    }

    return (
      <>
        <ul className="space-y-3">
          {trendingArticles.map((item) => {
            const d = details[item.article] || {}
            return (
              <li key={item.article} className="text-sm p-3 bg-card border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleExpand(item.article)} aria-label="Expand details">
                      {expanded[item.article] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    <a href={`https://en.wikipedia.org/wiki/${item.article.replace(/ /g, "_")}`} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <span className="font-semibold text-primary hover:underline">
                        {item.rank}. {item.article.replace(/_/g, " ")}
                      </span>
                    </a>
                    <p className="text-xs text-muted-foreground ml-2">{item.views.toLocaleString()} views</p>
                    {d.isStub && !d.loading && <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1"><Sparkles className="h-3 w-3" /> Content Gap</span>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(item.article.replace(/_/g, " "))}`, "_blank")} title="Search on Google">
                      <Search className="h-3.5 w-3.5 mr-1" />Google
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open(`https://en.wikipedia.org/wiki/${item.article.replace(/ /g, "_")}`, "_blank")} title="View on Wikipedia">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />Wikipedia
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAiPopupTopic(item.article.replace(/_/g, ' '));
                        setAiPopupSummary(d.summary || ''); // Always pass the latest summary/description
                        setAiPopupOpen(true);
                      }}
                      title="AI Video Idea"
                    >
                      <Lightbulb className="h-3.5 w-3.5 mr-1 text-fuchsia-500" />AI Idea
                    </Button>
                  </div>
                </div>
                {expanded[item.article] && (
                  <div className="mt-4 border-t pt-4 grid md:grid-cols-5 gap-4">
                    <div className="md:col-span-1 flex flex-col items-center">
                      {d.loading ? <Skeleton className="w-24 h-24 rounded-lg" /> : d.imageUrl ? (
                        <Image 
                          src={d.imageUrl} 
                          alt={item.article} 
                          width={96} 
                          height={96} 
                          className="w-24 h-24 object-cover rounded-lg border" 
                        />
                      ) : <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">No Image</div>}
                    </div>
                    <div className="md:col-span-2">
                      {d.loading ? <Skeleton className="h-16 w-full" /> : d.summary ? (
                        <p className="text-sm text-muted-foreground mb-2">{d.summary}</p>
                      ) : d.error ? <span className="text-destructive text-xs">{d.error}</span> : null}
                      {d.related && d.related.length > 0 && (
                        <div className="mt-2">
                          <span className="font-semibold text-xs">Related Topics:</span>
                          <ul className="flex flex-wrap gap-2 mt-1">
                            {d.related.slice(0, 5).map((rel) => (
                              <li key={rel} className="bg-muted px-2 py-1 rounded text-xs">
                                {rel}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2 flex flex-col items-center justify-center">
                      {d.loading ? <Skeleton className="h-20 w-full" /> : d.pageviews && d.pageviews.length > 0 ? (
                        <div className="w-full">
                          <span className="font-semibold text-xs">Views (last 7 days):</span>
                          <BarChart2 className="inline-block h-4 w-4 ml-1 text-blue-500" />
                          <div className="flex gap-1 mt-1">
                            {d.pageviews?.map((v, i) => (
                              <div key={i} className="h-8 w-4 bg-blue-200 dark:bg-blue-900 rounded" style={{ height: `${Math.max(8, v / Math.max(...(d.pageviews || [])) * 32)}px` }} title={v.toLocaleString()} />
                            ))}
                          </div>
                          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                            {d.pageviewDates && d.pageviewDates.length > 0 && (
                              <>
                                <span>{d.pageviewDates[0]?.replace(/(\d{4})(\d{2})(\d{2})/, '$2/$3')}</span>
                                <span>{d.pageviewDates[d.pageviewDates.length-1]?.replace(/(\d{4})(\d{2})(\d{2})/, '$2/$3')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
        <AiIdeaPopup
          open={aiPopupOpen}
          onOpenChange={setAiPopupOpen}
          topic={aiPopupTopic || ''}
          summary={aiPopupSummary}
        />
      </>
    )
  }
  
  const maxDate = new Date();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="gap-1 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <CardHeader className="px-0">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">
                Wikipedia Trending Articles
              </CardTitle>
              <CardDescription className="text-md">
                Discover what was popular on English Wikipedia. Data is updated daily.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <label htmlFor="date-picker" className="block text-sm font-medium text-muted-foreground mb-1">
            Select Date:
          </label>
          <input
            type="date"
            id="date-picker"
            value={selectedDate.toISOString().split("T")[0]}
            onChange={handleDateChange}
            max={maxDate.toISOString().split("T")[0]} // Prevent selecting today or future dates
            className="block w-full sm:w-auto p-2 border border-input rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm bg-transparent"
          />
           <p className="text-xs text-muted-foreground mt-1">
            Showing trends for: {selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {renderTrendingArticles()}
        </CardContent>
      </Card>
    </div>
  )
}

export { WikiDashboardPage as default }
