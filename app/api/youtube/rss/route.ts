/**
 * API route handler for fetching and parsing a user's YouTube RSS feed.
 * Uses Firebase Admin SDK to securely access the user's RSS URL from Firestore,
 * then fetches and parses the feed content. This approach bypasses client-side
 * authentication limitations in server components.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import Parser from 'rss-parser';

// Force dynamic rendering and prevent caching
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Define feed item structure for type safety
interface RssFeedItem {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  guid?: string;
  id?: string;
  contentSnippet?: string;
}

// Type for parsed feed structure
interface ParsedFeed {
  items: RssFeedItem[];
  title?: string;
  description?: string;
  feedUrl?: string;
  link?: string;
}

/**
 * Handles GET requests to fetch and parse YouTube RSS feeds
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Get userId from query params
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    // Use Firebase Admin SDK to access Firestore with admin privileges
    // This bypasses the permission issues with client-side auth in API routes
    const userDocRef = adminDb.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const rssUrl = userData?.connections?.youtubeRssUrl;

    if (!rssUrl) {
      return NextResponse.json(
        { items: [] },
        { status: 200 }
      );
    }

    // Validate RSS URL format
    if (!rssUrl.includes('youtube.com') || 
        (!rssUrl.includes('feeds/videos.xml') && rssUrl.includes('@'))) {
      
      // Handle username format instead of proper RSS URL
      let channelUsername = '';
      
      if (rssUrl.includes('@')) {
        channelUsername = rssUrl.split('@')[1].split('/')[0];
        
        return NextResponse.json(
          { 
            error: 'Invalid RSS feed URL format. For channel usernames, you need the full RSS URL.',
            helpText: `Try using: https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID or find your channel ID in YouTube Studio settings.`,
            enteredUrl: rssUrl,
            extractedUsername: channelUsername
          }, 
          { status: 400 }
        );
      }
    }

    // Fetch and parse the RSS feed
    const parser = new Parser<ParsedFeed>();
    let feed: ParsedFeed;
    
    try {
      feed = await parser.parseURL(rssUrl);
    } catch (parseError: unknown) {
      console.error(`Error parsing RSS feed: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      
      let errorMessage = 'Failed to fetch or parse the RSS feed.';
      if (parseError instanceof Error) {
        if (parseError.message?.includes('Invalid XML')) {
          errorMessage = 'The RSS URL does not point to a valid XML feed.';
        } else if ('code' in parseError && parseError.code === 'ENOTFOUND' || 
                  parseError.message?.includes('fetch')) {
          errorMessage = 'Could not reach the RSS URL. Please verify it is correct.';
        }
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    // Return clean, formatted feed items
    const formattedItems = (feed.items || []).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      isoDate: item.isoDate,
      guid: item.guid || item.id || item.link,
      contentSnippet: item.contentSnippet 
    }));

    // Set cache control headers to prevent stale data
    return NextResponse.json(
      { items: formattedItems },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error: unknown) {
    console.error('Error in YouTube RSS API route:', error);
    
    // Define error properties with type safety
    let errorCode = 'unknown';
    let statusCode = 500;
    
    if (error instanceof Error && 'code' in error) {
      const firebaseError = error as Error & { code?: string };
      errorCode = firebaseError.code || 'unknown';
      
      if (errorCode === 'permission-denied') {
        statusCode = 403;
      }
    }
    
    const errorMessage = errorCode === 'permission-denied'
      ? 'Firebase permission denied. Check if Firebase Admin SDK is properly configured.'
      : 'An internal server error occurred';
    
    return NextResponse.json(
      { error: errorMessage, code: errorCode },
      { status: statusCode }
    );
  }
}
