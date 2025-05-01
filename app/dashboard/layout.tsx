'use client'
/**
 * Dashboard layout component that provides the main navigation structure.
 * Includes responsive sidebar for navigation, header with user controls,
 * and handles protected routes with authentication.
 * Mobile-optimized with collapsible sidebar and responsive design patterns.
 * The sidebar is fixed on desktop screens.
 */

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, LogOut, Menu, Settings, User, Youtube, ChevronDown, Bell, X } from "lucide-react"
import Head from 'next/head'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/context/auth-context"
import { useIsMobile } from '@/components/ui/use-mobile'


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const { toasts, toast } = useToast()
  const [userName, setUserName] = useState("User")
  const isMobile = useIsMobile()

  // Automatically open mobile nav on small screens
  useEffect(() => {
    if (!isMobile && isMobileNavOpen) {
      setIsMobileNavOpen(false)
    }
  }, [isMobile, isMobileNavOpen])

  // Set user display name and photo URL when user data is available
  useEffect(() => {
    if (user) {
      setUserName(user.displayName || user.email?.split('@')[0] || "User")
    }
  }, [user])

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Logged out successfully",
        variant: "default"
      })
      router.push("/")
    } catch (error: unknown) {
      console.error("Logout failed:", error);
      toast({
        title: "Error logging out",
        description: "Please try again",
        variant: "destructive"
      })
    }
  }

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: Home },
    { name: "YouTube", href: "/dashboard/youtube", icon: Youtube },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  // Local SM logo for dashboard header only
  const DashboardHeaderSMLogo = ({ className = "" }: { className?: string }) => (
    <div className={`rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center border border-indigo-300 ${className}`}>
      <span className="text-sm font-bold text-white leading-none select-none">SM</span>
    </div>
  )

  return (
    <>
      <Head>
        <title>SocialMetrics Dashboard</title>
        <meta name="description" content="Unified dashboard for social media metrics including YouTube, Instagram, and more." />
        <meta property="og:title" content="SocialMetrics Dashboard" />
        <meta property="og:description" content="View real-time analytics and insights across social platforms in one place." />
        <meta property="og:url" content="https://socialmetrics.adarcher.app/landing" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col">
          <ToastProvider>
            <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/80 glass-card px-4 md:px-6 backdrop-blur-md">
              <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <div className="flex h-16 items-center justify-between px-4 border-b">
                    <div className="flex items-center gap-2 font-bold">
                      <DashboardHeaderSMLogo className="h-7 w-7" />
                      <span>SocialMetrics</span>
                    </div>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                      </Button>
                    </SheetClose>
                  </div>
                  <nav className="grid gap-1 p-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileNavOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                          pathname === item.href
                            ? "bg-muted font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
              <div className="flex items-center gap-2 font-bold">
                <DashboardHeaderSMLogo className="h-7 w-7" />
                <span className="hidden md:inline-block">SocialMetrics</span>
              </div>
              <div className="flex-1"></div>
              <Button variant="outline" size="icon" className="rounded-full">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <span className="hidden md:inline-block">{userName}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </header>
            <div className="flex flex-1">
              {/* Sidebar: Added fixed positioning and height */}
              <aside className="hidden w-64 shrink-0 border-r md:block glass-card bg-sidebar-background/90 backdrop-blur-xl shadow-2xl border-l-4 border-l-primary/40 fixed top-16 left-0 h-[calc(100vh-4rem)] z-40"> {/* Adjusted classes for fixed positioning */}
                <div className="flex h-full flex-col gap-2 p-4">
                  <nav className="grid gap-1 pt-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                          pathname === item.href
                            ? "bg-muted font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </aside>
              {/* Main content: Added padding-left to accommodate fixed sidebar */}
              <main className="flex-1 p-3 md:p-8 flex flex-col w-full md:pl-72 pt-16"> {/* Added md:pl-72 and pt-16 */}
                {children}
              </main>
            </div>

            {/* Toast notifications */}
            <ToastViewport />
            {toasts.map((toast, index) => (
              <Toast key={index} variant={toast.variant}>
                <div className="grid gap-1">
                  <ToastTitle>{toast.title}</ToastTitle>
                  {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
                </div>
                <ToastClose />
              </Toast>
            ))}
          </ToastProvider>
        </div>
      </ProtectedRoute>
    </>
  )
}
