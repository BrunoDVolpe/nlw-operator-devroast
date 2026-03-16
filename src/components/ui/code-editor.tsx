"use client";

import * as React from "react";
import { EditorState, type Extension } from "@codemirror/state";
import {
  EditorView,
  highlightActiveLine,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  placeholder,
} from "@codemirror/view";
import {
  HighlightStyle,
  bracketMatching,
  indentOnInput,
  indentUnit,
  syntaxHighlighting,
} from "@codemirror/language";
import { history, historyKeymap } from "@codemirror/commands";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { tags } from "@lezer/highlight";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { go } from "@codemirror/lang-go";
import { sql } from "@codemirror/lang-sql";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import hljs from "highlight.js/lib/core";
import javascriptLang from "highlight.js/lib/languages/javascript";
import typescriptLang from "highlight.js/lib/languages/typescript";
import pythonLang from "highlight.js/lib/languages/python";
import rustLang from "highlight.js/lib/languages/rust";
import goLang from "highlight.js/lib/languages/go";
import sqlLang from "highlight.js/lib/languages/sql";
import jsonLang from "highlight.js/lib/languages/json";
import markdownLang from "highlight.js/lib/languages/markdown";

import { cn } from "@/lib/cn";

hljs.registerLanguage("javascript", javascriptLang);
hljs.registerLanguage("typescript", typescriptLang);
hljs.registerLanguage("python", pythonLang);
hljs.registerLanguage("rust", rustLang);
hljs.registerLanguage("go", goLang);
hljs.registerLanguage("sql", sqlLang);
hljs.registerLanguage("json", jsonLang);
hljs.registerLanguage("markdown", markdownLang);

const SUPPORTED_LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "sql", label: "SQL" },
  { id: "json", label: "JSON" },
  { id: "markdown", label: "Markdown" },
];

const LANGUAGE_EXTENSION_MAP: Record<string, () => Extension> = {
  javascript: () => javascript({ jsx: true }),
  typescript: () => javascript({ typescript: true, jsx: true }),
  python: () => python(),
  rust: () => rust(),
  go: () => go(),
  sql: () => sql(),
  json: () => json(),
  markdown: () => markdown(),
};

const AUTO_DETECT_THRESHOLD = 5;
const AUTO_DETECT_MAX_LENGTH = 8000;

type LanguageMode = "auto" | "manual";

type CodeEditorContextValue = {
  value: string;
  setValue: (value: string) => void;
  language: string | null;
  setLanguage: (value: string | null) => void;
  languageMode: LanguageMode;
  setLanguageMode: (value: LanguageMode) => void;
  detectedLanguage: string | null;
  placeholderText?: string;
};

const CodeEditorContext = React.createContext<CodeEditorContextValue | null>(
  null,
);

const useCodeEditorContext = () => {
  const context = React.useContext(CodeEditorContext);
  if (!context) {
    throw new Error("CodeEditor components must be used within CodeEditorRoot.");
  }
  return context;
};

export type CodeEditorRootProps = {
  value: string;
  onValueChange: (value: string) => void;
  defaultLanguage?: string | null;
  defaultLanguageMode?: LanguageMode;
  placeholder?: string;
  className?: string;
  children: React.ReactNode;
};

export const CodeEditorRoot = ({
  value,
  onValueChange,
  defaultLanguage = null,
  defaultLanguageMode = "auto",
  placeholder: placeholderText,
  className,
  children,
}: CodeEditorRootProps) => {
  const [language, setLanguage] = React.useState<string | null>(defaultLanguage);
  const [languageMode, setLanguageMode] =
    React.useState<LanguageMode>(defaultLanguageMode);
  const [detectedLanguage, setDetectedLanguage] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    if (languageMode !== "auto") {
      return;
    }

    if (!value.trim()) {
      setDetectedLanguage(null);
      return;
    }

    const timeout = setTimeout(() => {
      const sample = value.slice(0, AUTO_DETECT_MAX_LENGTH);
      const result = hljs.highlightAuto(sample, SUPPORTED_LANGUAGES.map((l) => l.id));

      if (
        result.relevance >= AUTO_DETECT_THRESHOLD &&
        result.language &&
        LANGUAGE_EXTENSION_MAP[result.language]
      ) {
        setDetectedLanguage(result.language);
        setLanguage(result.language);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [value, languageMode]);

  const contextValue = React.useMemo<CodeEditorContextValue>(
    () => ({
      value,
      setValue: onValueChange,
      language,
      setLanguage,
      languageMode,
      setLanguageMode,
      detectedLanguage,
      placeholderText,
    }),
    [
      value,
      onValueChange,
      language,
      languageMode,
      detectedLanguage,
      placeholderText,
    ],
  );

  return (
    <CodeEditorContext.Provider value={contextValue}>
      <div className={cn("flex w-full flex-col gap-3", className)}>{children}</div>
    </CodeEditorContext.Provider>
  );
};

export type CodeEditorToolbarProps = React.HTMLAttributes<HTMLDivElement>;

export const CodeEditorToolbar = ({
  className,
  ...props
}: CodeEditorToolbarProps) => (
  <div className={cn("flex items-center justify-between", className)} {...props} />
);

export type CodeEditorLanguageSelectProps = {
  className?: string;
};

export const CodeEditorLanguageSelect = ({
  className,
}: CodeEditorLanguageSelectProps) => {
  const {
    language,
    setLanguage,
    languageMode,
    setLanguageMode,
    detectedLanguage,
  } = useCodeEditorContext();

  const value = languageMode === "auto" ? "auto" : language ?? "javascript";
  const autoLabel = detectedLanguage
    ? `Auto (${detectedLanguage})`
    : "Auto";

  return (
    <label className={cn("flex items-center gap-2", className)}>
      <span className="text-[12px] text-text-tertiary">Language</span>
      <select
        value={value}
        onChange={(event) => {
          const selected = event.target.value;
          if (selected === "auto") {
            setLanguageMode("auto");
            return;
          }
          setLanguageMode("manual");
          setLanguage(selected);
        }}
        className="h-8 rounded-md border border-border-primary bg-bg-input px-2 text-[12px] text-text-primary"
      >
        <option value="auto">{autoLabel}</option>
        {SUPPORTED_LANGUAGES.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export type CodeEditorAreaProps = {
  className?: string;
  height?: number;
};

export const CodeEditorArea = ({
  className,
  height = 360,
}: CodeEditorAreaProps) => {
  const { value, setValue, language, placeholderText } = useCodeEditorContext();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const viewRef = React.useRef<EditorView | null>(null);
  const lineHeight = 24;
  const verticalPadding = 32;
  const headerHeight = 40;
  const gutterWidth = 52;
  const contentPaddingX = 12;
  const fontSize = 12;
  const minLines = Math.max(1, Math.floor((height - verticalPadding) / lineHeight));

  const getPaddedValue = React.useCallback(
    (rawValue: string) => {
      const lines = rawValue.split(/\r\n|\r|\n/);
      const padding = Math.max(minLines - lines.length, 0);
      if (padding === 0) {
        return rawValue;
      }
      return `${rawValue}${"\n".repeat(padding)}`;
    },
    [minLines],
  );

  const stripPadding = React.useCallback((rawValue: string) => {
    return rawValue.replace(/\n+$/, "");
  }, []);

  React.useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const languageExtension = language
      ? LANGUAGE_EXTENSION_MAP[language]?.()
      : null;

    const theme = EditorView.theme({
      "&": {
        height: `${height}px`,
        backgroundColor: "transparent",
        color: "var(--color-text-primary)",
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
      },
      ".cm-scroller": {
        overflow: "auto",
        paddingTop: "16px",
        paddingBottom: "16px",
      },
      ".cm-gutters": {
        backgroundColor: "var(--color-bg-surface)",
        color: "var(--color-text-tertiary)",
        borderRight: "1px solid var(--color-border-primary)",
        minWidth: `${gutterWidth}px`,
      },
      ".cm-lineNumbers .cm-gutterElement": {
        padding: `0 ${contentPaddingX}px`,
        lineHeight: `${lineHeight}px`,
        height: `${lineHeight}px`,
      },
      ".cm-line": {
        padding: `0 ${contentPaddingX}px`,
        lineHeight: `${lineHeight}px`,
      },
      ".cm-placeholder": {
        color: "var(--color-text-tertiary)",
      },
      ".cm-cursor": {
        borderLeftColor: "var(--color-accent-green)",
      },
      ".cm-activeLine": {
        backgroundColor: "transparent",
      },
      ".cm-selectionBackground": {
        backgroundColor: "#1f2937",
      },
      "&.cm-focused .cm-selectionBackground": {
        backgroundColor: "#1f2937",
      },
    });

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        setValue(stripPadding(update.state.doc.toString()));
      }
    });

    const highlightStyle = HighlightStyle.define([
      { tag: tags.keyword, color: "var(--color-syn-keyword)" },
      { tag: tags.function(tags.variableName), color: "var(--color-syn-function)" },
      { tag: tags.number, color: "var(--color-syn-number)" },
      { tag: tags.operator, color: "var(--color-syn-operator)" },
      { tag: tags.propertyName, color: "var(--color-syn-property)" },
      { tag: tags.string, color: "var(--color-syn-string)" },
      { tag: tags.typeName, color: "var(--color-syn-type)" },
      { tag: tags.variableName, color: "var(--color-syn-variable)" },
      { tag: tags.comment, color: "#8B8B8B" },
    ]);

    const extensions: Extension[] = [
      lineNumbers(),
      highlightSpecialChars(),
      history(),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      keymap.of([...historyKeymap, ...closeBracketsKeymap]),
      syntaxHighlighting(highlightStyle),
      highlightActiveLine(),
      indentUnit.of("  "),
      theme,
      updateListener,
    ];

    if (placeholderText) {
      extensions.push(placeholder(placeholderText));
    }

    if (languageExtension) {
      extensions.push(languageExtension);
    }

    const state = EditorState.create({
      doc: getPaddedValue(value),
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [language, placeholderText, height, getPaddedValue, lineHeight, minLines, stripPadding]);

  React.useEffect(() => {
    const view = viewRef.current;
    if (!view) {
      return;
    }

    const current = view.state.doc.toString();
    const nextValue = getPaddedValue(value);
    if (current === nextValue) {
      return;
    }

    view.dispatch({
      changes: { from: 0, to: current.length, insert: nextValue },
    });
  }, [value, getPaddedValue]);

  const showPlaceholder = !value.trim() && placeholderText;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden border border-border-primary bg-bg-input",
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
      <div ref={containerRef} />
      {showPlaceholder ? (
        <div
          className="pointer-events-none absolute font-mono text-[12px] leading-6 text-text-tertiary"
          style={{
            left: gutterWidth + contentPaddingX,
            top:
              headerHeight +
              verticalPadding / 2 +
              (lineHeight - fontSize) / 2,
          }}
        >
          {placeholderText}
        </div>
      ) : null}
    </div>
  );
};

export type CodeEditorFooterProps = React.HTMLAttributes<HTMLDivElement>;

export const CodeEditorFooter = ({
  className,
  ...props
}: CodeEditorFooterProps) => (
  <div className={cn("flex items-center justify-between", className)} {...props} />
);
