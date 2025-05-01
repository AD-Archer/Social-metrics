/**
 * Account settings component. Displays the user's connected
 * authentication providers (Google, Twitch) and allows linking
 * additional providers. Uses the `useAuth` context for user data
 * and linking functions.
 */
"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { AlertCircle, Loader2 } from "lucide-react"; // Import Loader2
import { Alert, AlertDescription } from "@/components/ui/alert"; // Import Alert components

// Simple mapping for provider IDs to names and icons (replace icons as needed)
const providerDetails: { [key: string]: { name: string; icon?: string } } = {
  "google.com": { name: "Google", icon: "/google-icon.png" }, // Assumes icon exists in /public
  "oidc.twitch": { name: "Twitch", icon: "/twitch-icon.png" }, // Assumes icon exists in /public
};

export function AccountSettings() {
  const { user, linkWithGoogle, linkWithTwitch, loading: authLoading } = useAuth();
  const [linkingProvider, setLinkingProvider] = useState<string | null>(null); // Track which provider is being linked
  const [error, setError] = useState<string | null>(null);

  // Get connected provider IDs from user object
  const connectedProviderIds = user?.providerData.map(p => p.providerId) ?? [];

  // Helper function to handle linking
  const handleLink = async (providerId: string) => {
    setError(null); // Clear previous errors
    setLinkingProvider(providerId); // Set loading state for the specific button
    try {
      if (providerId === "google.com") {
        await linkWithGoogle();
        // Success message could be shown via toast in the context or here
      } else if (providerId === "oidc.twitch") {
        await linkWithTwitch();
        // Success message
      }
    } catch (err: unknown) { // Changed 'any' to 'unknown'
      console.error(`Error linking ${providerId}:`, err);
      // Type check for error message
      const message = err instanceof Error ? err.message : `Failed to link ${providerDetails[providerId]?.name || providerId}.`;
      setError(message);
    } finally {
      setLinkingProvider(null); // Clear loading state
    }
  };

  // Render loading state if auth is still loading
  if (authLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Methods</CardTitle>
          <CardDescription>Loading your connected accounts...</CardDescription>
        </CardHeader>
        <CardContent>
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // Render if user data is available
  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Methods</CardTitle>
        <CardDescription>
          Manage how you sign in to your account. You can link multiple methods.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {Object.entries(providerDetails).map(([id, details]) => {
          const isConnected = connectedProviderIds.includes(id);
          const providerData = user?.providerData.find(p => p.providerId === id);
          const isLoading = linkingProvider === id; // Check if this specific provider is linking

          return (
            <div key={id} className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  {details.icon && <AvatarImage src={details.icon} alt={details.name} />}
                  <AvatarFallback>{details.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">{details.name}</p>
                  {isConnected && providerData?.email && (
                    <p className="text-sm text-muted-foreground">
                      {providerData.email}
                    </p>
                  )}
                   {isConnected && !providerData?.email && providerData?.displayName && (
                     <p className="text-sm text-muted-foreground">
                       {providerData.displayName} {/* Fallback for Twitch if email isn't available */}
                     </p>
                   )}
                </div>
              </div>
              <div>
                {isConnected ? (
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">Connected</Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLink(id)}
                    disabled={isLoading || !!linkingProvider} // Disable if this or any other provider is linking
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Linking...
                      </>
                    ) : (
                      `Link ${details.name}`
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {/* Display message if no providers are somehow connected (edge case) */}
        {connectedProviderIds.length === 0 && !authLoading && (
          <p className="text-sm text-muted-foreground">No sign-in methods are currently linked.</p>
        )}
      </CardContent>
    </Card>
  );
}