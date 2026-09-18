import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUser } from "@/features/admin/admin-service";
import { PageHeader } from "@/components/workspace/page-header";
import { SectionCard } from "@/components/workspace/section-card";
import { StatusBadge } from "@/components/workspace/status-badge";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const user = await getAdminUser((await params).id);

    if (!user.user) {
      notFound();
    }

    return (
      <div className="grid gap-6">
        <PageHeader
          eyebrow="Admin / Users"
          title={
            user.profile?.display_name ??
            user.user.email ??
            "User detail"
          }
          description={user.user.id}
        />

        <section className="grid gap-3 md:grid-cols-3">
          <SectionCard title="Profile">
            <div className="grid gap-2 text-sm">
              <span>{user.user.email ?? "Email unavailable"}</span>

              <span>
                Role: {user.profile?.role ?? "trader"}
              </span>

              <span>
                Joined:{" "}
                {new Date(user.user.created_at).toLocaleString()}
              </span>

              <span>
                Last sign in:{" "}
                {user.user.last_sign_in_at
                  ? new Date(
                      user.user.last_sign_in_at
                    ).toLocaleString()
                  : "Never"}
              </span>
            </div>
          </SectionCard>

          <SectionCard title="Orders">
            <p className="text-2xl font-semibold">
              {user.orders.length}
            </p>
          </SectionCard>

          <SectionCard title="Accounts">
            <p className="text-2xl font-semibold">
              {user.accounts.length}
            </p>
          </SectionCard>
        </section>

        <section className="grid gap-6">
          <SectionCard title="Orders">
            {user.orders.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="border-b border-border text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created</th>
                    </tr>
                  </thead>

                  <tbody>
                    {user.orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-border/70"
                      >
                        <td className="px-4 py-3 font-mono text-xs">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-primary hover:underline"
                          >
                            {order.id}
                          </Link>
                        </td>

                        <td className="px-4 py-3">
                          {(order.amount_cents / 100).toFixed(2)}{" "}
                          {order.currency}
                        </td>

                        <td className="px-4 py-3">
                          <StatusBadge
                            tone={
                              order.status === "paid"
                                ? "success"
                                : order.status === "failed" ||
                                    order.status === "cancelled"
                                  ? "danger"
                                  : "warning"
                            }
                          >
                            {order.status}
                          </StatusBadge>
                        </td>

                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(
                            order.created_at
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No orders found.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Accounts">
            {user.accounts.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead className="border-b border-border text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Account</th>
                      <th className="px-4 py-3">Size</th>
                      <th className="px-4 py-3">Phase</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Platform</th>
                    </tr>
                  </thead>

                  <tbody>
                    {user.accounts.map((account) => (
                      <tr
                        key={account.id}
                        className="border-b border-border/70"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/accounts/${account.id}`}
                            className="text-primary hover:underline"
                          >
                            {account.account_name}
                          </Link>
                        </td>

                        <td className="px-4 py-3">
                          ${account.account_size.toLocaleString()}
                        </td>

                        <td className="px-4 py-3">
                          {account.phase}
                        </td>

                        <td className="px-4 py-3">
                          <StatusBadge
                            tone={
                              account.status === "passed" ||
                              account.status === "funded"
                                ? "success"
                                : account.status === "failed" ||
                                    account.status === "closed"
                                  ? "danger"
                                  : "warning"
                            }
                          >
                            {account.status}
                          </StatusBadge>
                        </td>

                        <td className="px-4 py-3">
                          {account.platform}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No accounts found.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Payout requests">
            {user.payouts.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="border-b border-border text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Request</th>
                      <th className="px-4 py-3">Account</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Requested</th>
                    </tr>
                  </thead>

                  <tbody>
                    {user.payouts.map((payout) => (
                      <tr
                        key={payout.id}
                        className="border-b border-border/70"
                      >
                        <td className="px-4 py-3 font-mono text-xs">
                          {payout.id}
                        </td>

                        <td className="px-4 py-3 font-mono text-xs">
                          {payout.account_id}
                        </td>

                        <td className="px-4 py-3">
                          ${Number(
                            payout.requested_amount
                          ).toFixed(2)}
                        </td>

                        <td className="px-4 py-3">
                          <StatusBadge
                            tone={
                              payout.status === "paid"
                                ? "success"
                                : payout.status === "rejected" ||
                                    payout.status === "cancelled"
                                  ? "danger"
                                  : "warning"
                            }
                          >
                            {payout.status}
                          </StatusBadge>
                        </td>

                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(
                            payout.requested_at
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No payout requests found.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Admin audit activity">
            {user.audit.length ? (
              <div className="grid gap-2 text-sm">
                {user.audit.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-col gap-1 border-b border-border/70 py-3 md:flex-row md:items-center md:justify-between md:gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        {event.action}
                      </p>

                      <p className="font-mono text-xs text-muted-foreground">
                        {event.entity_type}
                        {event.entity_id
                          ? ` · ${event.entity_id}`
                          : ""}
                      </p>
                    </div>

                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(
                        event.created_at
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No audit activity found.
              </p>
            )}
          </SectionCard>
        </section>
      </div>
    );
  } catch {
    notFound();
  }
}