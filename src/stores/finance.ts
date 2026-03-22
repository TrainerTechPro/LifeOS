import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FinanceRule {
  id: string;
  incomeSource: string;
  taxPercentage: number;
  savePercentage: number;
  investPercentage: number;
  operationsPercentage: number;
}

export interface PaycheckRecord {
  id: string;
  ruleId: string;
  grossAmount: number;
  date: string;
  note?: string;
}

interface FinanceState {
  rules: FinanceRule[];
  paychecks: PaycheckRecord[];
  setRules: (rules: FinanceRule[]) => void;
  addRule: (rule: FinanceRule) => void;
  updateRule: (id: string, updates: Partial<FinanceRule>) => void;
  removeRule: (id: string) => void;
  addPaycheck: (paycheck: PaycheckRecord) => void;
  removePaycheck: (id: string) => void;
}

const SEED_RULES: FinanceRule[] = [
  { id: "f1", incomeSource: "University Salary", taxPercentage: 30, savePercentage: 20, investPercentage: 25, operationsPercentage: 25 },
  { id: "f2", incomeSource: "LLC Revenue", taxPercentage: 25, savePercentage: 15, investPercentage: 35, operationsPercentage: 25 },
];

const SEED_PAYCHECKS: PaycheckRecord[] = [
  { id: "p1", ruleId: "f1", grossAmount: 5200, date: "2026-03-15", note: "March paycheck" },
  { id: "p2", ruleId: "f1", grossAmount: 5200, date: "2026-02-15", note: "February paycheck" },
  { id: "p3", ruleId: "f1", grossAmount: 5200, date: "2026-01-15", note: "January paycheck" },
  { id: "p4", ruleId: "f2", grossAmount: 3800, date: "2026-03-01", note: "March LLC" },
  { id: "p5", ruleId: "f2", grossAmount: 4200, date: "2026-02-01", note: "February LLC" },
  { id: "p6", ruleId: "f2", grossAmount: 3500, date: "2026-01-01", note: "January LLC" },
];

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      rules: SEED_RULES,
      paychecks: SEED_PAYCHECKS,
      setRules: (rules) => set({ rules }),
      addRule: (rule) => set((state) => ({ rules: [...state.rules, rule] })),
      updateRule: (id, updates) =>
        set((state) => ({
          rules: state.rules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),
      removeRule: (id) =>
        set((state) => ({ rules: state.rules.filter((r) => r.id !== id) })),
      addPaycheck: (paycheck) =>
        set((state) => ({ paychecks: [paycheck, ...state.paychecks] })),
      removePaycheck: (id) =>
        set((state) => ({ paychecks: state.paychecks.filter((p) => p.id !== id) })),
    }),
    { name: "lifeos-finance" }
  )
);
