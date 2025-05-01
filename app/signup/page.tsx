/**
 * @fileoverview Signup page component. Allows users to create an account using Google or Twitch OAuth.
 * This page uses the AuthContext for handling OAuth sign-up and redirects users
 * to the dashboard upon successful sign-up.
 */
"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react" // Removed unused 'Info'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
// Removed unused imports: Separator, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger

import { useAuth } from "@/context/auth-context"
import SMLogo from "@/components/sm_logo"

export default function SignupPage() {
  const router = useRouter()
  const { signInWithGoogle, signInWithTwitch, isTwitchLoginDisabled } = useAuth() 
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)
  const [isLoadingTwitch, setIsLoadingTwitch] = useState(false)
  const [error, setError] = useState("")

  const handleGoogleSignUp = async () => {
    setIsLoadingGoogle(true)
    setError("")

    try {
      await signInWithGoogle()
      router.push("/dashboard") 
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign up with Google.";
      setError(errorMessage)
    } finally {
      setIsLoadingGoogle(false)
    }
  }

  const handleTwitchSignUp = async () => {
    setIsLoadingTwitch(true)
    setError("")
    try {
      await signInWithTwitch()
      router.push("/dashboard")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign up with Twitch.";
      setError(errorMessage)
    } finally {
      setIsLoadingTwitch(false)
    }
  }

  const isLoading = isLoadingGoogle || isLoadingTwitch;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <SMLogo className="h-15 w-15 mx-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Sign up using Google or Twitch
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div> 
            <Button 
              variant="outline" 
              type="button" 
              className="w-full" 
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
              </svg>
              {isLoadingGoogle ? "Signing up..." : "Sign up with Google"}
            </Button>

            <Button 
              variant="outline" 
              type="button" 
              className="w-full mt-2"
              onClick={handleTwitchSignUp}
              disabled={isLoading || isTwitchLoginDisabled}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#6441A4" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
              </svg>
              {isLoadingTwitch ? "Signing up..." : "Sign up with Twitch"}
            </Button>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>By clicking continue, you agree to our{' '}
              <TermsOfServiceDialog />
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-primary underline underline-offset-4 hover:text-primary/90">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

const TermsOfServiceDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="link" className="p-0 h-auto text-primary underline underline-offset-4 hover:text-primary/90">
        Terms of Service and Privacy Policy
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Terms of Service & Privacy Policy</DialogTitle>
        <DialogDescription className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Your privacy is important to us. We collect only the data necessary to provide our services and never share your personal information with third parties without your consent. For more information, please contact support. 
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
)
