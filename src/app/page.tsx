import { HomeEditorSection } from "@/components/home/home-editor-section";
import { HomeMetricsData } from "@/components/home/home-metrics-data";
import { ShameLeaderboardSection } from "@/components/home/shame-leaderboard-section";

export default async function Home() {
  return (
    <main className="bg-bg-page">
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-8 px-10 pb-16 pt-20">
        <HomeEditorSection />

        <HomeMetricsData />

        <div className="h-14" />

        <ShameLeaderboardSection />

        <div className="h-14" />
      </div>
    </main>
  );
}
