/**
 * API Route to fetch related Wikipedia articles for a given title.
 * Proxies requests to the Wikipedia REST API /page/related endpoint to bypass CORS restrictions.
 * Returns a list of related article titles and relevant metadata.
 */
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');

  if (!title) {
    return NextResponse.json({ error: 'Missing title parameter' }, { status: 400 });
  }

  try {
    const relatedRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/related/${encodeURIComponent(title)}`
    );
    if (!relatedRes.ok) {
      throw new Error(`Failed to fetch related articles: ${relatedRes.status}`);
    }
    const relatedData = await relatedRes.json();
    return NextResponse.json(relatedData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
