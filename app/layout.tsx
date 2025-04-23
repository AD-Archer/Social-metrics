import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AccountProvider } from "@/context/account-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SocialMetrics - Social Media Analytics Dashboard",
  description: "Track and analyze your social media performance across multiple platforms.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AccountProvider>{children}</AccountProvider>
      </body>
    </html>
  )
}
