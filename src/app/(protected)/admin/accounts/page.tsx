import Link from "next/link";
import { getAdminAccounts } from "@/features/admin/admin-service";
import { PageHeader } from "@/components/workspace/page-header";
import { StatusBadge } from "@/components/workspace/status-badge";

export default async function AdminAccountsPage() {
  const { rows } = await getAdminAccounts();
  return <div className="grid gap-6"><PageHeader eyebrow="Admin / Accounts" title="Challenge accounts" description="Review lifecycle state and integration readiness. Provider data is shown only when stored." /><section className="overflow-x-auto rounded-tf-lg border border-border bg-card"><table className="w-full min-w-[800px] text-left text-sm"><thead className="border-b border-border text-xs text-muted-foreground"><tr>{["Account", "User", "Size", "Phase", "Status", "Platform", "Provider"].map((label) => <th key={label} className="px-5 py-3">{label}</th>)}</tr></thead><tbody>{rows.map((account) => <tr key={account.id} className="border-b border-border/70"><td className="px-5 py-4 font-medium">
  <Link
    href={`/admin/accounts/${account.id}`}
    className="text-primary hover:underline"
  >
    {account.account_name}
  </Link>
</td><td className="px-5 py-4 font-mono text-xs">{account.user_id}</td><td className="px-5 py-4">${account.account_size.toLocaleString()}</td><td className="px-5 py-4">{account.phase}</td><td className="px-5 py-4"><StatusBadge tone={account.status === "failed" || account.status === "closed" ? "danger" : account.status === "passed" || account.status === "funded" ? "success" : "warning"}>{account.status}</StatusBadge></td><td className="px-5 py-4">{account.platform}</td><td className="px-5 py-4 text-muted-foreground">{account.provider_account_id ?? "Integration pending"}</td></tr>)}</tbody></table></section>{rows.length === 0 && <p className="text-sm text-muted-foreground">No accounts found</p>}</div>;
}