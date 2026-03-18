import { HomeEditorSection } from "@/components/home/home-editor-section";
import { HomeMetrics } from "@/components/home/home-metrics";
import { ShameLeaderboardSection } from "@/components/home/shame-leaderboard-section";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="bg-bg-page">
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-8 px-10 pb-16 pt-20">
        <HomeEditorSection />

        <HomeMetrics />

        <div className="h-14" />

        <ShameLeaderboardSection />

        <div className="h-14" />
      </div>
    </main>
  );
}
