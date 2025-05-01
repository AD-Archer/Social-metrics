/**
 * Account settings component that displays the user's connected 
 * authentication provider (currently only Google).
 */
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"

export function AccountSettings() {
  const { user } = useAuth()

  // Determine if Google provider is used
  const hasGoogleProvider = user?.providerData.some(provider => provider.providerId === "google.com")
  const googleProviderData = user?.providerData.find(provider => provider.providerId === "google.com")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication Method</CardTitle>
        <CardDescription>
          This shows the method you used to sign in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Google Provider Display */}
        {hasGoogleProvider && googleProviderData && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                {/* Assuming you have a google-icon.png in public */}
                <AvatarImage src="/google-icon.png" alt="Google" /> 
                <AvatarFallback>G</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">Google</p>
                <p className="text-sm text-muted-foreground">
                  {googleProviderData.email}
                </p>
              </div>
            </div>
            <div>
              <Badge className="bg-green-500">Connected</Badge>
            </div>
          </div>
        )}

        {/* Placeholder if no known provider is found (optional) */}
        {!hasGoogleProvider && (
          <p className="text-sm text-muted-foreground">No recognized authentication method connected.</p>
        )}
      </CardContent>
    </Card>
  )
}