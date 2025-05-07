/**
 * Displays trending Wikipedia articles using a Zustand store for state management.
 * This page fetches and shows the top trending articles from English Wikipedia for a selected date.
 * It allows users to select a date and view corresponding trends, with options to search topics on Google or view them on Wikipedia.
 * The component relies on `useTrendingStore` for all its data and state management needs.
 */
"use client"

import { useEffect } from "react" // Removed useState
import Link from "next/link"
import { ExternalLink, AlertCircle, BookOpen, ArrowLeft, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useTrendingStore } from "@/store/trending-store" // Import the store

export default function WikiDashboardPage() {
  // Use state and actions from the Zustand store
  const {
    trendingArticles,
    isLoading,
    error,
    selectedDate,
    fetchTrendingArticles,
    setSelectedDate,
  } = useTrendingStore();

  // Fetch initial data when the component mounts or selectedDate changes
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
      <ul className="space-y-3">
        {trendingArticles.map((item) => (
          <li
            key={item.article}
            className="text-sm p-3 bg-card border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-between group">
              <div>
                <a
                  href={`https://en.wikipedia.org/wiki/${item.article.replace(/ /g, "_")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <span className="font-semibold text-primary hover:underline">
                    {item.rank}. {item.article.replace(/_/g, " ")}
                  </span>
                </a>
                <p className="text-xs text-muted-foreground">
                  {item.views.toLocaleString()} views
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(item.article.replace(/_/g, " "))}`, "_blank")}
                  title="Search on Google"
                >
                  <Search className="h-3.5 w-3.5 mr-1" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://en.wikipedia.org/wiki/${item.article.replace(/ /g, "_")}`, "_blank")}
                  title="View on Wikipedia"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> 
                  Wikipedia
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
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
