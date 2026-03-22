"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

const commands = [
  { label: "Today", href: "/", icon: LayoutDashboard },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Time", href: "/time", icon: Clock },
  { label: "Health", href: "/health", icon: Heart },
  { label: "Relationships", href: "/relationships", icon: Users },
  { label: "Finance", href: "/finance", icon: DollarSign },
];

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="flex items-center gap-2 p-3 border-b border-[var(--border)]">
          <Search className="h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Search systems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 focus-visible:ring-0 h-9 bg-transparent px-0"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-[var(--border)] bg-white/[0.03] px-1.5 font-mono text-[10px] font-medium text-[var(--muted-foreground)]">
            ESC
          </kbd>
        </div>
        <div className="max-h-64 overflow-y-auto p-2">
          <p className="px-3 py-1.5 text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-widest">Systems</p>
          {filtered.map((cmd) => (
            <button
              key={cmd.href}
              onClick={() => {
                router.push(cmd.href);
                setOpen(false);
                setSearch("");
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/[0.04] transition-colors text-left group"
            >
              <cmd.icon className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--violet)] transition-colors" />
              <span className="group-hover:text-[var(--foreground)] transition-colors">{cmd.label}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
