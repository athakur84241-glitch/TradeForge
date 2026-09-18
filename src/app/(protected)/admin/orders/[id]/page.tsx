import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminOrder } from "@/features/admin/admin-service";
import { AdminReconcilePayment } from "@/features/admin/admin-actions";
import { PageHeader } from "@/components/workspace/page-header";
import { SectionCard } from "@/components/workspace/section-card";
import { StatusBadge } from "@/components/workspace/status-badge";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const order = await getAdminOrder((await params).id);

    if (!order) {
      notFound();
    }

    const purchase = order.purchase;
    const account = order.account;
    const plan = order.plan;

    const paymentTone =
      order.status === "paid"
        ? "success"
        : order.status === "failed" || order.status === "cancelled"
          ? "danger"
          : "warning";

    return (
      <div className="grid gap-6">
        <PageHeader
          eyebrow="Admin / Orders"
          title="Order lifecycle"
          description={order.id}
          action={
            order.status === "payment_pending" ? (
              <AdminReconcilePayment orderId={order.id} />
            ) : undefined
          }
        />

        <section className="grid gap-3 md:grid-cols-2">
          <SectionCard title="Lifecycle">
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Order</span>
                <span className="font-mono text-xs">{order.id}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-mono text-xs">{order.user_id}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Challenge plan</span>
                <span>
                  {plan?.name ?? "Plan unavailable"}
                  {" / "}
                  ${Number(order.account_size).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Payment</span>
                <StatusBadge tone={paymentTone}>
                  {order.status}
                </StatusBadge>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Purchase</span>

                {purchase ? (
                  <Link
                    href={`/admin/users/${purchase.user_id}`}
                    className="font-mono text-xs text-primary hover:underline"
                  >
                    {purchase.id}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">
                    Not created
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Account</span>

                {account ? (
                  <Link
                    href={`/admin/accounts/${account.id}`}
                    className="text-primary hover:underline"
                  >
                    {account.account_name}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">
                    Not provisioned
                  </span>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Verification details">
            <div className="grid gap-2 text-sm">
              <span>
                Method: {order.payment_method ?? "Unavailable"}
              </span>

              <span>
                Network: {order.payment_network ?? "Unavailable"}
              </span>

              <span className="break-all">
                Receiving wallet:{" "}
                {order.payment_address ?? "Unavailable"}
              </span>

              <span className="break-all">
                Transaction:{" "}
                {order.transaction_hash ??
                  order.payment_transaction_hint ??
                  "Not submitted"}
              </span>

              <span>
                Expected amount:{" "}
                {order.expected_amount ?? "Unavailable"}
                {order.currency ? ` ${order.currency}` : ""}
              </span>

              <span>
                Detected amount:{" "}
                {order.detected_amount_atomic ?? "Not detected"}
              </span>

              <span>
                Confirmations:{" "}
                {order.confirmation_count ?? "Not verified"}
              </span>

              <span>
                Provider:{" "}
                {order.verification_provider ?? "Unavailable"}
              </span>

              <span>
                Verified at:{" "}
                {order.verified_at
                  ? new Date(order.verified_at).toLocaleString()
                  : "Not verified"}
              </span>
            </div>
          </SectionCard>
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          <SectionCard title="Purchase state">
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Exists</span>
                <span>
                  {purchase ? "Yes" : "No"}
                </span>
              </div>

              {purchase && (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge
                      tone={
                        purchase.status === "active"
                          ? "success"
                          : "danger"
                      }
                    >
                      {purchase.status}
                    </StatusBadge>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      Purchased
                    </span>
                    <span>
                      {new Date(
                        purchase.purchased_at
                      ).toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Account provisioning">
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Exists</span>
                <span>
                  {account ? "Yes" : "No"}
                </span>
              </div>

              {account && (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      Status
                    </span>
                    <StatusBadge
                      tone={
                        account.status === "funded_pending_integration"
                          ? "warning"
                          : account.status === "failed" ||
                              account.status === "suspended" ||
                              account.status === "closed"
                            ? "danger"
                            : "success"
                      }
                    >
                      {account.status}
                    </StatusBadge>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      Phase
                    </span>
                    <span>{account.phase}</span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      Platform
                    </span>
                    <span>{account.platform}</span>
                  </div>
                </>
              )}

              {order.status === "paid" && !purchase && (
                <p className="text-xs leading-5 text-warning">
                  Order is marked paid, but no purchase record exists.
                </p>
              )}

              {purchase && !account && (
                <p className="text-xs leading-5 text-warning">
                  Purchase exists, but no account record exists yet.
                </p>
              )}
            </div>
          </SectionCard>
        </section>
      </div>
    );
  } catch {
    notFound();
  }
}