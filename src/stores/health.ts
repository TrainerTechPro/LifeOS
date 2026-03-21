import { create } from "zustand";

export interface HealthLog {
  id: string;
  userId: string;
  date: string;
  sleepScore?: number | null;
  workoutType?: string | null;
  zone2Minutes?: number | null;
  calories?: number | null;
  notes?: string | null;
  beltRank?: string | null;
  matTimeMin?: number | null;
  liftVolume?: number | null;
}

interface HealthState {
  logs: HealthLog[];
  setLogs: (logs: HealthLog[]) => void;
  addLog: (log: HealthLog) => void;
  updateLog: (id: string, updates: Partial<HealthLog>) => void;
}

export const useHealthStore = create<HealthState>((set) => ({
  logs: [],
  setLogs: (logs) => set({ logs }),
  addLog: (log) => set((state) => ({ logs: [log, ...state.logs] })),
  updateLog: (id, updates) =>
    set((state) => ({
      logs: state.logs.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),
}));
