/**
 * API Route: /api/twitch/callback
 *
 * Description:
 * This route handles the callback from Twitch after a user authorizes the application
 * during the OAuth 2.0 flow. It receives an authorization code from Twitch,
 * exchanges it for an access token and refresh token by making a server-to-server
 * request to Twitch's token endpoint.
 *
 * It's crucial to securely store the obtained tokens (access and refresh) associated
 * with the user (e.g., in Firestore) for future API calls. This example outlines
 * the flow but omits the specific database interaction for brevity.
 *
 * Environment Variables Required:
 * - TWITCH_CLIENT_ID: The Client ID of your registered Twitch application.
 * - TWITCH_CLIENT_SECRET: The Client Secret of your registered Twitch application.
 * - TWITCH_REDIRECT_URI: The absolute URL configured as the Redirect URI in your
 *   Twitch application settings (must match the one used in /api/twitch/auth).
 * - NEXT_PUBLIC_BASE_URL: The base URL of your application (used for redirecting the user).
 *
 * How it fits into the project:
 * This is the destination URL specified in the Twitch application settings and used
 * in the initial authorization request. After successful token exchange, it should
 * ideally store the credentials securely and redirect the user back to the application,
 * often to the settings or dashboard page, possibly with a success indicator.
 */
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

// Define the expected structure of the token response from Twitch
interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string[];
  token_type: 'bearer';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  // Remove unused 'state' variable
  // const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const twitchClientId = process.env.TWITCH_CLIENT_ID;
  const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET;
  const twitchRedirectUri = process.env.TWITCH_REDIRECT_URI;
  const appBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || '/'; // Fallback to root

  // Construct the redirect URL for success or failure
  const redirectUrl = new URL('/dashboard/settings?tab=connections', appBaseUrl);

  // Handle errors from Twitch authorization
  if (error) {
    console.error(`Twitch OAuth Error: ${error} - ${errorDescription}`);
    redirectUrl.searchParams.set('twitch_error', errorDescription || 'Authorization failed.');
    return NextResponse.redirect(redirectUrl.toString());
  }

  // Validate required parameters
  if (!code) {
    console.error("Twitch callback called without an authorization code.");
    redirectUrl.searchParams.set('twitch_error', 'Missing authorization code.');
    return NextResponse.redirect(redirectUrl.toString());
  }

  if (!twitchClientId || !twitchClientSecret || !twitchRedirectUri) {
    console.error("Twitch environment variables (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_REDIRECT_URI) are not set.");
    redirectUrl.searchParams.set('twitch_error', 'Server configuration error.');
    return NextResponse.redirect(redirectUrl.toString());
  }

  // Optional: Verify the 'state' parameter matches the one you initially sent
  // This helps prevent CSRF attacks. You'd need to retrieve the stored state
  // (e.g., from a cookie or session) and compare it.
  // const storedState = request.cookies.get('twitch_oauth_state')?.value;
  // if (!state || !storedState || state !== storedState) {
  //   console.error("Invalid state parameter in Twitch callback.");
  //   redirectUrl.searchParams.set('twitch_error', 'Invalid state parameter.');
  //   return NextResponse.redirect(redirectUrl.toString());
  // }
  // Clear the state cookie after verification
  // const response = NextResponse.redirect(redirectUrl.toString());
  // response.cookies.delete('twitch_oauth_state');
  // return response; // Adjust flow if using state

  try {
    // Exchange the authorization code for tokens
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: twitchClientId,
        client_secret: twitchClientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: twitchRedirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Failed to exchange Twitch code for token:', errorData);
      throw new Error(errorData.message || 'Token exchange failed');
    }

    const tokens: TwitchTokenResponse = await tokenResponse.json();

    // --- Secure Token Storage ---
    // IMPORTANT: Securely store tokens.access_token and tokens.refresh_token
    // associated with the logged-in user.
    // This typically involves:
    // 1. Getting the current user's ID (e.g., from Firebase Auth session).
    //    This might require using Firebase Admin SDK if not available directly.
    // 2. Saving the tokens in a secure database (e.g., Firestore document for the user).
    //    Encrypting the tokens before storage is highly recommended.
    console.log('Successfully obtained Twitch tokens:', {
      accessToken: '[REDACTED]', // Avoid logging sensitive tokens
      refreshToken: '[REDACTED]',
      expiresIn: tokens.expires_in,
      scopes: tokens.scope,
    });
    // Example placeholder for saving logic:
    // const userId = await getUserIdFromSession(request); // Implement this
    // await saveTwitchTokens(userId, tokens.access_token, tokens.refresh_token, tokens.expires_in); // Implement this

    // --- Update Client State (Indirectly) ---
    // The client-side `AccountContext` cannot be directly updated here.
    // The redirect back to the settings page should trigger a re-fetch or update
    // on the client-side to reflect the new connection status.

    // Redirect back to the settings page with a success indicator
    redirectUrl.searchParams.set('twitch_success', 'true');
    return NextResponse.redirect(redirectUrl.toString());

  } catch (error) {
    console.error('Error during Twitch callback handling:', error);
    redirectUrl.searchParams.set('twitch_error', error instanceof Error ? error.message : 'An unexpected error occurred.');
    return NextResponse.redirect(redirectUrl.toString());
  }
}
