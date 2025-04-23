import Link from "next/link"
import { ArrowRight, Instagram, Youtube, TwitterIcon as TikTok, Twitch, Twitter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function WelcomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Welcome to SocialMetrics</h1>
      <p className="text-xl mb-8">Connect your social media accounts to get started tracking your analytics.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Instagram className="mr-2" /> Instagram
            </CardTitle>
            <CardDescription>Connect your Instagram account to track followers, engagement, and more.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Connect Instagram</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Youtube className="mr-2" /> YouTube
            </CardTitle>
            <CardDescription>Link your YouTube channel to monitor subscribers, views, and watch time.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Connect YouTube</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TikTok className="mr-2" /> TikTok
            </CardTitle>
            <CardDescription>Add your TikTok account to track followers, likes, and video performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Connect TikTok</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Twitch className="mr-2" /> Twitch
            </CardTitle>
            <CardDescription>
              Connect your Twitch channel to monitor followers, subscribers, and stream stats.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Connect Twitch</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Twitter className="mr-2" /> Twitter
            </CardTitle>
            <CardDescription>
              Link your Twitter profile to track followers, engagement, and tweet performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Connect Twitter</Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            You can connect your accounts later from the dashboard settings.
          </p>
        </div>
      </div>
    </div>
  )
}
