'use client'

// Landing page

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none mb-4">
              Welcome to SocialMetrics
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl mb-8">
              Your all-in-one dashboard to track, analyze, and grow your social media presence across all platforms.
            </p>
            <div className="space-x-4">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">Get Started</Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="text-blue-600 border-white hover:bg-white hover:text-blue-600">Learn More</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl mb-12">
              Features
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                {/* Placeholder for an icon */}
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Unified Dashboard</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Connect and manage all your social media accounts (Instagram, TikTok, Twitter, etc.) from one place.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                {/* Placeholder for an icon */}
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">📈</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Performance Analytics</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Gain valuable insights into your audience engagement, content performance, and follower growth.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                {/* Placeholder for an icon */}
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">💡</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Simple Interface</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Enjoy a clean, intuitive user experience designed for efficiency and ease of use.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Boost Your Social Presence?
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Sign up today and take control of your social media strategy with SocialMetrics.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Link href="/signup">
                 <Button size="lg" className="w-full">Sign Up Now</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Assuming a shared footer might be in layout.tsx */}
      <footer className="flex items-center justify-center w-full h-24 border-t">
        <p className="text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} SocialMetrics. All rights reserved.</p>
      </footer>
    </div>
  )
}
