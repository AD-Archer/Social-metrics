/**
 * Calendar store for managing content calendar events.
 * Handles the loading, creation, updating, and deletion of calendar events.
 * Integrates with Firebase Firestore for data persistence and with the AI
 * chat system to extract event details from conversations.
 * Provides subscription token management for calendar sharing and syncing.
 */
import { create } from 'zustand';
import { doc, collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateCalendarSubscriptionToken } from '@/lib/utils';
import type { User } from 'firebase/auth';

// Calendar event interface
export interface CalendarEvent {
  id?: string;
  userId: string;
  title: string;
  description: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  allDay?: boolean;
  color?: string; // Optional color for the event
  source: 'manual' | 'ai'; // Source of the event creation
  createdAt: string;
  updatedAt: string;
}

// Calendar subscription token interface
export interface CalendarSubscription {
  id?: string;
  userId: string;
  token: string;
  createdAt: string;
  name?: string; // Optional name/description for this token
}

// Define the store state interface
interface CalendarState {
  events: CalendarEvent[];
  subscriptions: CalendarSubscription[];
  isLoading: boolean;
  error: string | null;
  
  // Events actions
  fetchEvents: (userId: string) => Promise<void>;
  createEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string | undefined>;
  updateEvent: (eventId: string, eventData: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  
  // Subscription actions
  fetchSubscriptionTokens: (userId: string) => Promise<void>;
  createSubscriptionToken: (userId: string, name?: string) => Promise<CalendarSubscription | undefined>;
  deleteSubscriptionToken: (tokenId: string) => Promise<void>;
  
  // AI-related actions
  extractEventFromAIChatMessage: (message: string, userId: string) => Promise<string | null>;
}

// Helper to extract date information from AI messages
const extractDateInfo = (message: string): { date: Date | null, title: string | null } => {
  const titlePattern = /(?:titled|called|named|about|on the topic of|with the title)\s+"([^"]+)"|(?:titled|called|named|about|on the topic of|with the title)\s+([^,.]+)/i;
  const titleMatch = message.match(titlePattern);
  const title = titleMatch ? titleMatch[1] || titleMatch[2] : null; // Move declaration to the top

  // Various date patterns: "June 12", "June 12th", "12th of June", "12/06", "06-12" etc.
  const datePatterns = [
    // Matches patterns like "June 12" or "June 12th" or "June 12, 2025"
    /(?:on|by|for|at|post(?:ing)? (?:this|on))\s+([a-z]+)\s+(\d+)(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?/i,
    // Matches patterns like "12th of June" or "12 June"
    /(?:on|by|for|at|post(?:ing)? (?:this|on))\s+(\d+)(?:st|nd|rd|th)?\s+(?:of\s+)?([a-z]+)(?:,?\s+(\d{4}))?/i,
    // Matches MM/DD or DD/MM patterns
    /(?:on|by|for|at|post(?:ing)? (?:this|on))\s+(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?/i,
    // Add support for parsing standalone day numbers like "26th"
    /(?:on|by|for|at|post(?:ing)? (?:this|on))\s+(\d+)(?:st|nd|rd|th)?/i,
  ];

  // Add support for relative dates like "tomorrow" or "in 3 days"
  const relativeDatePatterns = [
    /\b(tomorrow)\b/i,
    /\b(in\s+(\d+)\s+days)\b/i,
    /\b(next\s+week)\b/i
  ];

  for (const pattern of relativeDatePatterns) {
    const match = message.match(pattern);
    if (match) {
      const now = new Date();
      if (match[1]?.toLowerCase() === 'tomorrow') {
        now.setDate(now.getDate() + 1);
        return { date: now, title };
      } else if (match[2]) { // "in X days"
        const days = parseInt(match[2], 10);
        now.setDate(now.getDate() + days);
        return { date: now, title };
      } else if (match[1]?.toLowerCase() === 'next week') {
        now.setDate(now.getDate() + 7);
        return { date: now, title };
      }
    }
  }

  // Try to extract date using the patterns
  for (const pattern of datePatterns) {
    const match = message.match(pattern);
    if (match) {
      try {
        if (match.length === 2) { // Standalone day number
          const day = parseInt(match[1]);
          const now = new Date();
          return {
            date: new Date(now.getFullYear(), now.getMonth(), day),
            title
          };
        }
        // Different date format handling based on the pattern
        if (isNaN(parseInt(match[1]))) {
          // First pattern: Month Name + Day
          const month = match[1];
          const day = parseInt(match[2]);
          const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
          const monthIndex = new Date(`${month} 1, 2000`).getMonth();
          return { 
            date: new Date(year, monthIndex, day),
            title
          };
        } else if (match[2] && isNaN(parseInt(match[2]))) {
          // Second pattern: Day + Month Name
          const day = parseInt(match[1]);
          const month = match[2];
          const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
          const monthIndex = new Date(`${month} 1, 2000`).getMonth();
          return { 
            date: new Date(year, monthIndex, day),
            title 
          };
        } else {
          // Third pattern: numeric dates (MM/DD or DD/MM)
          // Assuming MM/DD format for simplicity, but this could be made configurable
          const first = parseInt(match[1]);
          const second = parseInt(match[2]);
          const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
          
          // Simple heuristic: if first number > 12, it's probably a day
          if (first > 12) {
            return { 
              date: new Date(year, second - 1, first),
              title 
            };
          } else {
            return { 
              date: new Date(year, first - 1, second),
              title 
            };
          }
        }
      } catch (e) {
        console.error("Date parsing error:", e);
        return { date: null, title };
      }
    }
  }

  return { date: null, title };
};

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  subscriptions: [],
  isLoading: false,
  error: null,

  fetchEvents: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const eventsCollection = collection(db, 'calendar-events');
      const eventsQuery = query(eventsCollection, where('userId', '==', userId));
      const querySnapshot = await getDocs(eventsQuery);
      
      const events: CalendarEvent[] = [];
      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() } as CalendarEvent);
      });
      
      set({ events, isLoading: false });
    } catch (error) {
      console.error("Error fetching events:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch calendar events", 
        isLoading: false 
      });
    }
  },

  createEvent: async (eventData) => {
    set({ isLoading: true, error: null });
    try {
      const now = new Date().toISOString();
      const newEvent: Omit<CalendarEvent, 'id'> = {
        ...eventData,
        createdAt: now,
        updatedAt: now
      };
      
      console.log("Creating event with userId:", eventData.userId);
      console.log("Creating event with data:", newEvent);
      const docRef = await addDoc(collection(db, 'calendar-events'), newEvent);
      console.log("Event created with ID:", docRef.id);
      
      // Update local state
      const eventWithId: CalendarEvent = { id: docRef.id, ...newEvent };
      set((state) => ({ 
        events: [...state.events, eventWithId],
        isLoading: false 
      }));
      console.log("Updated events in local state:", get().events);
      
      return docRef.id;
    } catch (error) {
      console.error("Error creating event:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to create calendar event", 
        isLoading: false 
      });
      return undefined;
    }
  },

  updateEvent: async (eventId, eventData) => {
    set({ isLoading: true, error: null });
    try {
      const eventRef = doc(db, 'calendar-events', eventId);
      
      // Add updated timestamp
      const updateData = {
        ...eventData,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(eventRef, updateData);
      
      // Update local state
      set((state) => ({
        events: state.events.map(event => 
          event.id === eventId ? { ...event, ...updateData } : event
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error("Error updating event:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to update calendar event", 
        isLoading: false 
      });
    }
  },

  deleteEvent: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      const eventRef = doc(db, 'calendar-events', eventId);
      await deleteDoc(eventRef);
      
      // Update local state
      set((state) => ({
        events: state.events.filter(event => event.id !== eventId),
        isLoading: false
      }));
    } catch (error) {
      console.error("Error deleting event:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to delete calendar event", 
        isLoading: false 
      });
    }
  },

  fetchSubscriptionTokens: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const subscriptionsCollection = collection(db, 'calendar-subscriptions');
      const subscriptionsQuery = query(subscriptionsCollection, where('userId', '==', userId));
      const querySnapshot = await getDocs(subscriptionsQuery);
      
      const subscriptions: CalendarSubscription[] = [];
      querySnapshot.forEach((doc) => {
        subscriptions.push({ id: doc.id, ...doc.data() } as CalendarSubscription);
      });
      
      set({ subscriptions, isLoading: false });
    } catch (error) {
      console.error("Error fetching subscription tokens:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch subscription tokens", 
        isLoading: false 
      });
    }
  },

  createSubscriptionToken: async (userId: string, name?: string) => {
    set({ isLoading: true, error: null });
    try {
      const now = new Date().toISOString();
      const tokenData = generateCalendarSubscriptionToken(userId);
      const newSubscription: Omit<CalendarSubscription, 'id'> = {
        userId,
        token: tokenData.token,
        createdAt: now,
        name
      };
      
      const docRef = await addDoc(collection(db, 'calendar-subscriptions'), newSubscription);
      
      // Update local state
      const subscriptionWithId: CalendarSubscription = { id: docRef.id, ...newSubscription };
      set((state) => ({ 
        subscriptions: [...state.subscriptions, subscriptionWithId],
        isLoading: false 
      }));
      
      return subscriptionWithId;
    } catch (error) {
      console.error("Error creating subscription token:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to create subscription token", 
        isLoading: false 
      });
      return undefined;
    }
  },

  deleteSubscriptionToken: async (tokenId) => {
    set({ isLoading: true, error: null });
    try {
      const tokenRef = doc(db, 'calendar-subscriptions', tokenId);
      await deleteDoc(tokenRef);
      
      // Update local state
      set((state) => ({
        subscriptions: state.subscriptions.filter(subscription => subscription.id !== tokenId),
        isLoading: false
      }));
    } catch (error) {
      console.error("Error deleting subscription token:", error);
      set({ 
        error: error instanceof Error ? error.message : "Failed to delete subscription token", 
        isLoading: false 
      });
    }
  },

  extractEventFromAIChatMessage: async (message, userId) => {
    try {
      // Extract date and potential title from the message
      const { date, title } = extractDateInfo(message);
      
      if (!date || isNaN(date.getTime())) { // Validate the date
        console.error("Invalid date extracted from AI message:", message);
        return null; // Return null if the date is invalid
      }

      // Extract a description from the message by taking relevant context
      const descriptionPattern = /(?:about|create a video about|make a video about|on the topic of)\s+([^,.?!]+)/i;
      const descriptionMatch = message.match(descriptionPattern);
      const description = descriptionMatch 
        ? descriptionMatch[1] 
        : message.substring(0, 100) + (message.length > 100 ? '...' : '');

      // Request AI to generate a title and description if not provided
      const aiGeneratedTitle = title || `AI-Generated Title for ${date.toLocaleDateString()}`;
      const aiGeneratedDescription = description || `AI-Generated Description for an event on ${date.toLocaleDateString()}.`;

      // Create the event
      const eventData = {
        userId,
        title: aiGeneratedTitle,
        description: aiGeneratedDescription,
        startDate: date.toISOString(),
        allDay: true,
        source: 'ai' as const,
      };

      const eventId = await get().createEvent(eventData);
      return eventId || null;
    } catch (error) {
      console.error("Error extracting event from AI message:", error);
      set({ error: error instanceof Error ? error.message : "Failed to process AI message" });
      return null;
    }
  }
}));