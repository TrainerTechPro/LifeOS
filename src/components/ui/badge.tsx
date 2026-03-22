import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--violet)]/15 text-[var(--violet)] border-[var(--violet)]/20",
        secondary: "bg-white/[0.05] text-[var(--secondary-foreground)] border-white/[0.06]",
        destructive: "bg-[var(--rose)]/10 text-[var(--rose)] border-[var(--rose)]/20",
        outline: "text-[var(--foreground)] border-[var(--border)]",
        success: "bg-[var(--cyan)]/10 text-[var(--cyan)] border-[var(--cyan)]/20",
        warning: "bg-[var(--amber)]/10 text-[var(--amber)] border-[var(--amber)]/20",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
