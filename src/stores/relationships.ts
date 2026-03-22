import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RelationType = "SPOUSE" | "FAMILY" | "FRIEND" | "COLLEAGUE" | "MENTOR";

export interface Relationship {
  id: string;
  name: string;
  relationType: RelationType;
  birthday?: string | null;
  lastContactDate?: string | null;
  contactFrequency: number;
  notes?: string | null;
  interactions?: { date: string; note: string }[];
}

interface RelationshipState {
  relationships: Relationship[];
  setRelationships: (relationships: Relationship[]) => void;
  addRelationship: (relationship: Relationship) => void;
  updateRelationship: (id: string, updates: Partial<Relationship>) => void;
  removeRelationship: (id: string) => void;
  addInteraction: (id: string, note: string) => void;
}

const SEED_RELATIONSHIPS: Relationship[] = [
  { id: "r1", name: "Sarah", relationType: "SPOUSE", lastContactDate: "2026-03-22", contactFrequency: 1, birthday: "1994-08-15", notes: "Always there", interactions: [{ date: "2026-03-22", note: "Dinner together" }, { date: "2026-03-21", note: "Morning coffee chat" }] },
  { id: "r2", name: "Coach Davidson", relationType: "MENTOR", lastContactDate: "2026-03-08", contactFrequency: 7, notes: "Discuss program periodization", interactions: [{ date: "2026-03-08", note: "Phone call about next season" }] },
  { id: "r3", name: "Alex Martinez", relationType: "FRIEND", lastContactDate: "2026-03-05", contactFrequency: 14, birthday: "1992-11-02", notes: "Training partner, brown belt", interactions: [{ date: "2026-03-05", note: "BJJ open mat together" }] },
  { id: "r4", name: "Dr. Williams", relationType: "COLLEAGUE", lastContactDate: "2026-03-10", contactFrequency: 14, notes: "Department chair - tenure committee", interactions: [{ date: "2026-03-10", note: "Meeting about research grant" }] },
  { id: "r5", name: "Mom & Dad", relationType: "FAMILY", lastContactDate: "2026-03-14", contactFrequency: 7, notes: "Sunday calls", interactions: [{ date: "2026-03-14", note: "Weekly video call" }] },
  { id: "r6", name: "Jake Thompson", relationType: "FRIEND", lastContactDate: "2026-02-28", contactFrequency: 30, notes: "College roommate", interactions: [] },
  { id: "r7", name: "Prof. Nakamura", relationType: "COLLEAGUE", lastContactDate: "2026-03-01", contactFrequency: 21, notes: "Research collaborator", interactions: [{ date: "2026-03-01", note: "Reviewed draft together" }] },
  { id: "r8", name: "Marcus Rivera", relationType: "FRIEND", lastContactDate: "2026-03-18", contactFrequency: 14, birthday: "1993-05-20", notes: "BJJ blue belt", interactions: [{ date: "2026-03-18", note: "Training session" }] },
];

export const useRelationshipStore = create<RelationshipState>()(
  persist(
    (set) => ({
      relationships: SEED_RELATIONSHIPS,
      setRelationships: (relationships) => set({ relationships }),
      addRelationship: (r) =>
        set((state) => ({ relationships: [...state.relationships, r] })),
      updateRelationship: (id, updates) =>
        set((state) => ({
          relationships: state.relationships.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),
      removeRelationship: (id) =>
        set((state) => ({
          relationships: state.relationships.filter((r) => r.id !== id),
        })),
      addInteraction: (id, note) =>
        set((state) => ({
          relationships: state.relationships.map((r) =>
            r.id === id
              ? {
                  ...r,
                  lastContactDate: new Date().toISOString().split("T")[0],
                  interactions: [
                    { date: new Date().toISOString().split("T")[0], note },
                    ...(r.interactions || []),
                  ],
                }
              : r
          ),
        })),
    }),
    { name: "lifeos-relationships" }
  )
);
