"use client";

import * as React from "react";

import {
  CodeEditorArea,
  CodeEditorCounter,
  CodeEditorFooter,
  CodeEditorLanguageSelect,
  CodeEditorRoot,
  CodeEditorToolbar,
} from "@/components/ui/code-editor";
import {
  SectionTitleLabel,
  SectionTitleRoot,
  SectionTitleSlash,
} from "@/components/ui/typography";

export const CodeEditorPreview = () => {
  const [code, setCode] = React.useState("// paste your code here...");

  return (
    <section className="flex flex-col gap-6">
      <SectionTitleRoot>
        <SectionTitleSlash>//</SectionTitleSlash>
        <SectionTitleLabel>code_editor</SectionTitleLabel>
      </SectionTitleRoot>
      <div className="max-w-[780px]">
        <CodeEditorRoot
          value={code}
          onValueChange={setCode}
          placeholder="// paste your code here..."
          maxChars={2000}
        >
          <CodeEditorToolbar>
            <CodeEditorLanguageSelect />
          </CodeEditorToolbar>
          <CodeEditorArea />
          <CodeEditorFooter className="justify-end">
            <CodeEditorCounter />
          </CodeEditorFooter>
        </CodeEditorRoot>
      </div>
    </section>
  );
};
