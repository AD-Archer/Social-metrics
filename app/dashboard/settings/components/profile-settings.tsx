/**
 * Profile settings component.
 * Displays and allows editing of user profile information like name, username,
 * email (display only usually), and bio. It receives profile data and the
 * save handler via props from the parent settings page, which sources them
 * from the `useSettingsStore`. Avatar functionality has been removed.
 */
"use client";

import type React from "react";
// Removed Avatar imports: import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UserSettings } from "../page"; // Import the type

interface ProfileSettingsProps {
  profileSettings: UserSettings['profile']; // Receive only the profile part
  isLoading: boolean;
  handleSaveProfile: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export function ProfileSettings({ profileSettings, isLoading, handleSaveProfile }: ProfileSettingsProps) {
  // Removed initials derivation: const initials = `${profileSettings.firstName?.[0] ?? ''}${profileSettings.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <Card>
      <form onSubmit={handleSaveProfile}> {/* Use the passed handler */}
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Removed Avatar section */}
          {/* <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profileSettings.avatarUrl} alt="User avatar" />
              <AvatarFallback>{initials || 'U'}</AvatarFallback>
            </Avatar>
          </div> */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" defaultValue={profileSettings.firstName} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" defaultValue={profileSettings.lastName} disabled={isLoading} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            {/* Email is typically not directly editable here, display only */}
            <Input id="email" name="email" type="email" value={profileSettings.email} disabled readOnly />
            <p className="text-xs text-muted-foreground">
              Your email address is linked to your authentication method.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" defaultValue={profileSettings.username} disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" defaultValue={profileSettings.bio} disabled={isLoading} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
