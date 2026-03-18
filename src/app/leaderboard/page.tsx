import { LeaderboardSection } from "@/components/leaderboard/leaderboard-section";

export const metadata = {
  title: "Shame Leaderboard | Devroast",
  description: "The most roasted code on the internet.",
};

export default function LeaderboardPage() {
  return (
    <main className="bg-bg-page">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-6 py-10 sm:px-10 lg:px-20">
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3 font-mono text-[28px] font-bold text-text-primary sm:text-[32px]">
            <span className="text-accent-green">&gt;</span>
            <span>shame_leaderboard</span>
          </div>
        </section>

        <LeaderboardSection />
      </div>
    </main>
  );
}
