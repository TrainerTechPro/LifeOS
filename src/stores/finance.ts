import { create } from "zustand";

export interface FinanceRule {
  id: string;
  userId: string;
  incomeSource: string;
  taxPercentage: number;
  savePercentage: number;
  investPercentage: number;
  operationsPercentage: number;
}

interface FinanceState {
  rules: FinanceRule[];
  setRules: (rules: FinanceRule[]) => void;
  addRule: (rule: FinanceRule) => void;
  updateRule: (id: string, updates: Partial<FinanceRule>) => void;
  removeRule: (id: string) => void;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  rules: [],
  setRules: (rules) => set({ rules }),
  addRule: (rule) => set((state) => ({ rules: [...state.rules, rule] })),
  updateRule: (id, updates) =>
    set((state) => ({
      rules: state.rules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),
  removeRule: (id) =>
    set((state) => ({ rules: state.rules.filter((r) => r.id !== id) })),
}));
