import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface HealthLog {
  id: string;
  date: string;
  sleepScore: number;
  workoutType: string;
  zone2Minutes: number;
  calories: number;
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
  removeLog: (id: string) => void;
}

const SEED_LOGS: HealthLog[] = [
  { id: "h1", date: "2026-03-22", sleepScore: 8, workoutType: "Smolov Squat W3D2", zone2Minutes: 0, calories: 3300, liftVolume: 13500 },
  { id: "h2", date: "2026-03-21", sleepScore: 8, workoutType: "Smolov Squat W3D1", zone2Minutes: 0, calories: 3200, liftVolume: 12500 },
  { id: "h3", date: "2026-03-20", sleepScore: 7, workoutType: "Jiu-Jitsu", zone2Minutes: 0, calories: 2800, matTimeMin: 90, beltRank: "Purple" },
  { id: "h4", date: "2026-03-19", sleepScore: 9, workoutType: "Zone 2 + Upper Body", zone2Minutes: 45, calories: 2600, liftVolume: 8200 },
  { id: "h5", date: "2026-03-18", sleepScore: 8, workoutType: "Smolov Squat W2D3", zone2Minutes: 0, calories: 3400, liftVolume: 14200 },
  { id: "h6", date: "2026-03-17", sleepScore: 6, workoutType: "Jiu-Jitsu", zone2Minutes: 0, calories: 2900, matTimeMin: 75, beltRank: "Purple" },
  { id: "h7", date: "2026-03-16", sleepScore: 8, workoutType: "Throws Practice", zone2Minutes: 30, calories: 3100, liftVolume: 6000 },
  { id: "h8", date: "2026-03-15", sleepScore: 7, workoutType: "Rest Day", zone2Minutes: 40, calories: 2400 },
  { id: "h9", date: "2026-03-14", sleepScore: 9, workoutType: "Smolov Squat W2D2", zone2Minutes: 0, calories: 3250, liftVolume: 11800 },
  { id: "h10", date: "2026-03-13", sleepScore: 7, workoutType: "Jiu-Jitsu", zone2Minutes: 0, calories: 2750, matTimeMin: 60, beltRank: "Purple" },
  { id: "h11", date: "2026-03-12", sleepScore: 8, workoutType: "Zone 2 + Upper Body", zone2Minutes: 50, calories: 2700, liftVolume: 7500 },
  { id: "h12", date: "2026-03-11", sleepScore: 6, workoutType: "Smolov Squat W2D1", zone2Minutes: 0, calories: 3350, liftVolume: 12000 },
  { id: "h13", date: "2026-03-10", sleepScore: 8, workoutType: "Jiu-Jitsu", zone2Minutes: 0, calories: 2850, matTimeMin: 90, beltRank: "Purple" },
  { id: "h14", date: "2026-03-09", sleepScore: 9, workoutType: "Rest Day", zone2Minutes: 35, calories: 2300 },
];

export const useHealthStore = create<HealthState>()(
  persist(
    (set) => ({
      logs: SEED_LOGS,
      setLogs: (logs) => set({ logs }),
      addLog: (log) => set((state) => ({ logs: [log, ...state.logs] })),
      updateLog: (id, updates) =>
        set((state) => ({
          logs: state.logs.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        })),
      removeLog: (id) =>
        set((state) => ({ logs: state.logs.filter((l) => l.id !== id) })),
    }),
    { name: "lifeos-health" }
  )
);
