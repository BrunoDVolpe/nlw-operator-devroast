"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  CodeEditorArea,
  CodeEditorCounter,
  CodeEditorFooter,
  CodeEditorLanguageSelect,
  CodeEditorRoot,
  CodeEditorToolbar,
  useCodeEditorContext,
} from "@/components/ui/code-editor";
import {
  ToggleHint,
  ToggleLabel,
  ToggleRoot,
  ToggleThumb,
} from "@/components/ui/toggle";
import { Description, Heading } from "@/components/ui/typography";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

function EditorActions() {
  const router = useRouter();
  const { value, language, detectedLanguage, isOverLimit } = useCodeEditorContext();
  const [roastMode, setRoastMode] = React.useState(true);

  const hasCode = value.trim().length > 0;
  
  const trpc = useTRPC();
  const mutation = useMutation(
    trpc.submission.create.mutationOptions({
      onSuccess: (data) => {
        router.push("/roast/" + data.id);
      },
    })
  );

  const handleRoast = () => {
    if (!hasCode || isOverLimit) return;
    
    // Resolve final language: use selected manual language or auto-detected language
    // Default to 'javascript' if auto fails or nothing is matched
    const finalLanguage = language || detectedLanguage || "javascript";
    
    mutation.mutate({
      code: value,
      // We cast as any because we know we fall back to a valid string, but TypeScript
      // doesn't know it satisfies the enum literal types automatically without importing the enum
      // or we can just cast it. Let's cast to the expected type.
      language: finalLanguage as any,
      roastMode,
    });
  };

  return (
    <div className="mx-auto mt-3 flex w-full max-w-[780px] items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <ToggleRoot checked={roastMode} onCheckedChange={setRoastMode}>
            <ToggleThumb />
          </ToggleRoot>
          <ToggleLabel>roast mode</ToggleLabel>
        </div>
        <ToggleHint>{"// maximum sarcasm enabled"}</ToggleHint>
      </div>
      <Button 
        variant="primary" 
        disabled={!hasCode || isOverLimit || mutation.isPending}
        onClick={handleRoast}
      >
        {mutation.isPending ? "roasting..." : "$ roast_my_code"}
      </Button>
    </div>
  );
}

export function HomeEditorSection() {
  const maxChars = 2000;
  const [code, setCode] = React.useState("");

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
          <EditorActions />
        </CodeEditorRoot>
      </section>
    </>
  );
}
