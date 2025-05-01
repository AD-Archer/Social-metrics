/**
 * API route handler for conversational AI interactions related to YouTube data.
 * Expects a user message and optional conversation history in the POST request body.
 * Connects to the OpenAI API to generate conversational responses based on the ongoing dialogue.
 * This is designed for a chat interface on the YouTube dashboard.
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
interface ChatRequestBody {
  message: string;
  // Optional: Add conversation history
  history?: { role: 'user' | 'assistant'; content: string }[];
}

/**
 * Handles POST requests for YouTube AI chat.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key is not configured.');
    return NextResponse.json(
      { error: 'AI service is not configured.' },
      { status: 500 }
    );
  }

  let requestBody: ChatRequestBody;

  // Parse request body
  try {
    requestBody = await request.json();
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { message, history = [] } = requestBody; // Destructure history, default to empty array

  // Validate input
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({ error: 'Message is required and must be a non-empty string.' }, { status: 400 });
  }

  // Refined system prompt for better YouTube focus
  const systemPrompt = "You are a specialized YouTube analytics and content strategy assistant integrated into a user's dashboard. Your goal is to provide actionable insights, data interpretation, performance analysis, and creative content suggestions based on YouTube best practices and the user's conversation. Be concise, helpful, and focus specifically on YouTube channel growth and management. Assume you have access to the user's channel data implicitly through their questions. Use Markdown for formatting when appropriate (e.g., lists, bold text).";

  try {
    // Construct messages array including history
    const messagesToOpenAI = [
      { role: 'system' as const, content: systemPrompt },
      // Map history to the expected format, ensuring roles are correct
      ...history.map((item) => ({ role: item.role, content: item.content })),
      { role: 'user' as const, content: message }
    ];

    // Call OpenAI Chat Completions API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Or your preferred model
      messages: messagesToOpenAI, // Send the full conversation history
      temperature: 0.6, // Slightly lower temperature for more focused responses
      max_tokens: 350, // Increase token limit slightly for potentially more detailed answers
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response content received from AI.');
    }

    // Return the AI's response
    return NextResponse.json(
        { response: aiResponse },
        {
            headers: {
            'Cache-Control': 'no-store, max-age=0',
            'Content-Type': 'application/json',
            },
        }
    );

  } catch (error: unknown) {
    console.error('Error calling OpenAI API:', error);
    let errorMessage = 'An internal server error occurred while processing the chat message.';
    let statusCode = 500;

    if (error instanceof OpenAI.APIError) {
        errorMessage = `AI API Error (${error.status}): ${error.message}`;
        statusCode = error.status || 500;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
