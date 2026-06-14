import { create } from "zustand";

/**
 * Open-state for the global Command Menu, lifted into a store so it can be
 * opened from anywhere — the ⌘/Ctrl-K shortcut on desktop AND the touch
 * quick-add button in the mobile bottom bar (the keyboard shortcut is
 * unreachable on a phone).
 */
interface CommandMenuState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useCommandMenu = create<CommandMenuState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
}));
