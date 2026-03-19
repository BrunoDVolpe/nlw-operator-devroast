import { RoastPollingClient } from "./roast-polling-client";

export function RoastResultPending({ id }: { id: string }) {
  return (
    <main className="bg-bg-page min-h-screen flex items-center justify-center">
      <RoastPollingClient id={id} />
      <div className="flex flex-col items-center gap-6">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-border-primary border-t-accent-green" />
        <div className="flex flex-col items-center gap-2">
          <h1 className="font-mono text-xl text-text-primary tracking-tight">
            $ roasting_your_code...
          </h1>
          <p className="font-mono text-sm text-text-tertiary">
            our AI is currently making fun of your bad practices.
          </p>
        </div>
      </div>
    </main>
  );
}
