import { create } from "zustand";

export type BlockCategory = "DEEP_WORK" | "FITNESS" | "SOCIAL" | "ADMIN";

export interface TimeBlock {
  id: string;
  userId: string;
  title: string;
  category: BlockCategory;
  startTime: string;
  endTime: string;
  isRoutine: boolean;
  dayOfWeek?: number | null;
  color?: string | null;
}

interface TimeBlockState {
  blocks: TimeBlock[];
  setBlocks: (blocks: TimeBlock[]) => void;
  addBlock: (block: TimeBlock) => void;
  updateBlock: (id: string, updates: Partial<TimeBlock>) => void;
  removeBlock: (id: string) => void;
}

export const useTimeBlockStore = create<TimeBlockState>((set) => ({
  blocks: [],
  setBlocks: (blocks) => set({ blocks }),
  addBlock: (block) => set((state) => ({ blocks: [...state.blocks, block] })),
  updateBlock: (id, updates) =>
    set((state) => ({
      blocks: state.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    })),
  removeBlock: (id) =>
    set((state) => ({ blocks: state.blocks.filter((b) => b.id !== id) })),
}));
