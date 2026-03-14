import * as React from "react";
import { tv } from "tailwind-variants";

import { cn } from "@/lib/cn";

const headingVariants = tv({
  base: "font-mono text-text-primary",
  variants: {
    size: {
      lg: "text-[36px] font-bold",
      md: "text-[20px] font-bold",
      sm: "text-[14px] font-bold",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
  Parameters<typeof headingVariants>[0] & {
    as?: "h1" | "h2" | "h3" | "h4";
  };

export const Heading = ({ as = "h2", size, className, ...props }: HeadingProps) => {
  const Component = as;
  return (
    <Component
      className={headingVariants({ size, className })}
      {...props}
    />
  );
};

const sectionTitleVariants = tv({
  base: "inline-flex items-center gap-2 font-mono text-[14px] font-bold",
  variants: {
    tone: {
      default: "text-text-primary",
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

export type SectionTitleRootProps = React.HTMLAttributes<HTMLDivElement> &
  Parameters<typeof sectionTitleVariants>[0];

export const SectionTitleRoot = ({
  className,
  ...props
}: SectionTitleRootProps) => (
  <div className={sectionTitleVariants({ className })} {...props} />
);

export type SectionTitleSlashProps = React.HTMLAttributes<HTMLSpanElement>;

export const SectionTitleSlash = ({
  className,
  ...props
}: SectionTitleSlashProps) => (
  <span className={cn("text-accent-green", className)} {...props} />
);

export type SectionTitleLabelProps = React.HTMLAttributes<HTMLSpanElement>;

export const SectionTitleLabel = ({
  className,
  ...props
}: SectionTitleLabelProps) => <span className={className} {...props} />;

export type DescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export const Description = ({ className, ...props }: DescriptionProps) => (
  <p
    className={cn("text-[14px] text-text-secondary font-sans", className)}
    {...props}
  />
);

export type MetaProps = React.HTMLAttributes<HTMLParagraphElement>;

export const Meta = ({ className, ...props }: MetaProps) => (
  <p
    className={cn("font-mono text-[12px] text-text-tertiary", className)}
    {...props}
  />
);

export type CodeInlineProps = React.HTMLAttributes<HTMLSpanElement>;

export const CodeInline = ({ className, ...props }: CodeInlineProps) => (
  <span
    className={cn("font-mono text-[13px] text-syn-number", className)}
    {...props}
  />
);
