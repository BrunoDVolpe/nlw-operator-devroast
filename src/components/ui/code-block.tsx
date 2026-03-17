import type * as React from "react";
import type { BundledLanguage } from "shiki";
import { codeToTokens } from "shiki";

import { cn } from "@/lib/cn";

export type CodeBlockRootProps = React.HTMLAttributes<HTMLDivElement>;

export const CodeBlockRoot = ({ className, ...props }: CodeBlockRootProps) => (
  <div
    className={cn(
      "code-block w-full overflow-hidden border border-border-primary bg-bg-input",
      className,
    )}
    {...props}
  />
);

export type CodeBlockHeaderRootProps = React.HTMLAttributes<HTMLDivElement>;

export const CodeBlockHeaderRoot = ({
  className,
  ...props
}: CodeBlockHeaderRootProps) => (
  <div
    className={cn(
      "flex h-10 items-center gap-3 border-b border-border-primary px-4",
      className,
    )}
    {...props}
  />
);

export type CodeBlockHeaderDotsProps = React.HTMLAttributes<HTMLDivElement>;

export const CodeBlockHeaderDots = ({
  className,
  ...props
}: CodeBlockHeaderDotsProps) => (
  <div className={cn("flex items-center gap-3", className)} {...props}>
    <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
    <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
    <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
  </div>
);

export type CodeBlockHeaderTitleProps = React.HTMLAttributes<HTMLSpanElement>;

export const CodeBlockHeaderTitle = ({
  className,
  ...props
}: CodeBlockHeaderTitleProps) => (
  <span
    className={cn("font-mono text-[12px] text-text-tertiary", className)}
    {...props}
  />
);

export type CodeBlockProps = {
  code: string;
  language: BundledLanguage;
  showLineNumbers?: boolean;
  className?: string;
};

export const CodeBlock = async ({
  code,
  language,
  showLineNumbers = true,
  className,
}: CodeBlockProps) => {
  const { tokens } = (await codeToTokens(code, {
    lang: language,
    theme: "vesper",
  })) as {
    tokens: { content: string; color?: string }[][];
  };

  const lineCount = code.split("\n").length;
  const lines = Array.from({ length: lineCount }, (_, index) => index + 1);

  return (
    <div className={cn("flex", className)}>
      {showLineNumbers ? (
        <div className="flex w-10 flex-col items-end gap-1 border-r border-border-primary bg-bg-surface px-2.5 py-3 font-mono text-[12px] leading-5 text-text-tertiary">
          {lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      ) : null}
      <div className="flex-1 p-3">
        <pre className="overflow-x-auto font-mono text-[12px] leading-5">
          <code>
            {tokens.map((lineTokens, lineIndex) => {
              const lineNumber = lines[lineIndex];
              let cursor = 0;

              return (
                <div key={`line-${lineNumber}`}>
                  {lineTokens.map((token) => {
                    const key = `token-${lineNumber}-${cursor}-${token.content}`;
                    const style = token.color
                      ? { color: token.color }
                      : undefined;
                    cursor += token.content.length;

                    return (
                      <span key={key} style={style}>
                        {token.content}
                      </span>
                    );
                  })}
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
};
