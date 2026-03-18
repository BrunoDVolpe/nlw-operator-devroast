"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  CodeEditorArea,
  CodeEditorCounter,
  CodeEditorFooter,
  CodeEditorLanguageSelect,
  CodeEditorRoot,
  CodeEditorToolbar,
} from "@/components/ui/code-editor";
import {
  ToggleHint,
  ToggleLabel,
  ToggleRoot,
  ToggleThumb,
} from "@/components/ui/toggle";
import { Description, Heading } from "@/components/ui/typography";

export function HomeEditorSection() {
  const maxChars = 2000;
  const [code, setCode] = React.useState("");
  const hasCode = code.trim().length > 0;
  const isOverLimit = code.length > maxChars;

  return (
    <>
      <section className="flex flex-col gap-4">
        <div className="mx-auto flex w-full max-w-[780px] items-center gap-3 font-mono text-[36px] font-bold text-text-primary">
          <span className="text-accent-green">$</span>
          <Heading as="h1" size="lg" className="text-text-primary">
            paste your code. get roasted.
          </Heading>
        </div>
        <Description className="mx-auto w-full max-w-[780px]">
          {
            "// drop your code below and we'll rate it — brutally honest or full roast mode"
          }
        </Description>
      </section>

      <section className="flex w-full flex-col gap-6">
        <CodeEditorRoot
          value={code}
          onValueChange={setCode}
          placeholder="// paste your code here..."
          maxChars={maxChars}
          className="mx-auto w-full max-w-[780px]"
        >
          <CodeEditorToolbar>
            <CodeEditorLanguageSelect />
          </CodeEditorToolbar>
          <CodeEditorArea />
          <CodeEditorFooter className="justify-end">
            <CodeEditorCounter />
          </CodeEditorFooter>
        </CodeEditorRoot>

        <div className="mx-auto flex w-full max-w-[780px] items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <ToggleRoot defaultChecked>
                <ToggleThumb />
              </ToggleRoot>
              <ToggleLabel>roast mode</ToggleLabel>
            </div>
            <ToggleHint>{"// maximum sarcasm enabled"}</ToggleHint>
          </div>
          <Button variant="primary" disabled={!hasCode || isOverLimit}>
            $ roast_my_code
          </Button>
        </div>
      </section>
    </>
  );
}
