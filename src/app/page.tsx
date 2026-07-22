import { ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountOverview } from "@/features/dashboard/account-overview";
import { ChallengeProgress } from "@/features/dashboard/challenge-progress";
import { DashboardMetricCard } from "@/features/dashboard/dashboard-metric-card";
import { EmptyState } from "@/features/dashboard/dashboard-state";
import { dashboardMetrics } from "@/features/dashboard/mock-data";
import { RecentActivity } from "@/features/dashboard/recent-activity";
import { DashboardSidebar, MobileDock } from "@/features/dashboard/sidebar";
import { TopNavigation } from "@/features/dashboard/top-navigation";

export default function DashboardPage() {
  return <div className="min-h-screen pb-20 lg:pb-0"><DashboardSidebar /><div className="lg:pl-64"><TopNavigation /><main className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10"><section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="flex items-center gap-2 text-sm font-semibold text-primary"><Sparkles className="size-4" />Thursday, 23 July</p><h1 className="mt-2 text-3xl sm:text-4xl">Welcome back, Alex.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Your evaluation is moving steadily. Keep your strategy focused and your risk parameters in view.</p></div><Button className="shrink-0">Open trading platform <ArrowUpRight className="size-4" /></Button></section><section aria-labelledby="metrics-heading" className="mt-9"><div className="mb-4 flex items-center justify-between"><h2 id="metrics-heading" className="text-lg">Account performance</h2><p className="text-xs text-muted-foreground">Updated just now</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{dashboardMetrics.map((metric) => <DashboardMetricCard key={metric.label} metric={metric} />)}</div></section><section id="overview" aria-label="Account overview" className="mt-6"><AccountOverview /></section><div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,.85fr)]"><ChallengeProgress /><RecentActivity /></div><section className="mt-6 max-w-xl" aria-label="Pending requests"><EmptyState title="No active requests" description="When you submit a payout, account update, or support request, its status will appear here." /></section></main></div><MobileDock /></div>;
}
