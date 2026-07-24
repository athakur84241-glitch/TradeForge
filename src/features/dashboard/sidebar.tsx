import Link from "next/link";
import { Menu, X } from "lucide-react";
import { navigationItems } from "./mock-data";
import { cn } from "@/lib/utils";

function Brand() {
  return <Link href="/" className="flex items-center gap-3" aria-label="TradeForge dashboard home"><span className="grid size-9 place-items-center rounded-tf-sm bg-primary-solid font-display text-sm font-bold text-primary-solid-foreground shadow-glow">T</span><span className="font-display text-lg font-bold tracking-tight">TradeForge</span></Link>;
}

function NavigationLinks({ compact = false }: { compact?: boolean }) {
  return <nav aria-label="Primary navigation" className={cn("grid gap-1", compact && "grid-flow-col auto-cols-fr")}>{navigationItems.map(({ label, href, icon: Icon, active }) => <a key={label} href={href} aria-current={active ? "page" : undefined} className={cn("group flex items-center gap-3 rounded-tf-md px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-white/[.05] hover:text-foreground", compact && "justify-center px-2 py-2")}><Icon className="size-5 shrink-0" aria-hidden="true" /><span className={cn(compact && "sr-only")}>{label}</span></a>)}</nav>;
}

export function DashboardSidebar() {
  return <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-background/95 px-4 py-6 backdrop-blur-xl lg:flex lg:flex-col"><Brand /><div className="mt-10"><NavigationLinks /></div><div className="mt-auto rounded-tf-lg border border-border bg-surface p-4"><p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">Trade with clarity</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Review your objectives before opening a position.</p></div></aside>;
}

export function MobileNavigation() {
  return <details className="group relative lg:hidden"><summary className="grid size-10 cursor-pointer place-items-center rounded-tf-md text-muted-foreground hover:bg-white/[.06] hover:text-foreground [&::-webkit-details-marker]:hidden" aria-label="Toggle navigation"><Menu className="size-5 group-open:hidden" /><X className="hidden size-5 group-open:block" /></summary><div className="absolute left-0 top-12 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-tf-lg border border-border bg-card p-2 shadow-card"><NavigationLinks /></div></details>;
}

export function MobileDock() {
  const items = navigationItems.slice(0, 5);
  return <nav aria-label="Mobile quick navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background/95 px-2 py-2 backdrop-blur-xl lg:hidden">{items.map(({ label, href, icon: Icon, active }) => <a key={label} href={href} aria-current={active ? "page" : undefined} className={cn("grid min-h-11 place-items-center rounded-tf-sm", active ? "text-primary" : "text-muted-foreground")}><Icon className="size-5" aria-hidden="true" /><span className="sr-only">{label}</span></a>)}</nav>;
}
