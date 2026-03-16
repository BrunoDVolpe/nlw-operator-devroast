"use client";

import * as React from "react";

import {
  CodeEditorArea,
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
        >
          <CodeEditorToolbar>
            <CodeEditorLanguageSelect />
          </CodeEditorToolbar>
          <CodeEditorArea />
        </CodeEditorRoot>
      </div>
    </section>
  );
};
