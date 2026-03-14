import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";

export type CodeBlockProps = {
  code: string;
  language: BundledLanguage;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
};

export const CodeBlock = async ({
  code,
  language,
  filename,
  showLineNumbers = true,
  className,
}: CodeBlockProps) => {
  const highlighted = await codeToHtml(code, {
    lang: language,
    theme: "vesper",
  });

  const lineCount = code.split("\n").length;
  const lines = Array.from({ length: lineCount }, (_, index) => index + 1);

  return (
    <div
      className={`code-block w-full overflow-hidden border border-border-primary bg-bg-input${
        className ? ` ${className}` : ""
      }`}
    >
      <div className="flex h-10 items-center gap-3 border-b border-border-primary px-4">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
        </div>
        <div className="flex-1" />
        {filename ? (
          <span className="font-mono text-[12px] text-text-tertiary">
            {filename}
          </span>
        ) : null}
      </div>
      <div className="flex">
        {showLineNumbers ? (
          <div className="flex w-10 flex-col items-end gap-1 border-r border-border-primary bg-bg-surface px-2 py-3 font-mono text-[13px] leading-5 text-text-tertiary">
            {lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        ) : null}
        <div className="flex-1 p-3">
          <div dangerouslySetInnerHTML={{ __html: highlighted }} />
        </div>
      </div>
    </div>
  );
};
