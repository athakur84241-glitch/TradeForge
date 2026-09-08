import Link from "next/link";
import { getAdminSnapshot } from "@/features/admin/admin-service";
import { PageHeader } from "@/components/workspace/page-header";
import { SectionCard } from "@/components/workspace/section-card";
import { StatusBadge } from "@/components/workspace/status-badge";

export default async function AdminPage() {
  const snapshot = await getAdminSnapshot();
  const cards = [
    ["Orders", snapshot.orders.length, "/admin/orders"],
    ["Purchases", snapshot.purchases.length, "/admin/orders"],
    ["Accounts", snapshot.accounts.length, "/admin/accounts"],
    ["Payout requests", snapshot.payouts.length, "/admin/payouts"],
  ];
  return <div className="grid gap-6"><PageHeader eyebrow="Admin" title="Operations workspace" description="Review authoritative orders, entitlements, accounts, payouts, and challenge plans." />
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, href]) => <Link key={label} href={String(href)} className="rounded-tf-lg border border-border bg-card p-5 hover:border-primary"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-2xl font-semibold">{value}</p></Link>)}</section>
    <SectionCard title="Recent orders" description="Server-side order status and payment state."><div className="grid gap-3">{snapshot.orders.slice(0, 8).map((order) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-tf-md border border-border bg-surface p-4"><div><p className="font-medium">{order.id}</p><p className="text-xs text-muted-foreground">{order.payment_method ?? "Payment not selected"}</p></div><StatusBadge tone={order.status === "paid" ? "success" : order.status === "failed" ? "danger" : "warning"}>{order.status}</StatusBadge></div>)}</div></SectionCard>
  </div>;
}