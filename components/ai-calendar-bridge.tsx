/**
 * AI Calendar Bridge component.
 * Monitors AI chat messages for content scheduling phrases and triggers calendar event creation.
 * Works seamlessly with the existing AI chat system to create calendar events
 * when the AI suggests scheduling content.
 */
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useCalendarStore } from '@/store/calendar-store';
import { useAiChatBridgeStore } from '@/store/ai-chat-bridge-store';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AiCalendarBridgeProps {
  // Optional class name for styling
  className?: string;
}

export function AiCalendarBridge({ className }: AiCalendarBridgeProps) {
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const [recentDetection, setRecentDetection] = useState<{
    message: string;
    eventId: string | null;
  } | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  // Get relevant functions from stores
  const { extractEventFromAIChatMessage } = useCalendarStore();
  const { aiMessages, resetAIMessages } = useAiChatBridgeStore();

  // Listen for AI messages with scheduling phrases
  useEffect(() => {
    if (!user || aiMessages.length === 0) return;

    const lastMessage = aiMessages[aiMessages.length - 1];
    
    // Skip if we've already processed this message (check with message fingerprint)
    const messageFingerprint = `${lastMessage.length}:${lastMessage.substring(0, 20)}`;
    const processedKey = `processed_${messageFingerprint}`;
    
    if (sessionStorage.getItem(processedKey)) {
      return;
    }

    // Regular expressions to detect scheduling phrases
    const schedulingPhrases = [
      /(?:schedule|post|publish|create|make|plan|upload)(?:\s+a)?\s+(?:video|content|post|this)(?:\s+[^.]*?)?\s+(?:on|for|by)\s+[^.?!]+/i,
      /(?:recommended|suggest|proposal|idea)\s+(?:to|for)\s+(?:schedule|post|publish)\s+(?:a|the|this|your)?\s+(?:video|content|post)\s+(?:on|for|by)\s+[^.?!]+/i,
      /(?:on|by|for)\s+(?:the\s+)?\d+(?:st|nd|rd|th)?\s+(?:of\s+)?[a-z]+(?:\s+\d{4})?/i,
      /(?:on|by|for)\s+(?:the\s+)?[a-z]+\s+\d+(?:st|nd|rd|th)?(?:\s+\d{4})?/i,
    ];

    // Check if any scheduling phrase pattern matches
    const containsSchedulingPhrase = schedulingPhrases.some(pattern => 
      pattern.test(lastMessage)
    );

    if (containsSchedulingPhrase) {
      // Mark this message as processed
      sessionStorage.setItem(processedKey, 'true');
      
      // Process the message to extract and create a calendar event
      extractEventFromAIChatMessage(lastMessage, user.uid).then(eventId => {
        if (eventId) {
          setRecentDetection({
            message: lastMessage,
            eventId
          });
          setShowAlert(true);
          
          toast({
            title: "Calendar Event Created",
            description: "A new content calendar event has been added based on your conversation with the AI.",
          });
        }
      });
    }
  }, [aiMessages, user, extractEventFromAIChatMessage, toast]);

  // Handle dismissing the alert
  const handleDismiss = () => {
    setShowAlert(false);
    setTimeout(() => setRecentDetection(null), 300); // Allow time for animation
  };

  if (!showAlert || !recentDetection) {
    return null;
  }

  return (
    <div className={`transition-all duration-300 ${className || ''}`}>
      <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 mb-4">
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
          <Calendar className="h-4 w-4" />
          Content Added to Calendar
        </AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          <p className="mb-2">
            A new content idea has been added to your calendar based on your conversation.
          </p>
          <div className="flex space-x-2 mt-2">
            <Button asChild variant="outline" size="sm" className="border-green-200 dark:border-green-800">
              <Link href={`/dashboard/calendar?date=${recentDetection?.eventId ? new Date().toISOString().split('T')[0] : ''}`}>View Calendar</Link>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/50"
            >
              Dismiss
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}