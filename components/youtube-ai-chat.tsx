/**
 * YouTube AI Chat component.
 * Provides an interface for users to interact with an AI assistant
 * regarding their YouTube channel data and performance.
 * Manages chat state locally, including messages, input, loading, and errors.
 * Communicates with the `/api/youtube/ai/chat` endpoint, sending conversation history
 * and a summary of current analytics data.
 * Renders AI responses using Markdown.
 * Fetches a custom error message from an external API on failure.
 * The component uses a fixed height and internal scrolling for the chat area.
 */
import { useState, useRef, useEffect, useMemo } from 'react'; // Added useMemo
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, Send, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
// Import YoutubeState type along with others
import { useYoutubeStore, type RssFeedItemWithStats, type YoutubeState } from '@/store/youtube-store'; 
// Import Zustand types for explicit hook typing
import { type UseBoundStore, type StoreApi } from 'zustand';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Define type for the accumulator in analytics summary
interface AnalyticsAccumulator {
  views: number;
  likes: number;
  comments: number;
}

// Explicitly type the store hook
const useTypedYoutubeStore: UseBoundStore<StoreApi<YoutubeState>> = useYoutubeStore;

export function YoutubeAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Use the explicitly typed hook - access full state first
  const fullState = useTypedYoutubeStore();
  const { feedItems, trendData } = fullState;

  // Memoize analytics summary to avoid recalculating on every render
  const analyticsSummary = useMemo(() => {
    // Use the defined type for the accumulator and initial value
    const totalStats = feedItems.reduce<AnalyticsAccumulator>(
      // Explicitly type accumulator and item parameters
      (acc: AnalyticsAccumulator, item: RssFeedItemWithStats) => {
        // Ensure properties are treated as numbers, defaulting to 0 if undefined
        acc.views += item.views ?? 0;
        acc.likes += item.likes ?? 0;
        acc.comments += item.comments ?? 0;
        return acc;
      },
      { views: 0, likes: 0, comments: 0 } // Initial value matching the type
    );
    const lastUpdated = trendData?.lastUpdated 
      ? new Date(trendData.lastUpdated).toLocaleString()
      : 'N/A';
      
    // totalStats properties are now guaranteed to be numbers
    return `Current dashboard state: ${feedItems.length} videos loaded. Totals - Views: ${totalStats.views.toLocaleString()}, Likes: ${totalStats.likes.toLocaleString()}, Comments: ${totalStats.comments.toLocaleString()}. Trend data last updated: ${lastUpdated}.`;
  }, [feedItems, trendData]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: input.trim(),
    };

    const currentHistory = messages.map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/youtube/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage.content,
          history: currentHistory,
          analyticsContext: analyticsSummary // Include the analytics summary
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Throw the error message from the API response if available
        throw new Error(data.error || `API Error: ${response.status}`);
      }

      const assistantMessage: Message = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: data.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (err) {
      console.error("Chat API error:", err);
      // Attempt to fetch the custom error message
      try {
        const errorResponse = await fetch('https://naas.isalman.dev/no');
        if (errorResponse.ok) {
          const errorData = await errorResponse.json();
          setError(errorData.reason || "An unexpected error occurred.");
        } else {
          // Fallback if the custom error API fails
          setError("Failed to get response from AI, and couldn't fetch a witty error message either.");
        }
      } catch (fetchError) {
        console.error("Failed to fetch custom error message:", fetchError);
        // Fallback if the fetch itself fails
        setError("Failed to get response from AI. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Assistant
        </CardTitle>
        <CardDescription>Ask questions about your YouTube performance or get content ideas.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden"> {/* Added overflow-hidden */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.role === 'user' ? "justify-end" : ""
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 border shrink-0">
                    <AvatarFallback><Bot size={16} /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-lg p-3 text-sm prose prose-sm dark:prose-invert prose-p:m-0 prose-ul:m-0 prose-ol:m-0 prose-li:m-0 break-words", // Added break-words
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.role === 'assistant' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    message.content // User messages don't need markdown processing
                  )}
                </div>
                 {message.role === 'user' && (
                  <Avatar className="h-8 w-8 border shrink-0">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback><Bot size={16} /></AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3 text-sm flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
             {error && (
              <div className="flex items-center gap-2 text-destructive text-sm p-2 bg-destructive/10 rounded-md">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {/* Display the potentially custom error message */}
                <span>{error}</span>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-4 flex-shrink-0"> {/* Added flex-shrink-0 */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Ask the AI..."
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
