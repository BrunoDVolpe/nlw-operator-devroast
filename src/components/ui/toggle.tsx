"use client";

import * as React from "react";
import { Switch } from "@base-ui/react/switch";

import { cn } from "@/lib/cn";

export type ToggleRootProps = React.ComponentPropsWithoutRef<typeof Switch.Root>;

export const ToggleRoot = React.forwardRef<HTMLSpanElement, ToggleRootProps>(
  ({ className, ...props }, ref) => (
    <Switch.Root
      ref={ref}
      className={(state) =>
        cn(
          "peer inline-flex h-[22px] w-10 items-center rounded-[11px] p-[3px] transition-colors",
          state.checked
            ? "bg-accent-green justify-end"
            : "bg-border-primary justify-start",
          className,
        )
      }
      {...props}
    />
  ),
);

ToggleRoot.displayName = "ToggleRoot";

export type ToggleThumbProps = React.ComponentPropsWithoutRef<typeof Switch.Thumb>;

export const ToggleThumb = ({ className, ...props }: ToggleThumbProps) => (
  <Switch.Thumb
    className={cn(
      "h-4 w-4 rounded-full bg-text-secondary transition-colors data-[checked]:bg-ink",
      className,
    )}
    {...props}
  />
);

export type ToggleLabelProps = React.HTMLAttributes<HTMLSpanElement>;

export const ToggleLabel = ({ className, ...props }: ToggleLabelProps) => (
  <span
    className={cn(
      "font-mono text-[12px] text-text-secondary peer-data-[checked]:text-accent-green",
      className,
    )}
    {...props}
  />
);

export type ToggleHintProps = React.HTMLAttributes<HTMLSpanElement>;

export const ToggleHint = ({ className, ...props }: ToggleHintProps) => (
  <span className={cn("text-[12px] text-text-tertiary", className)} {...props} />
);
