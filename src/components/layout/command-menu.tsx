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
        <div className="p-3 border-b border-[var(--border)]">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 focus-visible:ring-0 h-10"
            autoFocus
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-2">
          {filtered.map((cmd) => (
            <button
              key={cmd.href}
              onClick={() => {
                router.push(cmd.href);
                setOpen(false);
                setSearch("");
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-[var(--accent)] transition-colors text-left"
            >
              <cmd.icon className="h-4 w-4 text-[var(--muted-foreground)]" />
              {cmd.label}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
