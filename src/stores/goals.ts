import { create } from "zustand";

export type GoalType = "VISION" | "QUARTERLY_QUEST" | "WEEKLY";
export type GoalStatus = "IN_PROGRESS" | "COMPLETED";

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  type: GoalType;
  status: GoalStatus;
  targetDate?: string | null;
  order: number;
  parentId?: string | null;
  createdAt: string;
}

interface GoalState {
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  reorderGoals: (goals: Goal[]) => void;
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: [],
  setGoals: (goals) => set({ goals }),
  addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
  updateGoal: (id, updates) =>
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    })),
  removeGoal: (id) =>
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),
  reorderGoals: (goals) => set({ goals }),
}));
