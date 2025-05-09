/**
 * YouTube AI Chat component.
 * Provides an interface for users to interact with an AI assistant
 * regarding their YouTube channel data, performance, and content ideas.
 * Manages chat state locally, including messages, input, loading, and errors.
 * Communicates with the `/api/youtube/ai/chat` endpoint, sending conversation history,
 * a summary of current analytics data, and optionally, selected Wikipedia topics for video ideas.
 * Renders AI responses using Markdown.
 * Fetches a custom error message from an external API on failure.
 * The component uses a fixed height and internal scrolling for the chat area.
 * Includes UI adjustments for better text wrapping in suggestion buttons on mobile.
 * Tracks AI responses for calendar event detection via the AiChatBridge store.
 */
import { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, Send, Loader2, AlertTriangle, Info } from 'lucide-react'; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useYoutubeStore, type RssFeedItemWithStats, type YoutubeState } from '@/store/youtube-store'; 
import { type UseBoundStore, type StoreApi } from 'zustand';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAiIdeasStore, allStaticIdeas } from '@/store/ai-ideas-store';
import { useCallback, useState as useReactState } from 'react';
import { useAiChatBridgeStore } from '@/store/ai-chat-bridge-store';
import { useCalendarStore } from '@/store/calendar-store';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/auth-context';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AnalyticsAccumulator {
  views: number;
  likes: number;
  comments: number;
}

interface YoutubeAIChatProps {
  selectedWikipediaTopics?: string[]; // New prop for Wikipedia topics
}

const useTypedYoutubeStore: UseBoundStore<StoreApi<YoutubeState>> = useYoutubeStore;

export function YoutubeAIChat({ selectedWikipediaTopics }: YoutubeAIChatProps) { // Destructure new prop
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [infoOpen, setInfoOpen] = useReactState(false); // For click-to-open info
  const aiIdeasStore = useAiIdeasStore();
  const { sessionIdeas, randomizeSessionIdeas } = aiIdeasStore;
  const [showSuggestions, setShowSuggestions] = useState(true);

  const fullState = useTypedYoutubeStore();
  const { feedItems, trendData } = fullState;

  const analyticsSummary = useMemo(() => {
    const totalStats = feedItems.reduce<AnalyticsAccumulator>(
      (acc: AnalyticsAccumulator, item: RssFeedItemWithStats) => {
        acc.views += item.views ?? 0;
        acc.likes += item.likes ?? 0;
        acc.comments += item.comments ?? 0;
        return acc;
      },
      { views: 0, likes: 0, comments: 0 }
    );
    const lastUpdated = trendData?.lastUpdated 
      ? new Date(trendData.lastUpdated).toLocaleString()
      : 'N/A';
      
    let summary = `Current YouTube dashboard state: ${feedItems.length} videos loaded. Totals - Views: ${totalStats.views.toLocaleString()}, Likes: ${totalStats.likes.toLocaleString()}, Comments: ${totalStats.comments.toLocaleString()}. Trend data last updated: ${lastUpdated}.`;

    if (selectedWikipediaTopics && selectedWikipediaTopics.length > 0) {
      summary += `\n\nConsider these trending Wikipedia topics for video ideas: ${selectedWikipediaTopics.join(', ')}.`;
    }
    return summary;
  }, [feedItems, trendData, selectedWikipediaTopics]); // Add selectedWikipediaTopics to dependency array

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Effect to send an initial message if Wikipedia topics are present
  useEffect(() => {
    if (selectedWikipediaTopics && selectedWikipediaTopics.length > 0 && messages.length === 0) {
      // Simulate a user message to kickstart the conversation with context
      // This avoids sending an actual API call without user interaction but pre-fills the input
      // Or, send an initial "system" type message if the API supports it,
      // for now, we can add it to the first user message or as a placeholder.
      // Let's add a non-API-calling message to the chat to inform the user.
      setMessages([
        {
          id: Date.now().toString() + '-system-info',
          role: 'assistant', // Or a new role like 'system' if you customize rendering
          content: `I can help you brainstorm video ideas based on these trending topics: **${selectedWikipediaTopics.join(', ')}**. Ask me for suggestions!`
        }
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWikipediaTopics]); // Run only when topics change, and messages are empty

  // Update dynamic trending idea if Wikipedia topics change
  useEffect(() => {
    let trendingIdea;
    if (selectedWikipediaTopics && selectedWikipediaTopics.length > 4) {
      trendingIdea = {
        id: 'trending',
        text: `Hey, I notice that '${selectedWikipediaTopics[4]}' is trending. How can I make a YouTube video on it?`,
        dynamic: true,
      };
    }
    randomizeSessionIdeas(allStaticIdeas, trendingIdea);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWikipediaTopics]);

  const currentDate = new Date().toLocaleDateString(); // Get the current date

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: Date.now().toString() + '-system-info',
          role: 'assistant',
          content: `Hello! Today is ${currentDate}. I can help you brainstorm video ideas, analyze your YouTube performance, and even add tasks to your content calendar. Just let me know what you need!`
        }
      ]);
    }
  }, [currentDate, messages.length]);

  // Prefill input with idea text
  const handleIdeaClick = useCallback((ideaText: string) => {
    setInput(ideaText);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const aiChatBridge = useAiChatBridgeStore();
  const { toast } = useToast(); // Ensure toast is imported and used correctly

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!input.trim() || isLoading) return;
    setShowSuggestions(false);

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

    // Prepare context for the AI
    const contextForAI = analyticsSummary;

    try {
      const response = await fetch('/api/youtube/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage.content,
          history: currentHistory,
          analyticsContext: contextForAI
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API Error: ${response.status}`);
      }

      const assistantMessage: Message = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: data.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Track AI response in the bridge store for calendar event detection
      aiChatBridge.addAIMessage(data.response);

      // Improved task extraction logic
      console.log("AI Response for Task:", data.response);
      const taskMatch = data.response.match(/(?:Task:|Video Topic:)\s*(.*?)(?:\n|$)/i);
      const descriptionMatch = data.response.match(/(?:Description:|Video Outline:)\s*(.*?)(?:\n|$)/i);
      const dateMatch = data.response.match(/\b(?:\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\/\d{1,2})\b/);

      if (taskMatch || descriptionMatch || dateMatch) {
        const title = taskMatch ? taskMatch[1].trim() : "Untitled Task";
        const description = descriptionMatch ? descriptionMatch[1].trim() : "No description provided.";
        const date = dateMatch ? new Date(dateMatch[0]).toISOString() : new Date().toISOString();

        console.log("Extracted Task Details:", { title, description, date });

        // Add task to calendar store
        const calendarStore = useCalendarStore.getState();
        calendarStore.createEvent({
          title,
          description,
          startDate: date,
          userId: user?.uid || 'unknown-user',
          source: 'ai',
        });
        toast({
          title: 'Task Added',
          description: `The task "${title}" has been added to your calendar.`,
        });
      } else {
        console.error("Failed to extract task details from AI response.");
      }

    } catch (err) {
      console.error("Chat API error:", err);
      setError("Failed to get response from AI. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for external AI message requests
  useEffect(() => {
    if (aiChatBridge.pendingMessage) {
      // Simulate user input and submit
      setInput(aiChatBridge.pendingMessage);
      setShowSuggestions(false);
      // Submit as if user pressed enter
      handleSubmit();
      aiChatBridge.clearPendingMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiChatBridge.pendingMessage]);

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Assistant
            </CardTitle>
            <CardDescription>Ask about your YouTube data or get content ideas.</CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip open={infoOpen} onOpenChange={setInfoOpen}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setInfoOpen((v) => !v)}>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-sm">
                  I can help analyze your YouTube performance, suggest video titles,
                  brainstorm content, and more. If trending Wikipedia topics are selected
                  on the dashboard, I&apos;ll also use those to help you generate video ideas!
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {/* AI Suggestions Row */}
        {showSuggestions && (
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            {sessionIdeas.map((idea) => (
              <Button
                key={idea.id}
                variant="outline"
                size="sm"
                className="text-xs whitespace-normal text-left h-auto px-2.5 py-1.5"
                onClick={() => handleIdeaClick(idea.text)}
              >
                {idea.text}
              </Button>
            ))}
          </div>
        )}
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
