import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GoalType = "VISION" | "QUARTERLY_QUEST" | "WEEKLY";
export type GoalStatus = "IN_PROGRESS" | "COMPLETED";

export interface Goal {
  id: string;
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

const SEED_GOALS: Goal[] = [
  { id: "v1", title: "Become a tenured professor in kinesiology", type: "VISION", status: "IN_PROGRESS", order: 0, createdAt: "2025-01-01T00:00:00Z" },
  { id: "v2", title: "Build a nationally competitive D1 throws program", type: "VISION", status: "IN_PROGRESS", order: 1, createdAt: "2025-01-01T00:00:00Z" },
  { id: "v3", title: "Achieve financial independence through LLC + investments", type: "VISION", status: "IN_PROGRESS", order: 2, createdAt: "2025-01-01T00:00:00Z" },
  { id: "q1", title: "Publish biomechanics research paper", description: "Submit to Journal of Sports Science", type: "QUARTERLY_QUEST", status: "IN_PROGRESS", targetDate: "2026-06-30", order: 0, parentId: "v1", createdAt: "2026-01-05T00:00:00Z" },
  { id: "q2", title: "Recruit 3 elite-level throwers", description: "Focus on shot put and discus athletes", type: "QUARTERLY_QUEST", status: "IN_PROGRESS", targetDate: "2026-06-30", order: 1, parentId: "v2", createdAt: "2026-01-05T00:00:00Z" },
  { id: "q3", title: "Complete Smolov squat cycle", description: "Target: 500lb squat", type: "QUARTERLY_QUEST", status: "COMPLETED", targetDate: "2026-03-31", order: 2, createdAt: "2026-01-05T00:00:00Z" },
  { id: "q4", title: "Set up automated investment pipeline", description: "Monthly auto-invest into index funds", type: "QUARTERLY_QUEST", status: "IN_PROGRESS", targetDate: "2026-06-30", order: 3, parentId: "v3", createdAt: "2026-01-05T00:00:00Z" },
  { id: "q5", title: "Earn next Jiu-Jitsu belt promotion", description: "3x/week mat time minimum", type: "QUARTERLY_QUEST", status: "IN_PROGRESS", targetDate: "2026-06-30", order: 4, createdAt: "2026-01-05T00:00:00Z" },
  { id: "w1", title: "Draft intro section of paper", type: "WEEKLY", status: "IN_PROGRESS", order: 0, parentId: "q1", createdAt: "2026-03-17T00:00:00Z" },
  { id: "w2", title: "Contact recruits from Texas meet", type: "WEEKLY", status: "IN_PROGRESS", order: 1, parentId: "q2", createdAt: "2026-03-17T00:00:00Z" },
  { id: "w3", title: "Squat session: Week 2, Day 1", type: "WEEKLY", status: "COMPLETED", order: 2, createdAt: "2026-03-17T00:00:00Z" },
  { id: "w4", title: "Review investment allocations", type: "WEEKLY", status: "IN_PROGRESS", order: 3, parentId: "q4", createdAt: "2026-03-17T00:00:00Z" },
];

export const useGoalStore = create<GoalState>()(
  persist(
    (set) => ({
      goals: SEED_GOALS,
      setGoals: (goals) => set({ goals }),
      addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),
      removeGoal: (id) =>
        set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),
      reorderGoals: (goals) => set({ goals }),
    }),
    { name: "lifeos-goals" }
  )
);
