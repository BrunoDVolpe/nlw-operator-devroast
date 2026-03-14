"use client";

import * as React from "react";

import { cn } from "@/lib/cn";

export type CodeInputProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  value: string;
  onValueChange?: (value: string) => void;
  minLines?: number;
};

export const CodeInput = ({
  value,
  onValueChange,
  minLines = 12,
  className,
  ...props
}: CodeInputProps) => {
  const lineNumbersRef = React.useRef<HTMLDivElement | null>(null);
  const lineCount = Math.max(
    minLines,
    value.split(/\r\n|\r|\n/).length,
    1,
  );
  const lines = Array.from({ length: lineCount }, (_, index) => index + 1);

  return (
    <div
      className={cn(
        "w-full overflow-hidden border border-border-primary bg-bg-input",
        className,
      )}
    >
      <div className="flex h-10 items-center gap-3 border-b border-border-primary px-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#EF4444]" />
          <span className="h-3 w-3 rounded-full bg-[#F59E0B]" />
          <span className="h-3 w-3 rounded-full bg-[#10B981]" />
        </div>
      </div>
      <div className="flex h-[320px]">
        <div
          ref={lineNumbersRef}
          className="flex w-12 shrink-0 flex-col items-end overflow-hidden border-r border-border-primary bg-bg-surface px-3 py-4 font-mono text-[12px] leading-6 text-text-tertiary"
        >
          {lines.map((line) => (
            <span key={line} className="h-6">
              {line}
            </span>
          ))}
        </div>
        <textarea
          value={value}
          onChange={(event) => onValueChange?.(event.target.value)}
          onScroll={(event) => {
            if (lineNumbersRef.current) {
              lineNumbersRef.current.scrollTop = event.currentTarget.scrollTop;
            }
          }}
          className={
            "h-full w-full resize-none bg-transparent p-4 font-mono text-[12px] leading-6 text-text-primary outline-none placeholder:text-text-tertiary"
          }
          spellCheck={false}
          {...props}
        />
      </div>
    </div>
  );
};
