"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/workspace/status-badge";
import type { ChallengePlan } from "@/features/challenges/challenge-catalogue";
import { createCryptoPaymentRequest, createPendingOrder, getOrderPaymentStatus, type PaymentRequest, type PendingOrder } from "@/features/orders/order-service";
import { PAYMENT_METHODS, type PaymentMethod } from "@/features/payments/payment-config";

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function CheckoutPage({ model }: { model: ChallengePlan }) {
  const size = model.accountSize;
  const [order, setOrder] = useState<PendingOrder | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS[0]);
  const [payment, setPayment] = useState<PaymentRequest | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleCreateOrder() {
    if (isCreatingOrder || order) return;

    setIsCreatingOrder(true);
    setOrderError(null);

    try {
      const pendingOrder = await createPendingOrder(model.planId);
      setOrder(pendingOrder);
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "Unable to create order.");
    } finally {
      setIsCreatingOrder(false);
    }
  }

  async function handleCreatePayment() {
    if (!order || isCreatingPayment) return;
    setIsCreatingPayment(true);
    setPaymentError(null);
    try {
      setPayment(await createCryptoPaymentRequest(order.id, paymentMethod));
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Unable to create payment instructions.");
    } finally {
      setIsCreatingPayment(false);
    }
  }

  async function handleRefreshStatus() {
    if (!order || isRefreshing) return;
    setIsRefreshing(true);
    try {
      const status = await getOrderPaymentStatus(order.id);
      setOrder((current) => current ? { ...current, status: status.status } : current);
      setPayment((current) => current ? { ...current, status: status.status, expiresAt: status.expiresAt ?? current.expiresAt } : current);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Unable to refresh payment status.");
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] p-5 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/challenges/${model.id}/${size}`}
          className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to evaluation
        </Link>

        <div className="mt-6 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Checkout
            </p>

            {model.recommended && (
              <StatusBadge tone="primary">Recommended</StatusBadge>
            )}
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            Confirm your evaluation
          </h1>

          <p className="text-sm text-muted-foreground">
            Review the selected challenge before continuing.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_380px]">
          <section className="rounded-tf-lg border border-border bg-surface">
            <div className="border-b border-border p-5">
              <p className="text-sm font-semibold">Selected evaluation</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {model.name} · {money(size)} account
              </p>
            </div>

            <div className="p-5">
              <div className="rounded-tf-lg border border-primary/40 bg-primary/10 p-5">
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-tf-md bg-primary/15 text-primary">
                    <ShieldCheck className="size-5" />
                  </span>

                  <div>
                    <p className="text-lg font-semibold">{model.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {model.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Account size
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {money(size)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["Phases", String(model.phases)],
                  ["Profit target", model.profitTarget],
                  ["Daily loss limit", model.dailyLossLimit],
                  ["Overall loss limit", model.overallLossLimit],
                  ["Trading days", model.tradingDays],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-tf-md border border-border bg-background p-4"
                  >
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-2 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold">Included</p>

                <ul className="mt-3 space-y-3">
                  {[
                    "Clear evaluation objectives",
                    "Transparent risk limits",
                    "Visible challenge progress",
                    "Rule-based evaluation tracking",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-tf-lg border border-border bg-surface">
            <div className="border-b border-border p-5">
              <p className="text-lg font-semibold">Ready to continue?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your selected model and account size are shown below.
              </p>
            </div>

            <div className="p-5">
              <div className="rounded-tf-md border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">Evaluation</p>
                <p className="mt-1 font-medium">{model.name}</p>

                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">
                    Account size
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {money(size)}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-tf-md border border-border bg-background p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Payment method
                </p>
                <div className="mt-3 grid gap-2">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method}
                      type="button"
                      className={`rounded-tf-md border px-3 py-3 text-left text-sm transition-colors ${paymentMethod === method ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                      onClick={() => setPaymentMethod(method)}
                      disabled={!order || Boolean(payment)}
                    >
                      <span className="font-medium">{method.replace("_", " / ")}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                className="mt-5 w-full"
                disabled={isCreatingOrder || Boolean(order)}
                onClick={handleCreateOrder}
              >
                {isCreatingOrder ? "Creating order..." : order ? "Order created" : "Create pending order"}
              </Button>

              {order && !payment && (
                <Button type="button" variant="outline" className="mt-3 w-full" disabled={isCreatingPayment} onClick={handleCreatePayment}>
                  {isCreatingPayment ? "Preparing payment..." : "Show payment instructions"}
                </Button>
              )}

              {payment && (
                <div className="mt-5 rounded-tf-md border border-primary/40 bg-primary/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">Awaiting payment</p>
                    <StatusBadge tone={payment.status === "paid" ? "success" : "warning"}>
                      {payment.status === "paid" ? "Paid" : payment.status.replace("_", " ")}
                    </StatusBadge>
                  </div>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Asset</dt><dd className="font-medium">{payment.asset}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Network</dt><dd className="font-medium">{payment.network}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Amount</dt><dd className="font-medium">{payment.expectedAmount}</dd></div>
                    <div><dt className="text-muted-foreground">Destination</dt><dd className="mt-1 break-all font-mono text-xs">{payment.address}</dd></div>
                    <div><dt className="text-muted-foreground">Payment reference</dt><dd className="mt-1 break-all font-mono text-xs">{payment.paymentReference}</dd></div>
                  </dl>
                  <p className="mt-4 text-xs leading-5 text-muted-foreground">Send the exact amount on the selected network. The server verifies the blockchain payment before activating your purchase.</p>
                  <Button type="button" variant="outline" className="mt-4 w-full" onClick={handleRefreshStatus} disabled={isRefreshing}>
                    {isRefreshing ? "Refreshing..." : "Refresh payment status"}
                  </Button>
                  {payment.status === "paid" && <p className="mt-3 text-center text-sm font-medium text-success">Purchase activated successfully.</p>}
                </div>
              )}

              {order ? (
                <p className="mt-3 text-center text-xs leading-5 text-success">
                  Pending order created: {order.id}
                </p>
              ) : orderError ? (
                <p role="alert" className="mt-3 text-center text-xs leading-5 text-danger">
                  {orderError}
                </p>
              ) : paymentError ? (
                <p role="alert" className="mt-3 text-center text-xs leading-5 text-danger">
                  {paymentError}
                </p>
              ) : (
                <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
                  Payment verification is server-side. Your purchase activates only after a confirmed payment.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}