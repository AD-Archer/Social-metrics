/**
 * API route handler for analyzing YouTube video data using OpenAI.
 * Expects video title and description in the POST request body.
 * Connects to the OpenAI API to generate insights, keywords, target audience,
 * performance boost ideas, and content suggestions based on the provided data.
 */
import { NextResponse, type NextRequest } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client using environment variable for API key
// Ensure OPENAI_API_KEY is set in your .env.local file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Force dynamic rendering and prevent caching
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Define the expected structure of the request body
interface AnalyzeRequestBody {
  title?: string;
  description?: string; // Assuming description might come from RSS or elsewhere
}

/**
 * Handles POST requests to analyze YouTube video data with OpenAI.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key is not configured.');
    return NextResponse.json(
      { error: 'OpenAI API key is missing. Please configure it in environment variables.' },
      { status: 500 }
    );
  }

  let requestBody: AnalyzeRequestBody;

  // Parse request body
  try {
    requestBody = await request.json();
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { title, description } = requestBody;

  // Validate input
  if (!title) {
    return NextResponse.json({ error: 'Video title is required.' }, { status: 400 });
  }

  // Construct the prompt for OpenAI
  // Customize this prompt based on the specific analysis you need
  const prompt = `
    Analyze the following YouTube video data:
    Title: ${title}
    ${description ? `Description: ${description}` : ''}

    Provide the following analysis as a JSON object with keys: "summary", "keywords", "targetAudience", "performanceBoostIdeas", "contentSuggestions":
    1.  **summary**: A concise summary of the video's likely content (1-2 sentences).
    2.  **keywords**: Suggested relevant keywords or tags (comma-separated string or array of strings).
    3.  **targetAudience**: An estimated target audience profile (e.g., demographics, interests).
    4.  **performanceBoostIdeas**: 2-3 actionable ideas to potentially improve this video's performance (e.g., title tweaks, thumbnail suggestions, promotion strategies). Keep each idea brief.
    5.  **contentSuggestions**: 1-2 related content ideas based on this video's topic and potential audience interest. Keep each suggestion brief.
  `;

  try {
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Using a capable model
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6, // Slightly increased creativity for suggestions
      max_tokens: 300, // Increased token limit for more detailed suggestions
      response_format: { type: "json_object" }, // Request JSON output
    });

    const analysisContent = completion.choices[0]?.message?.content;

    if (!analysisContent) {
      throw new Error('No content received from OpenAI.');
    }

    // Attempt to parse the JSON response from OpenAI
    let analysisResult;
    try {
        analysisResult = JSON.parse(analysisContent);
    } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        console.error('Raw OpenAI response:', analysisContent);
        // Fallback: return the raw string if JSON parsing fails
        // Consider returning a structured error instead of raw analysis
        analysisResult = { error: 'Failed to parse analysis from OpenAI.', raw_analysis: analysisContent };
        // return NextResponse.json({ error: 'Failed to parse analysis from OpenAI.' }, { status: 500 });
    }

    // Return the analysis
    return NextResponse.json(
        analysisResult,
        {
            headers: {
            'Cache-Control': 'no-store, max-age=0',
            'Content-Type': 'application/json',
            },
        }
    );

  } catch (error: unknown) {
    console.error('Error calling OpenAI API:', error);
    let errorMessage = 'An internal server error occurred while analyzing the video data.';
    if (error instanceof OpenAI.APIError) {
        // Handle specific OpenAI API errors
        errorMessage = `OpenAI API Error (${error.status}): ${error.message}`;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
