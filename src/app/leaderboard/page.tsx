import type { Metadata } from "next";
import { LeaderboardWorkspace } from "@/features/leaderboard/leaderboard-workspace";

export const metadata: Metadata = {
  title: "Leaderboard",
};

export default function Page() {
  return <LeaderboardWorkspace />;
}
