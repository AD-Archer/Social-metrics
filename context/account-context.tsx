"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"

// Define the shape of a connected account
export type SocialAccount = {
  platform: "instagram" | "youtube" | "tiktok" | "twitch" | "twitter"
  connected: boolean
  username?: string
  profileUrl?: string
  followers?: number
  engagement?: number
  views?: number
  lastUpdated?: string
}

// Define the context shape
type AccountContextType = {
  accounts: SocialAccount[]
  connectAccount: (platform: SocialAccount["platform"]) => void
  disconnectAccount: (platform: SocialAccount["platform"]) => void
  isConnected: (platform: SocialAccount["platform"]) => boolean
  getAccount: (platform: SocialAccount["platform"]) => SocialAccount | undefined
}

// Create the context with default values
const AccountContext = createContext<AccountContextType>({
  accounts: [],
  connectAccount: () => {},
  disconnectAccount: () => {},
  isConnected: () => false,
  getAccount: () => undefined,
})

// Initial accounts data
const initialAccounts: SocialAccount[] = [
  {
    platform: "instagram",
    connected: false,
    username: "socialmetrics",
    profileUrl: "/placeholder.svg?height=50&width=50",
    followers: 21500,
    engagement: 4.8,
    views: 45200,
    lastUpdated: "2025-04-23",
  },
  {
    platform: "youtube",
    connected: false,
    username: "SocialMetrics",
    profileUrl: "/placeholder.svg?height=50&width=50",
    followers: 42300,
    engagement: 3.2,
    views: 312000,
    lastUpdated: "2025-04-23",
  },
  {
    platform: "tiktok",
    connected: false,
    username: "@socialmetrics",
    profileUrl: "/placeholder.svg?height=50&width=50",
    followers: 112800,
    engagement: 5.6,
    views: 6200000,
    lastUpdated: "2025-04-23",
  },
  {
    platform: "twitch",
    connected: false,
    username: "socialmetrics",
    profileUrl: "/placeholder.svg?height=50&width=50",
    followers: 17600,
    engagement: 7.2,
    views: 980,
    lastUpdated: "2025-04-23",
  },
  {
    platform: "twitter",
    connected: false,
    username: "@socialmetrics",
    profileUrl: "/placeholder.svg?height=50&width=50",
    followers: 30800,
    engagement: 3.2,
    views: 245300,
    lastUpdated: "2025-04-23",
  },
]

// Create the provider component
export function AccountProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); // Removed isLinkedWithProvider as it's no longer in AuthContext
  // Initialize state from localStorage if available, otherwise use initialAccounts
  const [accounts, setAccounts] = useState<SocialAccount[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("socialmetrics-accounts")
      return saved ? JSON.parse(saved) : initialAccounts
    }
    return initialAccounts
  })

  // Save to localStorage whenever accounts change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("socialmetrics-accounts", JSON.stringify(accounts))
    }
  }, [accounts])

  // Connect an account
  const connectAccount = (platform: SocialAccount["platform"]) => {
    setAccounts((prevAccounts) =>
      prevAccounts.map((account) => (account.platform === platform ? { ...account, connected: true } : account)),
    )
  }

  // Disconnect an account
  const disconnectAccount = (platform: SocialAccount["platform"]) => {
    setAccounts((prevAccounts) =>
      prevAccounts.map((account) => (account.platform === platform ? { ...account, connected: false } : account)),
    )
  }

  // Check if an account is connected
  const isConnected = (platform: SocialAccount["platform"]) => {
    return accounts.find((account) => account.platform === platform)?.connected || false
  }

  // Get account details
  const getAccount = (platform: SocialAccount["platform"]) => {
    return accounts.find((account) => account.platform === platform)
  }

  return (
    <AccountContext.Provider
      value={{
        accounts,
        connectAccount,
        disconnectAccount,
        isConnected,
        getAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

// Custom hook to use the account context
export function useAccounts() {
  const context = useContext(AccountContext)
  if (context === undefined) {
    throw new Error("useAccounts must be used within an AccountProvider")
  }
  return context
}
