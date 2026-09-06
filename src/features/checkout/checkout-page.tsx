"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/workspace/status-badge";
import type { ChallengePlan } from "@/features/challenges/challenge-catalogue";
import { createPendingOrder, type PendingOrder } from "@/features/orders/order-service";

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
                  Next step
                </p>
                <p className="mt-2 text-sm">
                  Create your pending order before continuing to payment.
                </p>
              </div>

              <Button
                type="button"
                className="mt-5 w-full"
                disabled={isCreatingOrder || Boolean(order)}
                onClick={handleCreateOrder}
              >
                {isCreatingOrder ? "Creating order..." : order ? "Order created" : "Create pending order"}
              </Button>

              {order ? (
                <p className="mt-3 text-center text-xs leading-5 text-success">
                  Pending order created: {order.id}
                </p>
              ) : orderError ? (
                <p role="alert" className="mt-3 text-center text-xs leading-5 text-danger">
                  {orderError}
                </p>
              ) : (
                <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
                  Payment processing will be connected after the checkout flow
                  is verified.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}