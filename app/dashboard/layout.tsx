"use client"
/**
 * Note to self remember to acctually implement the logout functionality we are just gonna have a redirect
 * for now
 */


import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Bell,
  ChevronDown,
  Home,
  Instagram,
  LogOut,
  Menu,
  Settings,
  Twitch,
  Twitter,
  User,
  Youtube,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const { toasts } = useToast()

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: Home },
    { name: "Instagram", href: "/dashboard/instagram", icon: Instagram },
    { name: "YouTube", href: "/dashboard/youtube", icon: Youtube },
    { name: "TikTok", href: "/dashboard/tiktok", icon: BarChart3 },
    { name: "Twitch", href: "/dashboard/twitch", icon: Twitch },
    { name: "Twitter", href: "/dashboard/twitter", icon: Twitter },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  // Local SM logo for dashboard header only
  const DashboardHeaderSMLogo = ({ className = "" }: { className?: string }) => (
    <div className={`rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center border border-indigo-300 ${className}`}>
      <span className="text-sm font-bold text-white leading-none select-none">SM</span>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <ToastProvider>
        <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex items-center gap-2 font-bold mb-8">
                <DashboardHeaderSMLogo className="h-7 w-7" />
                <span>SocialMetrics</span>
              </div>
              <nav className="grid gap-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      pathname === item.href
                        ? "bg-muted font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
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
              <Button variant="outline" size="sm" className="gap-2 rounded-full">
                <Image
                  src="/placeholder.svg?height=32&width=32"
                  alt="Avatar"
                  className="h-6 w-6 rounded-full"
                  width={24}
                  height={24}
                />
                <span className="hidden md:inline-block">John Doe</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { window.location.href = '/dashboard/settings' }}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { window.location.href = '/dashboard/settings' }}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { window.location.href = '/' }}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div className="flex flex-1">
          <aside className="hidden w-64 shrink-0 border-r md:block">
            <div className="flex h-full flex-col gap-2 p-4">
              <nav className="grid gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      pathname === item.href
                        ? "bg-muted font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
          <main className="flex-1 p-4 md:p-6">{children}</main>
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
  )
}
