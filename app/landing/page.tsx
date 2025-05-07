/**
 * Landing page for SocialMetrics.
 * Visually engaging introduction to the platform, highlights core features, and drives user signups.
 * Uses a custom, modern multi-stop gradient background and glassmorphism overlays for a premium look.
 * Mentions Wikipedia API integration for trending content discovery.
 */
'use client'

import Link from "next/link"
import Image from "next/image"; // Import next/image
import { Button } from "@/components/ui/button"

// Custom gradient and glassmorphism for a more modern, unique hero section
export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f0abfc] via-40% to-[#a5b4fc] dark:from-[#181c2f] dark:via-[#3b0764] dark:to-[#1e293b]">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 z-0">
            <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-radial from-[#818cf8]/60 via-[#f0abfc]/40 to-transparent rounded-full blur-3xl opacity-80 animate-pulse" />
            <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-gradient-conic from-[#f472b6]/60 via-[#818cf8]/30 to-transparent rounded-full blur-2xl opacity-70 animate-spin-slow" />
            <div className="absolute bottom-0 left-1/2 w-[700px] h-[300px] bg-gradient-to-tr from-[#f0abfc]/40 via-[#818cf8]/30 to-transparent rounded-3xl blur-2xl opacity-60" />
          </div>
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 rounded-3xl shadow-2xl p-10 md:p-16 border border-white/30 dark:border-gray-800/60">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-xl bg-gradient-to-r from-blue-700 via-fuchsia-600 to-purple-700 bg-clip-text text-transparent">
                SocialMetrics
              </h1>
              <p className="mx-auto max-w-2xl text-lg md:text-2xl text-gray-800 dark:text-gray-100 mb-10 font-medium">
                The next-generation dashboard to track, analyze, and grow your social media presence with AI-powered insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 font-semibold shadow-lg">Get Started Free</Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="secondary" className="bg-white/80 text-blue-700 hover:bg-white font-semibold border border-white/70 shadow-lg">Learn More</Button>
                </Link>
              </div>
              <div className="flex justify-center mt-8">
                <Image src="/img/exampleimageofsite.png" alt="Dashboard preview" width={1024} height={768} className="rounded-xl shadow-2xl w-full max-w-3xl border-4 border-white/30" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-32 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-14 text-blue-700 dark:text-fuchsia-400">
              Why SocialMetrics?
            </h2>
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-xl">
                <div className="w-16 h-16 bg-blue-200 dark:bg-blue-900 rounded-full flex items-center justify-center mb-5 text-4xl">
                  📊
                </div>
                <h3 className="text-2xl font-bold mb-2">Unified Dashboard</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Connect and manage all your social media accounts (YouTube, Instagram, TikTok, Twitter, and more) from one place.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-green-100 via-white to-blue-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-xl">
                <div className="w-16 h-16 bg-green-200 dark:bg-green-900 rounded-full flex items-center justify-center mb-5 text-4xl">
                  📈
                </div>
                <h3 className="text-2xl font-bold mb-2">AI-Powered Analytics</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Get actionable insights, growth tips, and content ideas from our integrated AI assistant trained on social media best practices.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-purple-100 via-white to-fuchsia-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-xl">
                <div className="w-16 h-16 bg-purple-200 dark:bg-purple-900 rounded-full flex items-center justify-center mb-5 text-4xl">
                  💡
                </div>
                <h3 className="text-2xl font-bold mb-2">Trending Content Discovery</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Instantly discover trending topics from Wikipedia and more, powered by the Wikipedia API, so you never miss a viral moment.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-yellow-100 via-white to-blue-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-xl">
                <div className="w-16 h-16 bg-yellow-200 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-5 text-4xl">
                  🔒
                </div>
                <h3 className="text-2xl font-bold mb-2">Secure & Private</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Sign in with Google. Your data is protected with industry-standard security and never shared.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-fuchsia-100 via-white to-blue-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-xl">
                <div className="w-16 h-16 bg-fuchsia-200 dark:bg-fuchsia-900 rounded-full flex items-center justify-center mb-5 text-4xl">
                  ⚡️
                </div>
                <h3 className="text-2xl font-bold mb-2">Modern UI/UX</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Enjoy a beautiful, fast, and responsive interface with animated gradients and glassmorphism cards.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-blue-100 via-white to-green-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-xl">
                <div className="w-16 h-16 bg-blue-200 dark:bg-blue-900 rounded-full flex items-center justify-center mb-5 text-4xl">
                  ⚙️
                </div>
                <h3 className="text-2xl font-bold mb-2">Customizable & Extensible</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Personalize your dashboard, manage your feeds, and tailor the experience to your workflow.
                </p>
              </div>
            </div>
            <div className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
              <span>
                SocialMetrics integrates with the Wikipedia API to surface real-time trending topics, helping you create timely and relevant content.
              </span>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="w-full py-20 md:py-32 border-t bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-950">
          <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-4xl font-bold tracking-tight md:text-5xl text-blue-700 dark:text-fuchsia-400">
                Ready to Boost Your Social Presence?
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-300">
                Sign up today and take control of your social media strategy with SocialMetrics.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Link href="/signup">
                 <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white font-bold shadow-lg">Sign Up Now</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex items-center justify-center w-full h-24 border-t bg-white/80 dark:bg-gray-900/80">
        <p className="text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} SocialMetrics. All rights reserved.</p>
      </footer>
    </div>
  )
}

export { LandingPage as default };

