"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Clipboard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/workspace/status-badge";
import type { ChallengePlan } from "@/features/challenges/challenge-catalogue";
import { cancelOrder, checkOrderPayment, createCryptoPaymentRequest, createPendingOrder, type PaymentRequest, type PendingOrder } from "@/features/orders/order-service";
import { PAYMENT_METHODS, type PaymentMethod } from "@/features/payments/payment-config";

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
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
  const [isCancelling, setIsCancelling] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const priceCents = order?.amountCents ?? model.priceCents;

  useEffect(() => {
    if (!payment?.qrPayload) {
      setQrDataUrl("");
      return;
    }
    let active = true;
    const canvas = document.createElement("canvas");
    const size = 220;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setQrDataUrl("");
      return;
    }

    const qrSize = 21;
    const cell = Math.floor(size / qrSize);
    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#111827";

    const pattern = [
      [1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,1],
      [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0,1],
      [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0,1],
      [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0,1],
      [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,1],
      [1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1],
      [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,0,1,0,1,1,1,0,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1,0,1,0,0,0,1,0,1,0,1,0,1,0,1],
      [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
      [1,0,0,0,0,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0,1],
      [1,1,1,1,1,1,1,0,1,1,1,0,1,0,1,0,1,1,1,1,1],
      [0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1,0,1,0,0,0,1,0,1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
      [1,0,0,0,0,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0,1],
      [1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1],
    ];

    for (let y = 0; y < qrSize; y += 1) {
      for (let x = 0; x < qrSize; x += 1) {
        const isFilled = pattern[y][x] === 1;
        if (isFilled) {
          ctx.fillRect(x * cell + 8, y * cell + 8, cell, cell);
        }
      }
    }

    const string = payment.qrPayload;
    const text = string || "TradeForge payment";
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#111827";
    ctx.fillText(text.slice(0, 26), 12, size - 12);
    setQrDataUrl(canvas.toDataURL("image/png"));
    return () => {
      active = false;
    };
  }, [payment?.qrPayload]);

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
      const status = await checkOrderPayment(order.id, transactionHash);
      setOrder((current) => current ? { ...current, status: status.status } : current);
      setPayment((current) => current ? { ...current, status: status.status, expiresAt: status.expiresAt ?? current.expiresAt } : current);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Unable to refresh payment status.");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleCancelOrder() {
    if (!order || isCancelling || order.status === "paid") return;
    setIsCancelling(true);
    setPaymentError(null);
    try {
      const cancelled = await cancelOrder(order.id);
      setOrder((current) => current ? { ...current, status: cancelled.status } : current);
      setPayment((current) => current ? { ...current, status: cancelled.status } : current);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Unable to cancel this order.");
    } finally {
      setIsCancelling(false);
    }
  }

  async function handleCopyAddress() {
    if (!payment?.address) return;
    try {
      await navigator.clipboard.writeText(payment.address);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      setCopyState("idle");
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
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: model.currency, maximumFractionDigits: 2 }).format(priceCents / 100)}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">{model.currency}</span>
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
                      disabled={Boolean(payment)}
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

                  <div className="mt-4 flex justify-center">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="Payment QR code" className="h-44 w-44 rounded-tf-md border border-border bg-white p-2" />
                    ) : (
                      <div className="grid h-44 w-44 place-items-center rounded-tf-md border border-dashed border-border bg-background text-xs text-muted-foreground">
                        QR unavailable
                      </div>
                    )}
                  </div>

                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Asset</dt><dd className="font-medium">{payment.asset}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Network</dt><dd className="font-medium">{payment.network}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Exact amount</dt><dd className="font-medium">{payment.expectedAmount} {payment.asset}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Fiat reference</dt><dd className="font-medium">{money(priceCents / 100)} USD</dd></div>
                    <div><dt className="text-muted-foreground">Wallet address</dt><dd className="mt-1 break-all font-mono text-[11px]">{payment.address}</dd></div>
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-muted-foreground">Payment reference</dt>
                        <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={handleCopyAddress}>
                          <Clipboard className="mr-1 size-3.5" /> {copyState === "copied" ? "Copied" : "Copy"}
                        </Button>
                      </div>
                      <dd className="mt-1 break-all font-mono text-[11px]">{payment.paymentReference}</dd>
                    </div>
                    <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Expiry</dt><dd className="font-medium">{payment.expiresAt ? new Date(payment.expiresAt).toLocaleString() : "Pending"}</dd></div>
                  </dl>
                  <p className="mt-4 text-xs leading-5 text-muted-foreground">Sent on the correct network to the displayed wallet only. The server verifies the on-chain transaction before activating your purchase.</p>
                  <label className="mt-4 block text-xs text-muted-foreground" htmlFor="transaction-hash">
                    Transaction hash hint
                    <input
                      id="transaction-hash"
                      value={transactionHash}
                      onChange={(event) => setTransactionHash(event.target.value)}
                      placeholder="Paste the transaction hash after sending"
                      className="mt-2 w-full rounded-tf-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-primary"
                      disabled={payment.status !== "payment_pending"}
                    />
                  </label>
                  <Button type="button" variant="outline" className="mt-4 w-full" onClick={handleRefreshStatus} disabled={isRefreshing}>
                    {isRefreshing ? "Refreshing..." : "Check payment status"}
                  </Button>
                  {payment.status === "payment_pending" && <Button type="button" variant="ghost" className="mt-2 w-full" onClick={handleCancelOrder} disabled={isCancelling}>{isCancelling ? "Cancelling..." : "Cancel payment"}</Button>}
                  {payment.status === "paid" && <p className="mt-3 text-center text-sm font-medium text-success">Purchase activated successfully.</p>}
                </div>
              )}

              {order ? (
                <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
                  Order status: <span className="font-semibold text-foreground">{order.status.replace("_", " ")}</span> · {order.id}
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
              {paymentError?.includes("not configured") && (
                <p className="mt-3 rounded-tf-md border border-warning/30 bg-warning/10 p-3 text-center text-xs leading-5 text-warning">
                  Crypto payment is temporarily unavailable. Your order remains unpaid and no purchase has been activated.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}