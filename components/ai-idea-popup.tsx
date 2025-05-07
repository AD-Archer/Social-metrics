/**
 * AiIdeaPopup component
 * Modal for instant AI-powered YouTube video ideas for a Wikipedia topic.
 * Fetches ideas from the /api/youtube/ai/chat endpoint, supports markdown, scroll, and saves conversation history per topic.
 * Includes a memory reset button and loads all past conversations for the topic from localStorage.
 */
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Loader2, Send, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AiIdeaPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: string;
  summary?: string;
}

interface ConversationEntry {
  prompt: string;
  response: string;
}

export function AiIdeaPopup({ open, onOpenChange, topic, summary }: AiIdeaPopupProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState<Record<string, ConversationEntry[]>>({});

  // Load all past conversations for this topic from localStorage
  useEffect(() => {
    if (open && topic) {
      const saved = localStorage.getItem(`ai-idea-popup-history-${topic}`);
      if (saved) {
        setConversations((prev) => ({ ...prev, [topic]: JSON.parse(saved) }));
      } else {
        setConversations((prev) => ({ ...prev, [topic]: [] }));
      }
    }
  }, [open, topic]);

  // Save conversations to localStorage
  useEffect(() => {
    if (topic && conversations[topic]) {
      localStorage.setItem(`ai-idea-popup-history-${topic}`, JSON.stringify(conversations[topic]));
    }
  }, [conversations, topic]);

  useEffect(() => {
    if (open && topic && (!conversations[topic] || conversations[topic].length === 0)) {
      handleSend(`Give me a YouTube video idea for the trending topic '${topic}'.${summary ? `\n\nSummary: ${summary}` : ''}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, topic, summary]);

  const handleSend = async (prompt: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/youtube/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      });
      const data = await res.json();
      if (data.response) {
        setConversations((prev) => ({
          ...prev,
          [topic]: [...(prev[topic] || []), { prompt, response: data.response }]
        }));
        setInput('');
      } else {
        setError(data.error || 'No idea generated.');
      }
    } catch {
      setError('Failed to fetch idea.');
    } finally {
      setLoading(false);
    }
  };

  // Memory reset: clears all conversation history for this topic
  const handleResetMemory = () => {
    localStorage.removeItem(`ai-idea-popup-history-${topic}`);
    setConversations((prev) => ({ ...prev, [topic]: [] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full rounded-2xl p-0 overflow-hidden shadow-2xl border bg-white dark:bg-gray-900 flex flex-col">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-lg font-bold truncate max-w-[70vw]">AI Video Ideas</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetMemory}
              aria-label="Reset Memory"
              title="Reset Memory"
              className="text-yellow-600 hover:text-yellow-700"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4" style={{ minHeight: 420, maxHeight: 600 }}>
          {conversations[topic]?.length ? (
            conversations[topic].map((entry, idx) => (
              <div key={idx} className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Prompt:</div>
                <div className="font-medium text-sm mb-2 break-words">{entry.prompt}</div>
                <div className="text-xs text-muted-foreground mb-1">AI Idea:</div>
                <div style={{ fontSize: '1.12rem', lineHeight: '1.8', wordBreak: 'break-word', color: '#222', background: 'white', borderRadius: 8, padding: 8 }} className="prose prose-base dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.response}</ReactMarkdown>
                </div>
              </div>
            ))
          ) : loading ? (
            <div className="flex justify-center items-center h-32"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
          ) : error ? (
            <div className="text-destructive text-sm text-center">{error}</div>
          ) : null}
        </div>
        <form
          className="flex items-center gap-2 border-t p-2 bg-gray-50 dark:bg-gray-800"
          onSubmit={e => {
            e.preventDefault();
            if (input.trim() && !loading) handleSend(input.trim());
          }}
        >
          <input
            type="text"
            className="flex-1 rounded-md border px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ask for another idea or variation..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            autoFocus={open}
          />
          <Button type="submit" size="sm" disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
