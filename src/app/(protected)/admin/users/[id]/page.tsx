import { notFound } from "next/navigation";
import { getAdminUser } from "@/features/admin/admin-service";
import { PageHeader } from "@/components/workspace/page-header";
import { SectionCard } from "@/components/workspace/section-card";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAdminUser((await params).id); if (!user.user) notFound();
    return <div className="grid gap-6"><PageHeader eyebrow="Admin / Users" title={user.profile?.display_name ?? user.user.email ?? "User detail"} description={user.user.id} /><section className="grid gap-3 md:grid-cols-3"><SectionCard title="Profile"><div className="grid gap-2 text-sm"><span>{user.user.email ?? "Email unavailable"}</span><span>Role: {user.profile?.role ?? "trader"}</span><span>Joined: {new Date(user.user.created_at).toLocaleString()}</span></div></SectionCard><SectionCard title="Orders"><p className="text-2xl font-semibold">{user.orders.length}</p></SectionCard><SectionCard title="Accounts"><p className="text-2xl font-semibold">{user.accounts.length}</p></SectionCard></section><SectionCard title="Recent activity"><div className="grid gap-2 text-sm">{user.audit.length ? user.audit.map((event) => <div key={event.id} className="flex justify-between gap-4 border-b border-border/70 py-2"><span>{event.action}</span><span className="text-muted-foreground">{new Date(event.created_at).toLocaleString()}</span></div>) : <p className="text-muted-foreground">No audit events for this user</p>}</div></SectionCard></div>;
  } catch { notFound(); }
}