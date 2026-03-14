import * as React from "react";
import { tv } from "tailwind-variants";

import { cn } from "@/lib/cn";

const rowVariants = tv({
  base: "flex w-full items-start gap-6 border-b border-border-primary px-5 py-4 font-mono",
  variants: {
    size: {
      md: "text-[13px]",
      sm: "text-[12px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type TableRowRootProps = React.HTMLAttributes<HTMLDivElement> &
  Parameters<typeof rowVariants>[0];

export const TableRowRoot = ({
  size,
  className,
  ...props
}: TableRowRootProps) => (
  <div className={cn(rowVariants({ size, className }))} {...props} />
);

export type TableRowRankProps = React.HTMLAttributes<HTMLDivElement>;

export const TableRowRank = ({ className, ...props }: TableRowRankProps) => (
  <div className={cn("w-[50px] text-text-tertiary", className)} {...props} />
);

export type TableRowScoreProps = React.HTMLAttributes<HTMLDivElement>;

export const TableRowScore = ({ className, ...props }: TableRowScoreProps) => (
  <div className={cn("w-[70px] font-bold text-accent-red", className)} {...props} />
);

export type TableRowCodeProps = React.HTMLAttributes<HTMLDivElement>;

export const TableRowCode = ({ className, ...props }: TableRowCodeProps) => (
  <div className={cn("flex-1 min-w-0 text-text-secondary", className)} {...props} />
);

export type TableRowLangProps = React.HTMLAttributes<HTMLDivElement>;

export const TableRowLang = ({ className, ...props }: TableRowLangProps) => (
  <div className={cn("w-[100px] text-text-tertiary", className)} {...props} />
);
