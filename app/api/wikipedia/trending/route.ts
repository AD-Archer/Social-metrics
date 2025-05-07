/**
 * API Route to fetch Wikipedia trending articles and additional data.
 * This route proxies requests to the Wikimedia API to bypass CORS restrictions
 * and fetches additional details like summaries and images for each article.
 */

import { NextResponse } from 'next/server';

interface WikiArticle {
  article: string;
  rank: number;
  views: number;
  [key: string]: unknown;
}

interface WikiSummary {
  extract?: string;
  thumbnail?: {
    source: string;
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
  }

  const [year, month, day] = date.split('-');

  try {
    // Fetch trending articles
    const trendingResponse = await fetch(
      `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${year}/${month}/${day}`
    );

    if (!trendingResponse.ok) {
      throw new Error(`Failed to fetch trending articles: ${trendingResponse.status}`);
    }

    const trendingData = await trendingResponse.json();
    const articles = trendingData.items[0]?.articles || [];

    // Fetch additional data for each article
    const detailedArticles = await Promise.all(
      articles.slice(0, 50).map(async (article: WikiArticle) => {
        const title = article.article;
        try {
          const summaryResponse = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
          );

          if (!summaryResponse.ok) {
            throw new Error(`Failed to fetch summary for ${title}`);
          }

          const summaryData = await summaryResponse.json() as WikiSummary;
          return {
            ...article,
            summary: summaryData.extract,
            imageUrl: summaryData.thumbnail?.source || null,
          };
        } catch {
          return { ...article, summary: null, imageUrl: null };
        }
      })
    );

    return NextResponse.json(detailedArticles);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}