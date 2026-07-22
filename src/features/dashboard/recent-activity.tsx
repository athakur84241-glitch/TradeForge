import { ArrowUpRight, CircleDollarSign, Flag, ReceiptText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { recentActivities } from "./mock-data";
import type { ActivityItem } from "./types";

const activityIcons: Record<ActivityItem["kind"], typeof ArrowUpRight> = { trade: ArrowUpRight, milestone: Flag, payout: ReceiptText };
export function RecentActivity() { return <Card className="p-0"><div className="flex items-center justify-between px-5 py-5 sm:px-6"><div><h3>Recent activity</h3><p className="mt-1 text-sm text-muted-foreground">Your latest account events.</p></div><CircleDollarSign className="size-5 text-primary" aria-hidden="true" /></div><div className="border-t border-border">{recentActivities.map((activity) => { const Icon = activityIcons[activity.kind]; return <div key={activity.id} className="flex gap-3 px-5 py-4 transition-colors hover:bg-white/[.025] sm:px-6"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="size-4" /></span><div className="min-w-0 flex-1"><p className="text-sm font-medium">{activity.title}</p><p className="mt-1 text-xs text-muted-foreground">{activity.description}</p></div><time className="shrink-0 text-xs text-muted-foreground">{activity.timestamp}</time></div>; })}</div></Card>; }
