/**
 * API Route: /api/twitch/auth
 *
 * Description:
 * This route initiates the Twitch OAuth 2.0 authorization code flow.
 * It constructs the Twitch authorization URL with the necessary parameters
 * (client ID, redirect URI, response type, and scopes) and redirects the user
 * to Twitch to grant permissions to the application.
 *
 * Environment Variables Required:
 * - TWITCH_CLIENT_ID: The Client ID of your registered Twitch application.
 * - TWITCH_REDIRECT_URI: The absolute URL where Twitch should redirect the user
 *   back after authorization (e.g., https://yourdomain.com/api/twitch/callback).
 *   This MUST match the Redirect URI configured in your Twitch application settings.
 *
 * How it fits into the project:
 * This is the starting point for connecting a user's Twitch account. It should be
 * triggered by a user action (e.g., clicking a "Connect Twitch" button) on the frontend,
 * likely within the settings page.
 */
import { NextResponse } from 'next/server';

export async function GET() {
  const twitchClientId = process.env.TWITCH_CLIENT_ID;
  const twitchRedirectUri = process.env.TWITCH_REDIRECT_URI;

  if (!twitchClientId || !twitchRedirectUri) {
    console.error("Twitch environment variables (TWITCH_CLIENT_ID, TWITCH_REDIRECT_URI) are not set.");
    // In a real app, you might redirect to an error page or return a JSON error
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  // Define the scopes your application needs. Adjust as necessary.
  // Example scopes: read user info, read follower list.
  // See Twitch docs for available scopes: https://dev.twitch.tv/docs/authentication/scopes/
  const scopes = [
    'user:read:email', // Example: Get user's email address (requires verification)
    'user:read:follows', // Example: Read a user's followers list
    // Add other scopes required for the stats you want to display
    'analytics:read:games', // Example: View analytics data for your games
    'channel:read:subscriptions', // Example: Read subscriber list
    'bits:read', // Example: Read Bits leaderboard
    'channel:read:stream_key', // Example: Read stream key (use with caution)
    'user:read:broadcast', // Example: Read broadcast configuration
  ].join(' ');

  // Optional: Generate a unique state parameter for CSRF protection
  // const state = crypto.randomUUID();
  // You would typically store this state (e.g., in a short-lived cookie or session)
  // and verify it in the callback route.

  const params = new URLSearchParams({
    client_id: twitchClientId,
    redirect_uri: twitchRedirectUri,
    response_type: 'code',
    scope: scopes,
    // state: state, // Include state if using it
  });

  const twitchAuthUrl = `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;

  // Redirect the user to the Twitch authorization page
  return NextResponse.redirect(twitchAuthUrl);
}
