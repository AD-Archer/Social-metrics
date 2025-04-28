/**
 * API route handler for fetching and parsing a YouTube RSS feed.
 * Expects the RSS feed URL as a query parameter.
 * It fetches the feed content using the provided URL and parses it.
 */
import { NextResponse, type NextRequest } from 'next/server';
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
  // Get rssUrl from query params
  const { searchParams } = new URL(request.url);
  const rssUrl = searchParams.get('rssUrl'); // Changed from userId to rssUrl

  // Validate that rssUrl is provided
  if (!rssUrl) {
    return NextResponse.json({ error: 'RSS URL is required' }, { status: 400 });
  }

  try {
    // Validate RSS URL format (basic check)
    if (!rssUrl.includes('youtube.com/feeds/videos.xml')) {
        // More specific validation might be needed depending on expected URL formats
        console.warn(`Potentially invalid YouTube RSS URL format received: ${rssUrl}`);
        // Decide if you want to return an error or attempt to parse anyway
        // Example: return NextResponse.json({ error: 'Invalid YouTube RSS URL format' }, { status: 400 });
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
    // Updated error handling as Firestore errors are no longer expected here
    console.error('Error in YouTube RSS API route:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while processing the RSS feed.' },
      { status: 500 }
    );
  }
}
