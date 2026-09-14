"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Banknote, ClipboardList, CreditCard, FileText, LayoutDashboard, LogOut, Settings, ShieldCheck, Users, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const items = [
  ["Overview", "/admin", LayoutDashboard],
  ["Users", "/admin/users", Users],
  ["Orders", "/admin/orders", ClipboardList],
  ["Payments", "/admin/payments", CreditCard],
  ["Accounts", "/admin/accounts", WalletCards],
  ["Payouts", "/admin/payouts", Banknote],
  ["Audit Logs", "/admin/audit-logs", FileText],
  ["Settings", "/admin/settings", Settings],
] as const;

export function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  const pathname = usePathname();
  async function signOut() {
    await supabase.auth.signOut();
    window.location.assign("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-card/95 px-4 py-5 lg:block">
        <Link href="/admin" className="flex items-center gap-3 border-b border-border px-2 pb-5">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground"><ShieldCheck className="size-5" /></span>
          <span><strong className="block font-display text-lg">TradeForge</strong><span className="text-xs uppercase tracking-[.16em] text-primary">Admin control</span></span>
        </Link>
        <nav aria-label="Admin navigation" className="mt-6 grid gap-1">
          {items.map(([label, href, Icon]) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium", active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-white/[.05] hover:text-foreground")}><Icon className="size-4" />{label}</Link>;
          })}
        </nav>
        <div className="absolute inset-x-4 bottom-5 border-t border-border pt-4">
          <div className="flex items-center gap-3 px-2"><span className="grid size-8 place-items-center rounded-full bg-success/15 text-xs font-bold text-success">{email.slice(0, 2).toUpperCase()}</span><span className="min-w-0 truncate text-xs text-muted-foreground">{email}</span></div>
          <button type="button" onClick={signOut} className="mt-3 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-white/[.05] hover:text-foreground"><LogOut className="size-4" />Sign out</button>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl sm:px-6">
          <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Operations</p><h1 className="font-display text-lg font-semibold">Control center</h1></div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Activity className="size-4 text-success" />Live database view</div>
        </header>
        <main className="mx-auto w-full max-w-[1720px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}