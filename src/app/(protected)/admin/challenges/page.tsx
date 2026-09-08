import { getAdminSnapshot } from "@/features/admin/admin-service";
import { PageHeader } from "@/components/workspace/page-header";
import { StatusBadge } from "@/components/workspace/status-badge";
import { AdminPlanToggle } from "@/features/admin/admin-actions";

export default async function AdminChallengesPage() {
  const { plans } = await getAdminSnapshot();
  return <div className="grid gap-6"><PageHeader eyebrow="Admin / Challenges" title="Challenge plans" description="Plans are sourced from challenge_plans. Changes are authorized and audited server-side." /><section className="overflow-x-auto rounded-tf-lg border border-border bg-card"><table className="w-full min-w-[780px] text-left text-sm"><thead className="border-b border-border text-xs text-muted-foreground"><tr>{["Name", "Size", "Price", "Currency", "State", "Actions"].map((label) => <th key={label} className="px-5 py-3">{label}</th>)}</tr></thead><tbody>{plans.map((plan) => <tr key={plan.id} className="border-b border-border/70"><td className="px-5 py-4 font-medium">{plan.name}</td><td className="px-5 py-4">${plan.account_size.toLocaleString()}</td><td className="px-5 py-4">${(plan.price_cents / 100).toFixed(2)}</td><td className="px-5 py-4">{plan.currency}</td><td className="px-5 py-4"><StatusBadge tone={plan.is_active ? "success" : "neutral"}>{plan.is_active ? "active" : "disabled"}</StatusBadge></td><td className="px-5 py-4"><AdminPlanToggle planId={plan.id} isActive={plan.is_active} /></td></tr>)}</tbody></table></section></div>;
}