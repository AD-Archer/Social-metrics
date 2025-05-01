/**
 * RootLayout: Defines the HTML structure and global providers for the app.
 * Sets up the theme, auth, and account context wrappers.
 * Exports a metadata configuration for SEO, Open Graph, and Twitter cards.
 */
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AccountProvider } from "@/context/account-context"
import { AuthProvider } from "@/context/auth-context"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SocialMetrics - Social Media Analytics Dashboard",
  description: "Track and analyze your social media performance across multiple platforms.",
  keywords: ["Social Media", "Analytics", "Dashboard", "YouTube", "Instagram", "Marketing", "Twitch", "Twitter"],
  authors: [{ name: "Antonio Archer", url: "https://antonioarcher.com" }],
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "SocialMetrics - Unified Social Media Dashboard",
    description: "View real-time analytics and insights across YouTube, and Twitch.",
    url: "https://socialmetrics.adarcher.app",
    siteName: "SocialMetrics",
    type: "website",
    images: [
      {
        url: "https://socialmetrics.adarcher.app/img/exampleimageofsite.png",
        width: 1200,
        height: 630,
        alt: "SocialMetrics Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SocialMetrics - Social Dashboard",
    description: "Consolidate your social media insights in one dashboard.",
    images: ["https://socialmetrics.adarcher.app/img/exampleimageofsite.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen w-full bg-background text-foreground animate-fade-in`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <AccountProvider>{children}</AccountProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
