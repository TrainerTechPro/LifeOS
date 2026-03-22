import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BlockCategory = "DEEP_WORK" | "FITNESS" | "SOCIAL" | "ADMIN";

export interface TimeBlock {
  id: string;
  title: string;
  category: BlockCategory;
  startHour: number;
  endHour: number;
  dayOfWeek: number;
  color: string;
}

export interface WeeklyReview {
  id: string;
  date: string;
  adherence: number;
  wins: string;
  adjustments: string;
}

interface TimeBlockState {
  blocks: TimeBlock[];
  reviews: WeeklyReview[];
  setBlocks: (blocks: TimeBlock[]) => void;
  addBlock: (block: TimeBlock) => void;
  updateBlock: (id: string, updates: Partial<TimeBlock>) => void;
  removeBlock: (id: string) => void;
  addReview: (review: WeeklyReview) => void;
}

const SEED_BLOCKS: TimeBlock[] = [
  { id: "tb1", title: "Kinesiology Lecture Prep", category: "DEEP_WORK", startHour: 7, endHour: 9, dayOfWeek: 0, color: "#7C5CFC" },
  { id: "tb2", title: "D1 Team Coaching", category: "DEEP_WORK", startHour: 14, endHour: 17, dayOfWeek: 0, color: "#7C5CFC" },
  { id: "tb3", title: "Strength Training", category: "FITNESS", startHour: 6, endHour: 7.5, dayOfWeek: 0, color: "#06D6A0" },
  { id: "tb4", title: "Research Writing", category: "DEEP_WORK", startHour: 9, endHour: 12, dayOfWeek: 1, color: "#7C5CFC" },
  { id: "tb5", title: "D1 Team Coaching", category: "DEEP_WORK", startHour: 14, endHour: 17, dayOfWeek: 1, color: "#7C5CFC" },
  { id: "tb6", title: "Jiu-Jitsu", category: "FITNESS", startHour: 18, endHour: 19.5, dayOfWeek: 1, color: "#06D6A0" },
  { id: "tb7", title: "Kinesiology Lecture", category: "DEEP_WORK", startHour: 8, endHour: 10, dayOfWeek: 2, color: "#7C5CFC" },
  { id: "tb8", title: "D1 Team Coaching", category: "DEEP_WORK", startHour: 14, endHour: 17, dayOfWeek: 2, color: "#7C5CFC" },
  { id: "tb9", title: "Strength Training", category: "FITNESS", startHour: 6, endHour: 7.5, dayOfWeek: 2, color: "#06D6A0" },
  { id: "tb10", title: "Zone 2 Cardio", category: "FITNESS", startHour: 7, endHour: 7.75, dayOfWeek: 3, color: "#06D6A0" },
  { id: "tb11", title: "Admin & Email", category: "ADMIN", startHour: 9, endHour: 10, dayOfWeek: 3, color: "#6B6B80" },
  { id: "tb12", title: "Recruit Calls", category: "SOCIAL", startHour: 10, endHour: 12, dayOfWeek: 3, color: "#FFB347" },
  { id: "tb13", title: "D1 Team Coaching", category: "DEEP_WORK", startHour: 14, endHour: 17, dayOfWeek: 3, color: "#7C5CFC" },
  { id: "tb14", title: "Jiu-Jitsu", category: "FITNESS", startHour: 18, endHour: 19.5, dayOfWeek: 3, color: "#06D6A0" },
  { id: "tb15", title: "Strength Training", category: "FITNESS", startHour: 6, endHour: 7.5, dayOfWeek: 4, color: "#06D6A0" },
  { id: "tb16", title: "D1 Team Coaching", category: "DEEP_WORK", startHour: 14, endHour: 17, dayOfWeek: 4, color: "#7C5CFC" },
  { id: "tb17", title: "Throws Practice", category: "FITNESS", startHour: 8, endHour: 10, dayOfWeek: 5, color: "#06D6A0" },
  { id: "tb18", title: "Family Time", category: "SOCIAL", startHour: 12, endHour: 17, dayOfWeek: 5, color: "#FFB347" },
  { id: "tb19", title: "Jiu-Jitsu Open Mat", category: "FITNESS", startHour: 10, endHour: 12, dayOfWeek: 6, color: "#06D6A0" },
  { id: "tb20", title: "Weekly Review", category: "ADMIN", startHour: 17, endHour: 18, dayOfWeek: 6, color: "#6B6B80" },
];

export const useTimeBlockStore = create<TimeBlockState>()(
  persist(
    (set) => ({
      blocks: SEED_BLOCKS,
      reviews: [],
      setBlocks: (blocks) => set({ blocks }),
      addBlock: (block) => set((state) => ({ blocks: [...state.blocks, block] })),
      updateBlock: (id, updates) =>
        set((state) => ({
          blocks: state.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),
      removeBlock: (id) =>
        set((state) => ({ blocks: state.blocks.filter((b) => b.id !== id) })),
      addReview: (review) =>
        set((state) => ({ reviews: [review, ...state.reviews] })),
    }),
    { name: "lifeos-timeblocks" }
  )
);
