/**
 * Zustand store for bridging AI chat message requests from anywhere in the app.
 * Allows external components (e.g. trending page) to send a message to the AI chat as if the user typed it.
 * The YoutubeAIChat component listens for a pending message and processes it as a user message.
 */
import { create } from 'zustand';

interface AiChatBridgeState {
  pendingMessage: string | null;
  setPendingMessage: (msg: string) => void;
  clearPendingMessage: () => void;
}

export const useAiChatBridgeStore = create<AiChatBridgeState>((set) => ({
  pendingMessage: null,
  setPendingMessage: (msg) => set({ pendingMessage: msg }),
  clearPendingMessage: () => set({ pendingMessage: null }),
}));
