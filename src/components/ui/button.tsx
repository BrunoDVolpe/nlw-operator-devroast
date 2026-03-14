import * as React from "react";
import { tv } from "tailwind-variants";

const buttonVariants = tv({
  base: [
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-2",
    "font-mono",
    "transition-colors",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-border-focus",
    "disabled:pointer-events-none",
    "disabled:opacity-50",
  ],
  variants: {
    variant: {
      primary:
        "bg-accent-green px-6 py-2.5 text-[13px] font-medium text-ink enabled:hover:brightness-95",
      secondary:
        "border border-border-primary bg-transparent px-4 py-2 text-[12px] font-normal text-text-primary enabled:hover:border-border-focus",
      link:
        "border border-border-primary bg-transparent px-3 py-1.5 text-[12px] font-normal text-text-secondary enabled:hover:border-border-focus enabled:hover:text-text-primary",
    },
    size: {
      default: "",
      sm: "text-[12px]",
      lg: "text-[14px]",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
  },
});

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  Parameters<typeof buttonVariants>[0];

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  ),
);

Button.displayName = "Button";
