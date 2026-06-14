"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Target,
  Clock,
  Heart,
  Users,
  DollarSign,
  LayoutDashboard,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommandMenu } from "@/stores/command-menu";

// Split the six destinations around a raised center quick-add button so the
// most-used action sits dead-center in the thumb zone.
const leftItems = [
  { href: "/", label: "Today", icon: LayoutDashboard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/time", label: "Time", icon: Clock },
];
const rightItems = [
  { href: "/health", label: "Health", icon: Heart },
  { href: "/relationships", label: "People", icon: Users },
  { href: "/finance", label: "Finance", icon: DollarSign },
];

function NavTab({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        // 56px min touch target, evenly distributed
        "flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
        active
          ? "text-[var(--violet)]"
          : "text-[var(--muted-foreground)] active:text-[var(--foreground)]"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const setOpen = useCommandMenu((s) => s.setOpen);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <nav
      aria-label="Primary"
      className="glass fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-[var(--border)] pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {leftItems.map((item) => (
        <NavTab key={item.href} {...item} active={isActive(item.href)} />
      ))}

      {/* Center quick-add — opens the command menu (search + quick actions),
          which is otherwise reachable only via ⌘K on desktop. */}
      <div className="flex w-16 shrink-0 items-center justify-center">
        <button
          type="button"
          aria-label="Quick add"
          onClick={() => setOpen(true)}
          className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--violet)] to-[#6C4CEC] text-white shadow-lg shadow-[var(--glow-violet)] transition-transform active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {rightItems.map((item) => (
        <NavTab key={item.href} {...item} active={isActive(item.href)} />
      ))}
    </nav>
  );
}
