import * as React from "react";
import { tv } from "tailwind-variants";

const diffLineVariants = tv({
  base: "flex items-center gap-2 px-4 py-2 font-mono text-[13px]",
  variants: {
    variant: {
      removed: "bg-diff-removed",
      added: "bg-diff-added",
      context: "bg-transparent",
    },
  },
  defaultVariants: {
    variant: "context",
  },
});

export type DiffLineProps = React.HTMLAttributes<HTMLDivElement> &
  Parameters<typeof diffLineVariants>[0] & {
    code: string;
  };

const prefixMap: Record<
  NonNullable<Parameters<typeof diffLineVariants>[0]>["variant"],
  string
> = {
  removed: "-",
  added: "+",
  context: " ",
};

export const DiffLine = ({
  variant,
  code,
  className,
  ...props
}: DiffLineProps) => {
  const prefix = prefixMap[variant ?? "context"];
  const prefixColor =
    variant === "added"
      ? "text-accent-green"
      : variant === "removed"
        ? "text-accent-red"
        : "text-text-tertiary";
  const codeColor =
    variant === "added"
      ? "text-text-primary"
      : variant === "removed"
        ? "text-text-secondary"
        : "text-text-secondary";

  return (
    <div
      className={diffLineVariants({ variant, className })}
      {...props}
    >
      <span className={prefixColor}>{prefix}</span>
      <span className={codeColor}>{code}</span>
    </div>
  );
};
