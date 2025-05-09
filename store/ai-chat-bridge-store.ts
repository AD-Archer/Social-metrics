/**
 * Zustand store for bridging AI chat message requests from anywhere in the app.
 * Allows external components (e.g. trending page) to send a message to the AI chat as if the user typed it.
 * The YoutubeAIChat component listens for a pending message and processes it as a user message.
 * Also stores recent AI messages for the AI Calendar Bridge component to analyze for scheduling content.
 */
import { create } from 'zustand';

interface AiChatBridgeState {
  pendingMessage: string | null;
  aiMessages: string[]; // Store recent AI messages for calendar processing
  setPendingMessage: (msg: string) => void;
  clearPendingMessage: () => void;
  addAIMessage: (message: string) => void; // Track AI responses
  resetAIMessages: () => void; // Clear the message history
}

export const useAiChatBridgeStore = create<AiChatBridgeState>((set) => ({
  pendingMessage: null,
  aiMessages: [],
  setPendingMessage: (msg) => set({ pendingMessage: msg }),
  clearPendingMessage: () => set({ pendingMessage: null }),
  addAIMessage: (message) => set((state) => ({ 
    aiMessages: [...state.aiMessages, message]
  })),
  resetAIMessages: () => set({ aiMessages: [] }),
}));
