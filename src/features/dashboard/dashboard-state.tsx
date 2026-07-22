import { Inbox, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function EmptyState({ title = "Nothing to review yet", description = "New account activity will appear here as it becomes available." }: { title?: string; description?: string }) { return <Card className="grid min-h-64 place-items-center p-6 text-center"><div><span className="mx-auto grid size-11 place-items-center rounded-full bg-primary/10 text-primary"><Inbox className="size-5" /></span><h3 className="mt-4">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p><Button variant="outline" size="sm" className="mt-5"><Plus className="size-4" />Explore challenges</Button></div></Card>; }

function SkeletonLine({ className = "" }: { className?: string }) { return <div className={`animate-pulse rounded bg-muted ${className}`} />; }
export function DashboardSkeleton() { return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading dashboard" aria-busy="true">{Array.from({ length: 6 }, (_, index) => <Card className="p-5" key={index}><SkeletonLine className="h-4 w-24" /><SkeletonLine className="mt-4 h-8 w-36" /><SkeletonLine className="mt-3 h-3 w-28" /></Card>)}</div>; }
