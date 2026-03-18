import { Meta } from "@/components/ui/typography";

export function ShameLeaderboardSkeleton() {
  return (
    <>
      <div className="w-full overflow-hidden border border-border-primary">
        <div className="flex h-10 items-center gap-6 border-b border-border-primary bg-bg-surface px-5 font-mono text-[12px] font-medium text-text-tertiary">
          <div className="w-[50px]">#</div>
          <div className="w-[70px]">score</div>
          <div className="flex-1">code</div>
          <div className="w-[100px]">lang</div>
        </div>

        {["a", "b", "c"].map((key) => (
          <div
            key={`leaderboard-skeleton-${key}`}
            className="flex w-full items-start gap-6 border-b border-border-primary px-5 py-4"
          >
            <div className="h-4 w-[24px] animate-pulse bg-border-primary" />
            <div className="h-4 w-[36px] animate-pulse bg-border-primary" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-full animate-pulse bg-border-primary" />
              <div className="h-4 w-[75%] animate-pulse bg-border-primary" />
            </div>
            <div className="h-4 w-[60px] animate-pulse bg-border-primary" />
          </div>
        ))}
      </div>

      <div className="flex justify-center py-4">
        <Meta className="animate-pulse">carregando leaderboard...</Meta>
      </div>
    </>
  );
}
