import Link from "next/link";

export function RoastResultFailed() {
  return (
    <main className="bg-bg-page min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <h1 className="font-mono text-xl text-accent-red tracking-tight">
            $ roast_failed
          </h1>
          <p className="font-mono text-sm text-text-tertiary">
            even our AI gave up on roasting this code.
          </p>
        </div>
        <Link 
          href="/"
          className="border border-border-primary px-4 py-2 font-mono text-[12px] text-text-primary transition-colors hover:border-text-tertiary"
        >
          $ try_again
        </Link>
      </div>
    </main>
  );
}
