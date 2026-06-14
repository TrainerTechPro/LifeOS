"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Target,
  Clock,
  Heart,
  Users,
  DollarSign,
  LayoutDashboard,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { href: "/", label: "Today", icon: LayoutDashboard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/time", label: "Time", icon: Clock },
  { href: "/health", label: "Health", icon: Heart },
  { href: "/relationships", label: "People", icon: Users },
  { href: "/finance", label: "Finance", icon: DollarSign },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 glass border-r border-[var(--border)] md:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--violet)] to-[var(--cyan)]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-base font-semibold tracking-tight">LifeSystem</h2>
          <span className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-widest mt-0.5">OS</span>
        </div>

        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

        <ScrollArea className="flex-1 px-3 pt-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-white"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/[0.03]"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--violet)] to-[#6C4CEC] shadow-glow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

        <div className="p-3">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/[0.03] transition-all duration-200"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
