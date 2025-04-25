"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"

import SMLogo from "@/components/sm_logo"

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Redirect to login page instead of dashboard
      router.push("/login")
    }, 1500)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <SMLogo className="h-15 w-15 mx-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">Enter your information to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="name" placeholder="John Doe" required className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="john@example.com" required className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="pr-9"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            By creating an account, you agree to our{' '}
            <TermsOfServiceDialog />{' '}and{' '}
            <PrivacyPolicyDialog />
            .
          </div>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline underline-offset-4 hover:text-primary/90">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

// Terms of Service and Privacy Policy
const TermsOfServiceDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <span className="underline underline-offset-4 hover:text-primary cursor-pointer" title="View Terms of Service">
        Terms of Service
      </span>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Terms of Service</DialogTitle>
        <DialogDescription>
          Welcome to SocialMetrics! By creating an account, you agree to abide by our terms and conditions. You must not misuse the service, attempt unauthorized access, or violate any applicable laws. We reserve the right to suspend accounts for violations. For full details, please contact support.
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
)

const PrivacyPolicyDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <span className="underline underline-offset-4 hover:text-primary cursor-pointer" title="View Privacy Policy">
        Privacy Policy
      </span>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Privacy Policy</DialogTitle>
        <DialogDescription>
          Your privacy is important to us. We collect only the data necessary to provide our services and never share your personal information with third parties without your consent. For more information, please contact support. 
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
)



// Example usage:
// <LocalSMLogo className="h-10 w-10" />
