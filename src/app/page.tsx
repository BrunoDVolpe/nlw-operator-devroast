"use client";

import Link from "next/link";
import * as React from "react";
import { HomeMetrics } from "@/components/home/home-metrics";
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
  TableRowCode,
  TableRowLang,
  TableRowRank,
  TableRowRoot,
  TableRowScore,
} from "@/components/ui/table-row";
import {
  ToggleHint,
  ToggleLabel,
  ToggleRoot,
  ToggleThumb,
} from "@/components/ui/toggle";
import {
  Description,
  Heading,
  Meta,
  SectionTitleLabel,
  SectionTitleRoot,
  SectionTitleSlash,
} from "@/components/ui/typography";

export default function Home() {
  const maxChars = 2000;
  const [code, setCode] = React.useState("");
  const hasCode = code.trim().length > 0;
  const isOverLimit = code.length > maxChars;

  return (
    <main className="bg-bg-page">
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-8 px-10 pb-16 pt-20">
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

        <HomeMetrics />

        <div className="h-14" />

        <section className="mx-auto flex w-full max-w-[960px] flex-col gap-6">
          <div className="flex w-full items-center justify-between">
            <SectionTitleRoot>
              <SectionTitleSlash>{"//"}</SectionTitleSlash>
              <SectionTitleLabel>shame_leaderboard</SectionTitleLabel>
            </SectionTitleRoot>
            <Button variant="link">$ view_all &gt;&gt;</Button>
          </div>
          <Description>
            {"// the worst code on the internet, ranked by shame"}
          </Description>

          <div className="w-full overflow-hidden border border-border-primary">
            <div className="flex h-10 items-center gap-6 border-b border-border-primary bg-bg-surface px-5 font-mono text-[12px] font-medium text-text-tertiary">
              <div className="w-[50px]">#</div>
              <div className="w-[70px]">score</div>
              <div className="flex-1">code</div>
              <div className="w-[100px]">lang</div>
            </div>
            <TableRowRoot size="sm">
              <TableRowRank>
                <span className="text-accent-amber">1</span>
              </TableRowRank>
              <TableRowScore>1.2</TableRowScore>
              <TableRowCode>
                <div className="flex min-w-0 flex-col gap-1 text-text-primary">
                  <span className="truncate">eval(prompt("enter code"))</span>
                  <span className="truncate">document.write(response)</span>
                  <span className="truncate text-text-tertiary">
                    {"// trust the user lol"}
                  </span>
                </div>
              </TableRowCode>
              <TableRowLang>
                <span className="text-text-secondary">javascript</span>
              </TableRowLang>
            </TableRowRoot>
            <TableRowRoot size="sm">
              <TableRowRank>2</TableRowRank>
              <TableRowScore>1.8</TableRowScore>
              <TableRowCode>
                <div className="flex min-w-0 flex-col gap-1 text-text-primary">
                  <span className="truncate">
                    {"if (x == true) { return true; }"}
                  </span>
                  <span className="truncate">
                    {"else if (x == false) { return false; }"}
                  </span>
                  <span className="truncate">{"else { return !false; }"}</span>
                </div>
              </TableRowCode>
              <TableRowLang>
                <span className="text-text-secondary">typescript</span>
              </TableRowLang>
            </TableRowRoot>
            <TableRowRoot size="sm">
              <TableRowRank>3</TableRowRank>
              <TableRowScore>2.1</TableRowScore>
              <TableRowCode>
                <div className="flex min-w-0 flex-col gap-1 text-text-primary">
                  <span className="truncate">
                    SELECT * FROM users WHERE 1=1
                  </span>
                  <span className="truncate text-text-tertiary">
                    -- TODO: add authentication
                  </span>
                </div>
              </TableRowCode>
              <TableRowLang>
                <span className="text-text-secondary">sql</span>
              </TableRowLang>
            </TableRowRoot>
          </div>

          <div className="flex justify-center py-4">
            <Meta className="text-text-tertiary">
              showing top 3 of 2,847 ·{" "}
              <Link
                href="/leaderboard"
                className="text-text-tertiary transition-colors hover:text-text-primary"
              >
                view full leaderboard &gt;&gt;
              </Link>
            </Meta>
          </div>
        </section>

        <div className="h-14" />
      </div>
    </main>
  );
}
