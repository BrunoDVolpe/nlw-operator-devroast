import { Button } from "@/components/ui/button";
import {
  CodeInline,
  Description,
  Heading,
  Meta,
  SectionTitleLabel,
  SectionTitleRoot,
  SectionTitleSlash,
} from "@/components/ui/typography";
import { ToggleLabel, ToggleRoot, ToggleThumb } from "@/components/ui/toggle";
import {
  StatusBadgeDot,
  StatusBadgeLabel,
  StatusBadgeRoot,
} from "@/components/ui/status-badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { DiffLine } from "@/components/ui/diff-line";
import {
  TableRowCode,
  TableRowLang,
  TableRowRank,
  TableRowRoot,
  TableRowScore,
} from "@/components/ui/table-row";

const buttonVariants = ["primary", "secondary", "link"] as const;
const buttonSizes = ["sm", "default", "lg"] as const;

export default function ComponentsPage() {
  return (
    <main className="dark min-h-screen bg-bg-page px-10 py-12 text-text-primary">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">UI components</h1>
          <p className="text-sm text-text-tertiary">
            Visual preview of shared UI components and variants.
          </p>
        </header>

        <section className="flex flex-col gap-6">
          <SectionTitleRoot>
            <SectionTitleSlash>//</SectionTitleSlash>
            <SectionTitleLabel>typography</SectionTitleLabel>
          </SectionTitleRoot>
          <div className="flex flex-col gap-5">
            <Heading as="h2" size="lg">
              paste your code. get roasted.
            </Heading>
            <SectionTitleRoot className="text-[14px]">
              <SectionTitleSlash>//</SectionTitleSlash>
              <SectionTitleLabel>detailed_analysis</SectionTitleLabel>
            </SectionTitleRoot>
            <Description>description text sample</Description>
            <Meta>lang: javascript · 7 lines</Meta>
            <CodeInline>function calculateTotal()</CodeInline>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <SectionTitleRoot>
            <SectionTitleSlash>//</SectionTitleSlash>
            <SectionTitleLabel>buttons</SectionTitleLabel>
          </SectionTitleRoot>

          <div className="grid gap-6 rounded-lg border border-border-primary bg-bg-surface p-6 text-text-primary">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold">Variants</p>
              <div className="flex flex-wrap gap-3">
                {buttonVariants.map((variant) => (
                  <Button key={variant} variant={variant}>
                    {variant}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold">Sizes</p>
              <div className="flex flex-wrap items-center gap-3">
                {buttonSizes.map((size) => (
                  <Button key={size} size={size}>
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <SectionTitleRoot>
            <SectionTitleSlash>//</SectionTitleSlash>
            <SectionTitleLabel>toggle</SectionTitleLabel>
          </SectionTitleRoot>
          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <ToggleRoot defaultChecked>
                <ToggleThumb />
              </ToggleRoot>
              <ToggleLabel>roast mode</ToggleLabel>
            </div>
            <div className="flex items-center gap-3">
              <ToggleRoot>
                <ToggleThumb />
              </ToggleRoot>
              <ToggleLabel>roast mode</ToggleLabel>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <SectionTitleRoot>
            <SectionTitleSlash>//</SectionTitleSlash>
            <SectionTitleLabel>badge_status</SectionTitleLabel>
          </SectionTitleRoot>
          <div className="flex flex-wrap gap-6">
            <StatusBadgeRoot variant="critical">
              <StatusBadgeDot />
              <StatusBadgeLabel>critical</StatusBadgeLabel>
            </StatusBadgeRoot>
            <StatusBadgeRoot variant="warning">
              <StatusBadgeDot />
              <StatusBadgeLabel>warning</StatusBadgeLabel>
            </StatusBadgeRoot>
            <StatusBadgeRoot variant="good">
              <StatusBadgeDot />
              <StatusBadgeLabel>good</StatusBadgeLabel>
            </StatusBadgeRoot>
            <StatusBadgeRoot variant="verdict">
              <StatusBadgeDot />
              <StatusBadgeLabel>needs_serious_help</StatusBadgeLabel>
            </StatusBadgeRoot>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <SectionTitleRoot>
            <SectionTitleSlash>//</SectionTitleSlash>
            <SectionTitleLabel>cards</SectionTitleLabel>
          </SectionTitleRoot>
          <Card className="max-w-[480px]">
            <CardHeader>
              <StatusBadgeRoot variant="critical">
                <StatusBadgeDot />
                <StatusBadgeLabel>critical</StatusBadgeLabel>
              </StatusBadgeRoot>
            </CardHeader>
            <CardTitle>using var instead of const/let</CardTitle>
            <CardDescription>
              the var keyword is function-scoped rather than block-scoped, which
              can lead to unexpected behavior and bugs. modern javascript uses
              const for immutable bindings and let for mutable ones.
            </CardDescription>
          </Card>
        </section>

        <section className="flex flex-col gap-6">
          <SectionTitleRoot>
            <SectionTitleSlash>//</SectionTitleSlash>
            <SectionTitleLabel>code_block</SectionTitleLabel>
          </SectionTitleRoot>
          <div className="max-w-[560px]">
            <CodeBlock
              language="javascript"
              filename="calculate.js"
              code={[
                "function calculateTotal(items) {",
                "  var total = 0;",
                "  for (var i = 0; i < items.length; i++) {",
                "    total = total + items[i].price;",
                "  }",
                "}",
              ].join("\n")}
            />
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <SectionTitleRoot>
            <SectionTitleSlash>//</SectionTitleSlash>
            <SectionTitleLabel>diff_line</SectionTitleLabel>
          </SectionTitleRoot>
          <div className="flex w-full max-w-[560px] flex-col">
            <DiffLine variant="removed" code="var total = 0;" />
            <DiffLine variant="added" code="const total = 0;" />
            <DiffLine variant="context" code="for (let i = 0; i < items.length; i++) {" />
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <SectionTitleRoot>
            <SectionTitleSlash>//</SectionTitleSlash>
            <SectionTitleLabel>table_row</SectionTitleLabel>
          </SectionTitleRoot>
          <div className="w-full">
            <TableRowRoot>
              <TableRowRank>#1</TableRowRank>
              <TableRowScore>2.1</TableRowScore>
              <TableRowCode>
                function calculateTotal(items) {" var total = 0; ..."}
              </TableRowCode>
              <TableRowLang>javascript</TableRowLang>
            </TableRowRoot>
          </div>
        </section>
      </div>
    </main>
  );
}
