import * as React from "react";
import { tv } from "tailwind-variants";

import { cn } from "@/lib/cn";

const badgeVariants = tv({
  base: "inline-flex items-center gap-2 font-mono",
  variants: {
    variant: {
      critical: "text-[12px] text-accent-red",
      warning: "text-[12px] text-accent-amber",
      good: "text-[12px] text-accent-green",
      verdict: "text-[13px] text-accent-red",
    },
  },
  defaultVariants: {
    variant: "critical",
  },
});

export type StatusBadgeRootProps = React.HTMLAttributes<HTMLDivElement> &
  Parameters<typeof badgeVariants>[0];

export const StatusBadgeRoot = ({
  variant,
  className,
  ...props
}: StatusBadgeRootProps) => (
  <div className={badgeVariants({ variant, className })} {...props} />
);

export type StatusBadgeDotProps = React.HTMLAttributes<HTMLSpanElement>;

export const StatusBadgeDot = ({ className, ...props }: StatusBadgeDotProps) => (
  <span className={cn("h-2 w-2 rounded-full bg-current", className)} {...props} />
);

export type StatusBadgeLabelProps = React.HTMLAttributes<HTMLSpanElement>;

export const StatusBadgeLabel = ({
  className,
  ...props
}: StatusBadgeLabelProps) => <span className={className} {...props} />;
