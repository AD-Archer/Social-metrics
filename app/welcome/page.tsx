/**
 * @fileoverview Welcome/Complete Profile page.
 * If the authenticated user is missing an email address (e.g., after Twitch signup),
 * this page prompts them to enter and save one.
 * Redirects authenticated users with emails to the dashboard, and unauthenticated users to login.
 */
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SMLogo from "@/components/sm_logo";

export default function WelcomePage() {
  const { user, loading, updateUserEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect logic handled within AuthProvider now, but keep a check here
    // in case the user navigates directly while already having an email.
    if (!loading && user?.email) {
      console.log("WelcomePage: User already has email, redirecting to dashboard.");
      router.push("/dashboard");
    }
    // AuthProvider handles redirecting unauthenticated users.
  }, [user, loading, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
       setError("Please enter a valid email address.");
       setIsSubmitting(false);
       return;
    }

    try {
      await updateUserEmail(email.trim());
      console.log("WelcomePage: Email updated successfully, redirecting to dashboard.");
      // Redirect happens automatically via AuthProvider's useEffect on user state change,
      // but an explicit push ensures faster navigation.
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("WelcomePage: Failed to update email:", err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while auth context is resolving
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // If user somehow gets here without being logged in, or already has email (redundant check)
  if (!user || user.email) {
     // AuthProvider should handle redirects, this is a fallback.
     // Returning null prevents rendering the form inappropriately.
     return null;
  }


  // Render form only if user exists and email is missing
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
           <div className="flex justify-center mb-4">
             <SMLogo className="h-14 w-14 mx-auto" />
           </div>
          <CardTitle className="text-2xl font-bold text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-center">
            Please provide an email address for your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Email"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
