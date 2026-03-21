import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-[var(--border)] px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent",
        secondary: "bg-[var(--secondary)] text-[var(--secondary-foreground)] border-transparent",
        destructive: "bg-red-500/15 text-red-400 border-transparent",
        outline: "text-[var(--foreground)]",
        success: "bg-green-500/15 text-green-400 border-transparent",
        warning: "bg-yellow-500/15 text-yellow-400 border-transparent",
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
