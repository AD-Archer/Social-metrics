import { ArrowRight, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex flex-col">
      <div className="container mx-auto flex-1 flex flex-col justify-center items-center px-4 py-12">
        <div className="flex flex-col items-center mb-10">
          <div className="rounded-full bg-white shadow-lg p-2 mb-4">
            {/* Use SM icon as logo */}
            <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-4xl text-primary-foreground font-extrabold border-4 border-indigo-200">
              SM
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-3 text-center drop-shadow-sm">
            Welcome to SocialMetrics!
          </h1>
          <p className="text-lg text-gray-600 text-center max-w-xl mb-2">
            Your all-in-one dashboard for Social Media analytics. Connect your account and unlock powerful insights.
          </p>
        </div>

        <div className="w-full max-w-2xl">
          <div className="mb-8 flex flex-col items-center">
            <div className="flex items-center gap-2 text-base text-indigo-600 font-medium bg-indigo-50 rounded-full px-4 py-1 mb-2">
              <span>Step 1</span>
              <span className="w-1 h-1 bg-indigo-400 rounded-full" />
              <span>Connect your YouTube account</span>
            </div>
            <span className="text-sm text-gray-400">You can add more accounts later from settings.</span>
          </div>

          <div className="grid gap-6 md:grid-cols-1">
            {/* YouTube Only */}
            <Card className="transition-transform hover:scale-105 hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Youtube className="mr-2 text-red-500" /> YouTube
                </CardTitle>
                <CardDescription>Monitor subscribers, views, and watch time.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/settings">
                  <Button className="w-full" variant="outline">Connect YouTube</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-14 text-center">
          <div className="flex flex-col items-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-lg hover:from-indigo-600 hover:to-pink-600">
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="text-sm text-gray-400">
              You can connect your account later from the dashboard settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
