"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Target,
  Clock,
  Heart,
  Users,
  DollarSign,
  LayoutDashboard,
  Search,
  Plus,
  ArrowRight,
} from "lucide-react";

import { useCommandMenu } from "@/stores/command-menu";
import { useGoalStore } from "@/stores/goals";
import { useHealthStore } from "@/stores/health";
import { useTimeBlockStore } from "@/stores/time-blocks";
import { useRelationshipStore } from "@/stores/relationships";
import { useFinanceStore } from "@/stores/finance";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const navigationPages = [
  { label: "Today", href: "/", icon: LayoutDashboard },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Time", href: "/time", icon: Clock },
  { label: "Health", href: "/health", icon: Heart },
  { label: "Relationships", href: "/relationships", icon: Users },
  { label: "Finance", href: "/finance", icon: DollarSign },
];

const quickActions = [
  { label: "Add Goal", href: "/goals", icon: Plus },
  { label: "Log Health", href: "/health", icon: Plus },
  { label: "Add Time Block", href: "/time", icon: Plus },
  { label: "Add Contact", href: "/relationships", icon: Plus },
  { label: "Record Paycheck", href: "/finance", icon: Plus },
];

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ResultItem {
  id: string;
  label: string;
  meta?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const MAX_PER_CATEGORY = 5;

function formatGoalType(t: string): string {
  switch (t) {
    case "VISION":
      return "Vision";
    case "QUARTERLY_QUEST":
      return "Quest";
    case "WEEKLY":
      return "Weekly";
    default:
      return t;
  }
}

function formatRelationType(t: string): string {
  switch (t) {
    case "SPOUSE":
      return "Spouse";
    case "FAMILY":
      return "Family";
    case "FRIEND":
      return "Friend";
    case "COLLEAGUE":
      return "Colleague";
    case "MENTOR":
      return "Mentor";
    default:
      return t;
  }
}

function formatBlockCategory(t: string): string {
  switch (t) {
    case "DEEP_WORK":
      return "Deep Work";
    case "FITNESS":
      return "Fitness";
    case "SOCIAL":
      return "Social";
    case "ADMIN":
      return "Admin";
    default:
      return t;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CommandMenu() {
  // Open-state lives in a store so the mobile bottom-bar "+" can open it too;
  // ⌘/Ctrl-K still toggles on desktop.
  const open = useCommandMenu((s) => s.open);
  const setOpen = useCommandMenu((s) => s.setOpen);
  const toggle = useCommandMenu((s) => s.toggle);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);

  // Store data
  const goals = useGoalStore((s) => s.goals);
  const relationships = useRelationshipStore((s) => s.relationships);
  const blocks = useTimeBlockStore((s) => s.blocks);
  const rules = useFinanceStore((s) => s.rules);

  // ---- Cmd+K listener ----
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelectedIndex(0);
    }
  }, [open]);

  // ---- Build flat result list ----
  const { sections, flatItems } = useMemo(() => {
    const q = search.toLowerCase().trim();
    const sectionMap: Record<string, ResultItem[]> = {};

    const addToSection = (key: string, items: ResultItem[]) => {
      if (items.length > 0) {
        sectionMap[key] = items.slice(0, MAX_PER_CATEGORY);
      }
    };

    if (q === "") {
      // Show quick actions + navigation when search is empty
      addToSection(
        "Quick Actions",
        quickActions.map((a) => ({
          id: `qa-${a.href}-${a.label}`,
          label: a.label,
          href: a.href,
          icon: a.icon,
          category: "Quick Actions",
        }))
      );

      addToSection(
        "Navigation",
        navigationPages.map((p) => ({
          id: `nav-${p.href}`,
          label: p.label,
          href: p.href,
          icon: p.icon,
          category: "Navigation",
        }))
      );
    } else {
      // Search navigation pages
      const navResults = navigationPages
        .filter((p) => p.label.toLowerCase().includes(q))
        .map((p) => ({
          id: `nav-${p.href}`,
          label: p.label,
          href: p.href,
          icon: p.icon,
          category: "Navigation",
        }));
      addToSection("Navigation", navResults);

      // Search goals
      const goalResults = goals
        .filter((g) => g.title.toLowerCase().includes(q))
        .map((g) => ({
          id: `goal-${g.id}`,
          label: g.title,
          meta: formatGoalType(g.type),
          href: "/goals",
          icon: Target,
          category: "Goals",
        }));
      addToSection("Goals", goalResults);

      // Search contacts / relationships
      const contactResults = relationships
        .filter((r) => r.name.toLowerCase().includes(q))
        .map((r) => ({
          id: `rel-${r.id}`,
          label: r.name,
          meta: formatRelationType(r.relationType),
          href: "/relationships",
          icon: Users,
          category: "People",
        }));
      addToSection("People", contactResults);

      // Search time blocks
      const blockResults = blocks
        .filter((b) => b.title.toLowerCase().includes(q))
        .map((b) => ({
          id: `block-${b.id}`,
          label: b.title,
          meta: formatBlockCategory(b.category),
          href: "/time",
          icon: Clock,
          category: "Time Blocks",
        }));
      addToSection("Time Blocks", blockResults);

      // Search finance rules
      const financeResults = rules
        .filter((r) => r.incomeSource.toLowerCase().includes(q))
        .map((r) => ({
          id: `fin-${r.id}`,
          label: r.incomeSource,
          meta: "Income Rule",
          href: "/finance",
          icon: DollarSign,
          category: "Finance",
        }));
      addToSection("Finance", financeResults);
    }

    // Flatten for keyboard navigation
    const orderedKeys = q === ""
      ? ["Quick Actions", "Navigation"]
      : ["Navigation", "Goals", "People", "Time Blocks", "Finance"];

    const sectionsList: { key: string; items: ResultItem[] }[] = [];
    const flat: ResultItem[] = [];

    for (const key of orderedKeys) {
      if (sectionMap[key]) {
        sectionsList.push({ key, items: sectionMap[key] });
        flat.push(...sectionMap[key]);
      }
    }

    return { sections: sectionsList, flatItems: flat };
  }, [search, goals, relationships, blocks, rules]);

  // Clamp selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // ---- Select handler ----
  const handleSelect = useCallback(
    (item: ResultItem) => {
      router.push(item.href);
      setOpen(false);
      setSearch("");
    },
    [router]
  );

  // ---- Scroll selected item into view ----
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector("[data-selected='true']");
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  // ---- Keyboard navigation ----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (flatItems.length === 0) return;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % flatItems.length);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + flatItems.length) % flatItems.length);
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (flatItems[selectedIndex]) {
            handleSelect(flatItems[selectedIndex]);
          }
          break;
        }
      }
    },
    [flatItems, selectedIndex, handleSelect]
  );

  // ---- Render ----
  let flatIdx = 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Search bar */}
        <div className="flex items-center gap-2 p-3 border-b border-[var(--border)]">
          <Search className="h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Search commands, goals, people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 focus-visible:ring-0 h-9 bg-transparent px-0"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-[var(--border)] bg-white/[0.03] px-1.5 font-mono text-[10px] font-medium text-[var(--muted-foreground)]">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {sections.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-[var(--muted-foreground)]">
              No results found.
            </p>
          )}

          {sections.map((section) => {
            const sectionStartIdx = flatIdx;

            return (
              <div key={section.key} className={sectionStartIdx > 0 ? "mt-2" : ""}>
                <p className="px-3 py-1.5 text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-widest">
                  {section.key}
                </p>

                {section.items.map((item) => {
                  const currentIdx = flatIdx;
                  flatIdx++;
                  const isSelected = currentIdx === selectedIndex;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      data-selected={isSelected}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(currentIdx)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors text-left group ${
                        isSelected
                          ? "bg-white/[0.07] text-[var(--foreground)]"
                          : "hover:bg-white/[0.04]"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isSelected
                            ? "text-[var(--violet)]"
                            : "text-[var(--muted-foreground)] group-hover:text-[var(--violet)]"
                        }`}
                      />
                      <span className="flex-1 truncate">{item.label}</span>

                      {item.meta && (
                        <span className="shrink-0 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)]">
                          {item.meta}
                        </span>
                      )}

                      {isSelected && (
                        <ArrowRight className="h-3 w-3 shrink-0 text-[var(--muted-foreground)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t border-[var(--border)] px-3 py-2">
          <div className="flex items-center gap-2 text-[10px] text-[var(--muted-foreground)]">
            <kbd className="rounded border border-[var(--border)] bg-white/[0.03] px-1 py-0.5 font-mono">
              &uarr;&darr;
            </kbd>
            <span>navigate</span>
            <kbd className="rounded border border-[var(--border)] bg-white/[0.03] px-1 py-0.5 font-mono">
              &crarr;
            </kbd>
            <span>select</span>
          </div>
          <span className="text-[10px] text-[var(--muted-foreground)]">
            {flatItems.length} result{flatItems.length !== 1 ? "s" : ""}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
