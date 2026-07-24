"use client";

import { FormEvent, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Banknote,
  CalendarClock,
  Check,
  CircleDollarSign,
  Clock3,
  Landmark,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/workspace/metric-card";
import { PageHeader } from "@/components/workspace/page-header";
import { SectionCard } from "@/components/workspace/section-card";
import { StatusBadge } from "@/components/workspace/status-badge";
import { payouts } from "@/features/workspace/mock-data";
import type { Payout } from "@/features/workspace/types";

const payoutTabs = ["All", "Pending", "Completed", "Rejected"] as const;
type PayoutFilter = (typeof payoutTabs)[number];

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function statusTone(status: Payout["status"]) {
  if (status === "Completed") return "success" as const;
  if (status === "Rejected") return "danger" as const;
  return "warning" as const;
}

function RequestPayoutDialog() {
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <Dialog.Root onOpenChange={(open) => !open && setSubmitted(false)}>
      <Dialog.Trigger asChild>
        <Button>
          <CircleDollarSign className="size-4" /> Request payout
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-tf-xl border border-border bg-card p-6 shadow-floating">
          <Dialog.Close className="absolute right-4 top-4 grid size-10 place-items-center rounded-tf-md text-muted-foreground hover:bg-white/[.06] hover:text-foreground" aria-label="Close payout request">
            <X className="size-4" />
          </Dialog.Close>
          {submitted ? (
            <div className="py-5 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-success/15 text-success">
                <Check className="size-6" />
              </span>
              <Dialog.Title className="mt-4 font-display text-xl font-semibold">Demo request recorded</Dialog.Title>
              <Dialog.Description className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                No payout was sent. A compliant backend and eligibility review are required before this can process real funds.
              </Dialog.Description>
              <Dialog.Close asChild>
                <Button className="mt-6">Return to payouts</Button>
              </Dialog.Close>
            </div>
          ) : (
            <>
              <Dialog.Title className="pr-12 font-display text-xl font-semibold">Request payout</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
                Frontend demo only. This form does not transfer funds or create a real request.
              </Dialog.Description>
              <form onSubmit={submit} className="mt-6 grid gap-4">
                <label className="grid gap-2 text-sm font-medium">
                  Amount
                  <Input type="number" min="100" max="2840" defaultValue="840" required />
                  <span className="text-xs font-normal text-muted-foreground">Available demo reward: $2,840.00</span>
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Payout method
                  <select className="h-11 rounded-tf-md border border-border bg-surface px-3 text-sm text-foreground" defaultValue="Bank transfer">
                    <option>Bank transfer</option>
                    <option>USDC</option>
                  </select>
                </label>
                <label className="flex items-start gap-3 rounded-tf-md border border-border bg-surface p-4 text-sm leading-5 text-muted-foreground">
                  <input type="checkbox" required className="mt-0.5 size-4 accent-[hsl(var(--primary))]" />
                  I understand this is a mock request and no funds will be processed.
                </label>
                <div className="mt-2 flex justify-end gap-3">
                  <Dialog.Close asChild><Button variant="ghost">Cancel</Button></Dialog.Close>
                  <Button type="submit">Submit demo request</Button>
                </div>
              </form>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function PayoutsWorkspace() {
  const [filter, setFilter] = useState<PayoutFilter>("All");
  const visible = useMemo(
    () => payouts.filter((payout) => filter === "All" || payout.status === filter),
    [filter],
  );
  const completed = payouts.filter((payout) => payout.status === "Completed");
  const paidTotal = completed.reduce((sum, payout) => sum + payout.amount, 0);

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Payouts"
        title="Payout centre"
        description="Review demo eligibility, payout methods, pending requests, and account history. No real payment processing is enabled."
        action={<RequestPayoutDialog />}
      />

      <section aria-label="Payout summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Available reward" value="$2,840.00" detail="Demo funded account" icon={CircleDollarSign} tone="primary" trend="up" compact />
        <MetricCard label="Next eligibility" value="28 Jul 2026" detail="4 calendar days" icon={CalendarClock} tone="warning" trend="flat" compact />
        <MetricCard label="Eligibility" value="Eligible soon" detail="All current risk rules met" icon={Clock3} tone="success" trend="flat" compact />
        <MetricCard label="Completed total" value={money(paidTotal)} detail={`${completed.length} demo records`} icon={Banknote} tone="success" trend="up" compact />
      </section>

      <div className="grid gap-6 xl:grid-cols-12">
        <SectionCard title="Eligibility status" description="Mock frontend calculation based on current demo data." className="xl:col-span-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-tf-md border border-success/20 bg-success/10 p-4">
              <p className="text-xs text-muted-foreground">Rule compliance</p>
              <p className="mt-2 text-sm font-semibold text-success">Requirements met</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">No active daily or overall loss breach.</p>
            </div>
            <div className="rounded-tf-md border border-border bg-surface p-4">
              <p className="text-xs text-muted-foreground">Next payout window</p>
              <p className="mt-2 text-sm font-semibold">28 July 2026</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Eligibility opens after the demo waiting period.</p>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-3 rounded-tf-md border border-warning/20 bg-warning/10 p-4">
            <Clock3 className="mt-0.5 size-5 shrink-0 text-warning" />
            <p className="text-sm leading-6 text-muted-foreground">
              Payout values and eligibility are illustrative. A compliant backend, identity checks, and manual review would be required in production.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Payout method" description="Primary demo disbursement profile." className="xl:col-span-5">
          <div className="flex items-center gap-4 rounded-tf-md border border-border bg-surface p-4">
            <span className="grid size-11 place-items-center rounded-tf-md bg-primary/10 text-primary">
              <Landmark className="size-5" />
            </span>
            <div>
              <p className="font-semibold">Bank transfer</p>
              <p className="mt-1 text-sm text-muted-foreground">Barclays · ending 4821</p>
            </div>
            <StatusBadge tone="success">Verified demo</StatusBadge>
          </div>
          <Button type="button" variant="outline" className="mt-4 w-full">Manage demo method</Button>
        </SectionCard>
      </div>

      <SectionCard
        title="Payout history"
        description="Pending, completed, and rejected demo requests."
        action={
          <div className="flex rounded-tf-sm border border-border bg-surface p-1" aria-label="Filter payouts">
            {payoutTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                aria-pressed={filter === tab}
                className={`min-h-8 rounded px-3 text-xs font-semibold ${
                  filter === tab ? "bg-primary-solid text-primary-solid-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        }
        contentClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-border bg-white/[.02] text-xs text-muted-foreground">
              <tr>
                {["Reference", "Requested", "Processed", "Method", "Amount", "Status", "Note"].map((heading) => (
                  <th key={heading} className="px-5 py-3 font-medium">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((payout) => (
                <tr key={payout.id} className="border-b border-border/70 last:border-0 hover:bg-white/[.025]">
                  <td className="px-5 py-4 font-semibold text-foreground">{payout.reference}</td>
                  <td className="px-5 py-4 text-muted-foreground">{payout.requestedAt}</td>
                  <td className="px-5 py-4 text-muted-foreground">{payout.processedAt}</td>
                  <td className="px-5 py-4 text-muted-foreground">{payout.method}</td>
                  <td className="px-5 py-4 font-semibold">{money(payout.amount)}</td>
                  <td className="px-5 py-4"><StatusBadge tone={statusTone(payout.status)}>{payout.status}</StatusBadge></td>
                  <td className="max-w-xs px-5 py-4 text-muted-foreground">{payout.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
