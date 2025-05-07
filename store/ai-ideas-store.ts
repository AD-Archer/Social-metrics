/**
 * Zustand store for managing a random subset of AI chat suggestion ideas for YouTube AI Chat.
 * On each mount, randomly selects 3–4 ideas (including trending if available) for the session.
 * Used by YoutubeAIChat to display a clean, focused set of suggestions.
 */
import { create } from 'zustand';

export interface AiIdea {
  id: string;
  text: string;
  dynamic?: boolean;
}

interface AiIdeasState {
  sessionIdeas: AiIdea[];
  setSessionIdeas: (ideas: AiIdea[]) => void;
  randomizeSessionIdeas: (allIdeas: AiIdea[], trendingIdea?: AiIdea) => void;
}

const allStaticIdeas: AiIdea[] = [
  { id: 'grow', text: 'How can I grow my YouTube channel faster?' },
  { id: 'upload-frequency', text: 'How frequently should I upload new videos for best results?' },
  { id: 'engagement', text: 'What are some ways to increase engagement on my channel?' },
  { id: 'content-ideas', text: 'Suggest unique video ideas based on my recent uploads.' },
  { id: 'algorithm', text: 'How can I improve my chances with the YouTube algorithm?' },
  { id: 'thumbnails', text: 'What makes a great YouTube thumbnail?' },
  { id: 'titles', text: 'How do I write titles that get more clicks?' },
  { id: 'analytics', text: 'What do my analytics say about my channel’s strengths and weaknesses?' },
  { id: 'trends', text: 'How can I spot and capitalize on new trends in my niche?' },
  { id: 'ideas', text: 'What are some questions I should ask an AI about my channel to help promote channel growth?' },
];

function getRandomIdeas(ideas: AiIdea[], count: number): AiIdea[] {
  const shuffled = [...ideas].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export const useAiIdeasStore = create<AiIdeasState>((set) => ({
  sessionIdeas: [],
  setSessionIdeas: (ideas) => set({ sessionIdeas: ideas }),
  randomizeSessionIdeas: (allIdeas, trendingIdea) => {
    let pool = allIdeas;
    if (trendingIdea && trendingIdea.text) {
      pool = allIdeas.filter(i => i.id !== 'trending');
      set({ sessionIdeas: [trendingIdea, ...getRandomIdeas(pool, 2)] });
    } else {
      set({ sessionIdeas: getRandomIdeas(pool, 3) });
    }
  },
}));

export { allStaticIdeas };
