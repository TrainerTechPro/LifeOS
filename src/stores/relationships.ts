import { create } from "zustand";

export type RelationType = "SPOUSE" | "FAMILY" | "FRIEND" | "COLLEAGUE" | "MENTOR";

export interface Relationship {
  id: string;
  userId: string;
  name: string;
  relationType: RelationType;
  birthday?: string | null;
  lastContactDate?: string | null;
  contactFrequency: number;
  notes?: string | null;
}

interface RelationshipState {
  relationships: Relationship[];
  setRelationships: (relationships: Relationship[]) => void;
  addRelationship: (relationship: Relationship) => void;
  updateRelationship: (id: string, updates: Partial<Relationship>) => void;
  removeRelationship: (id: string) => void;
}

export const useRelationshipStore = create<RelationshipState>((set) => ({
  relationships: [],
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
}));
