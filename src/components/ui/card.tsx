import * as React from "react";

import { cn } from "@/lib/cn";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...props }: CardProps) => (
  <div
    className={cn(
      "flex w-full flex-col gap-3 border border-border-primary p-5",
      className,
    )}
    {...props}
  />
);

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export const CardHeader = ({ className, ...props }: CardHeaderProps) => (
  <div className={cn("flex items-center gap-2", className)} {...props} />
);

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export const CardTitle = ({ className, ...props }: CardTitleProps) => (
  <h3
    className={cn(
      "font-mono text-[13px] font-normal text-text-primary",
      className,
    )}
    {...props}
  />
);

export type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export const CardDescription = ({
  className,
  ...props
}: CardDescriptionProps) => (
  <p
    className={cn(
      "font-sans text-[12px] font-normal leading-[1.5] text-text-secondary",
      className,
    )}
    {...props}
  />
);
