/**
 * RootLayout: Defines the HTML structure and global providers for the app.
 * Sets up the theme, auth, and account context wrappers.
 * Exports a metadata configuration for SEO, Open Graph, and Twitter cards.
 * Added JSON-LD structured data for Person schema to provide information about the site creator.
 * Updated the favicon to use /logo.webp.
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
  title: "SocialMetrics - Social Media Analytics Dashboard for Streamers",
  description: "Track and analyze your social media performance across multiple platforms.",
  keywords: ["Social Media", "Analytics", "Dashboard", "YouTube", "Instagram", "Marketing", "Twitch", "Twitter", "Antonio Archer"],
  authors: [{ name: "Antonio Archer", url: "https://www.antonioarcher.com" }],
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "SocialMetrics - Unified Social Media Dashboard for Streamers",
    description: "View real-time analytics and insights across YouTube, and Twitch for Streamers.",
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
    title: "SocialMetrics - Social Dashboard for Streamers",
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
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://socialmetrics.adarcher.app",
            "name": "SocialMetrics",
            "description": "Track and analyze your social media performance across multiple platforms.",
            "publisher": {
              "@type": "Organization",
              "name": "SocialMetrics",
              "url": "https://socialmetrics.adarcher.app",
              "logo": "https://socialmetrics.adarcher.app/icon.png"
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "SocialMetrics",
            "url": "https://socialmetrics.adarcher.app",
            "logo": "https://socialmetrics.adarcher.app/icon.png",
            "sameAs": [
              "https://twitter.com/socialmetrics",
              "https://www.linkedin.com/company/socialmetrics"
            ]
          })}
        </script>
        <script
          id="json-ld-person"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Antonio Archer",
              "url": "https://www.antonioarcher.com",
              "image": "https://www.antonioarcher.com/logo.webp",
              "jobTitle": "Software Developer & DevOps Engineer",
              "worksFor": {
                "@type": "Organization",
                "name": "Self-employed",
              },
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Philadelphia",
                "addressRegion": "PA",
                "addressCountry": "US",
              },
              "sameAs": [
                "https://www.github.com/ad-archer",
                "https://www.linkedin.com/in/antonio-archer",
                "https://www.twitter.com/ad_archer_",
                "https://www.linktr.ee/adarcher",
                "https://www.adarcher.app",
                "https://www.youtube.com/@ad-archer",
                "https://www.instagram.com/Antonio_DArcher",
              ],
            }),
          }}
        />
      </head>
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
