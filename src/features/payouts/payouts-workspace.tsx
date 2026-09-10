"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
import { supabase } from "@/lib/supabase";
import { requestPayout } from "@/features/payouts/payout-service";

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

function RequestPayoutDialog({
  onSubmitted,
  disabled = false,
}: {
  onSubmitted: () => void;
  disabled?: boolean;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
const [submitError, setSubmitError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  try {
    setSubmitting(true);
    setSubmitError(null);

    const formData = new FormData(event.currentTarget);

    const amount = Number(formData.get("amount"));
    const method = String(formData.get("method"));

    if (!amount || amount < 100) {
      throw new Error("Minimum payout amount is $100.");
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error("You must be logged in.");

    // Get a funded account belonging to this user.
    const { data: account, error: accountError } = await supabase
  .from("accounts")
  .select("id, account_name, status, user_id, provider_account_id")
  .eq("user_id", user.id)
  .eq("status", "funded")
  .maybeSingle();


if (accountError) throw accountError;

if (!account) {
  throw new Error("Funded account was not found for this user.");
}

    await requestPayout(account.id, String(amount), method);

    setSubmitted(true);
    onSubmitted();
  } catch (error: unknown) {
  console.error("Failed to submit payout:", error);

  const message =
    error instanceof Error ? error.message : "Failed to submit payout.";

  setSubmitError(message);
} finally {
    setSubmitting(false);
  }
}
  return (
    <Dialog.Root onOpenChange={(open) => !open && setSubmitted(false)}>
      <Dialog.Trigger asChild>
        <Button disabled={disabled}>
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
              <Dialog.Title className="mt-4 font-display text-xl font-semibold">  Payout request submitted</Dialog.Title>
              <Dialog.Description className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                Your payout request has been submitted and is now pending review.
              </Dialog.Description>
              <Dialog.Close asChild>
                <Button className="mt-6">Return to payouts</Button>
              </Dialog.Close>
            </div>
          ) : (
            <>
              <Dialog.Title className="pr-12 font-display text-xl font-semibold">Request payout</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
                 Submit a payout request using your available payout balance. Requests are subject to eligibility and review.
              </Dialog.Description>
              <form onSubmit={submit} className="mt-6 grid gap-4">
                <label className="grid gap-2 text-sm font-medium">
                  Amount
                  <Input
  name="amount"
  type="number"
  min="100"
  defaultValue=""
  required
/>
                  
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Payout method
                  <select
  name="method"
  className="h-11 rounded-tf-md border border-border bg-surface px-3 text-sm text-foreground"
  defaultValue="USDC"
>
                    <option>USDC</option>
                  </select>
                </label>
                <div className="mt-2 flex justify-end gap-3">
                  <Dialog.Close asChild><Button variant="ghost">Cancel</Button></Dialog.Close>
                  <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit payout request"}
</Button>
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
  const [payouts, setPayouts] = useState<Payout[]>([]);
const [loading, setLoading] = useState(true);
const [fetchError, setFetchError] = useState<string | null>(null);
const [fundedAccount, setFundedAccount] = useState<{
  id: string;
  account_name: string;
  status: string;
  balance: number;
  equity: number;
  starting_balance: number;
  provider_account_id: string | null;
} | null>(null);

const [eligibilityLoading, setEligibilityLoading] = useState(true);
const [eligibilityError, setEligibilityError] = useState<string | null>(null);

useEffect(() => {
  let mounted = true;

  async function loadPayouts() {
    setLoading(true);
    setFetchError(null);


    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;

      const user = userData.user;
      if (!user) {
  if (mounted) {
    setPayouts([]);
    setFundedAccount(null);
    setEligibilityLoading(false);
  }
  return;
}

const { data: account, error: accountError } = await supabase
  .from("accounts")
  .select("id, account_name, status, balance, equity, starting_balance, provider_account_id")
  .eq("user_id", user.id)
  .eq("status", "funded")
  .maybeSingle();

if (accountError) throw accountError;

if (mounted) {
  setFundedAccount(account);
  setEligibilityLoading(false);
}

     const payoutQuery = supabase
  .from("payout_requests")
  .select(
    "id, user_id, account_id, requested_amount, method, status, requested_at, processed_at, note"
  )
  .eq("user_id", user.id)
  .order("requested_at", { ascending: false });

const { data, error } = await payoutQuery;


      if (error) throw error;

      const mapped: Payout[] = (data ?? []).map((row) => ({
        id: row.id,
        reference: `#${row.id.slice(0, 8).toUpperCase()}`,
        requestedAt: new Date(row.requested_at).toLocaleDateString("en-GB"),
        processedAt: row.processed_at
          ? new Date(row.processed_at).toLocaleDateString("en-GB")
          : "—",
        method: row.method,
        amount: Number(row.requested_amount),
        status: row.status === "paid" ? "Completed" : row.status === "rejected" ? "Rejected" : "Pending",
        note: row.note ?? "—",
      }));

      if (mounted) setPayouts(mapped);
    } catch (error: unknown) {
  const supabaseError =
    error && typeof error === "object"
      ? error as {
          message?: string;
          code?: string;
          details?: string;
          hint?: string;
        }
      : {};

  const errorMessage = JSON.stringify({
    message: supabaseError.message,
    code: supabaseError.code,
    details: supabaseError.details,
    hint: supabaseError.hint,
  });

  console.error("PAYOUT_ERROR", errorMessage);

  if (mounted) {
    setFetchError(supabaseError.message ?? "Failed to load payouts");
  }
}finally {
      if (mounted) setLoading(false);
    }
  }

  loadPayouts();

  return () => {
    mounted = false;
  };
}, []);
  const [filter, setFilter] = useState<PayoutFilter>("All");
  const visible = useMemo(
  () => payouts.filter((payout) => filter === "All" || payout.status === filter),
  [payouts, filter],
);
  const completed = payouts.filter((payout) => payout.status === "Completed");
  const paidTotal = completed.reduce((sum, payout) => sum + payout.amount, 0);
  const availableReward = fundedAccount
    ? fundedAccount.provider_account_id
      ? Math.max(0, fundedAccount.equity - fundedAccount.starting_balance)
      : 0
  : 0;

const payoutEligible =
  Boolean(fundedAccount?.provider_account_id) &&
  fundedAccount!.status === "funded" &&
  availableReward >= 100;

const eligibilityText = eligibilityLoading
  ? "Checking..."
  : eligibilityError
    ? "Unable to verify"
    : payoutEligible
      ? "Eligible"
      : "Not eligible";

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Payouts"
        title="Payout centre"
        description="Review eligibility, payout methods, pending requests, and account history. Settlement remains subject to administrative review."
        action={
  <RequestPayoutDialog
    disabled={!payoutEligible}
    onSubmitted={() => {
      window.location.reload();
    }}
  />
}
      />

      <section aria-label="Payout summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
       <MetricCard
  label="Available reward"
  value={
    fundedAccount?.provider_account_id
      ? money(Math.max(0, fundedAccount.equity - fundedAccount.starting_balance))
      : "—"
  }
  detail={
    eligibilityLoading
      ? "Loading funded account"
      : fundedAccount
        ? "Based on your funded account"
        : "No funded account found"
  }
  icon={CircleDollarSign}
  tone="primary"
  trend="flat"
  compact
/>
       <MetricCard
  label="Next eligibility"
  value={
    eligibilityLoading
      ? "Checking..."
      : payoutEligible
        ? "Eligible now"
        : "Not eligible"
  }
  detail={
    eligibilityLoading
      ? "Reviewing funded account"
      : payoutEligible
        ? "Current payout requirements met"
        : "Minimum payout requirements not met"
  }
  icon={CalendarClock}
  tone={payoutEligible ? "success" : "warning"}
  trend="flat"
  compact
/>

<MetricCard
  label="Eligibility"
  value={
    eligibilityLoading
      ? "Checking..."
      : payoutEligible
        ? "Eligible"
        : "Not eligible"
  }
  detail={
    eligibilityLoading
      ? "Checking account rules"
      : payoutEligible
        ? "Current account rules met"
        : "Account requirements not met"
  }
  icon={Clock3}
  tone={payoutEligible ? "success" : "warning"}
  trend="flat"
  compact
/>
        <MetricCard label="Completed total" value={money(paidTotal)} detail={`${completed.length} settled requests`} icon={Banknote} tone="success" trend="up" compact />
      </section>

      <div className="grid gap-6 xl:grid-cols-12">
        <SectionCard title="Eligibility status" description="Your current payout eligibility based on account rules." className="xl:col-span-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-tf-md border border-border bg-surface p-4">
  <p className="text-xs text-muted-foreground">Rule compliance</p>
  <p className="mt-2 text-sm font-semibold">
  {eligibilityLoading
  ? "Checking account status"
  : payoutEligible
    ? "Requirements met"
    : "Requirements not met"}
  </p>
  <p className="mt-2 text-sm leading-6 text-muted-foreground">
   {eligibilityLoading
  ? "Payout eligibility is being checked against your funded account."
  : payoutEligible
    ? "Your funded account currently meets the payout requirements."
    : "Your funded account does not currently meet the payout requirements."}
  </p>
</div>
            <div className="rounded-tf-md border border-border bg-surface p-4">
  <p className="text-xs text-muted-foreground">Next payout window</p>
  <p className="mt-2 text-sm font-semibold">{eligibilityLoading
  ? "Calculating..."
  : payoutEligible
    ? "Available for request"
    : "Not available yet"}</p>
  <p className="mt-2 text-sm leading-6 text-muted-foreground">
    {eligibilityLoading
  ? "Checking your funded account eligibility."
  : payoutEligible
    ? "Your account is currently eligible to request a payout."
    : "Your account must meet the payout requirements before requesting a payout."}
  </p>
</div>
          </div>
          <div className="mt-4 flex items-start gap-3 rounded-tf-md border border-warning/20 bg-warning/10 p-4">
            <Clock3 className="mt-0.5 size-5 shrink-0 text-warning" />
            <p className="text-sm leading-6 text-muted-foreground">
               Payout requests are subject to TradeForge eligibility rules and review.
            </p>
          </div>
        </SectionCard>

        <SectionCard
  title="Payout method"
  description="Select an available payout method when submitting a request."
  className="xl:col-span-5"
>
  <div className="rounded-tf-md border border-border bg-surface p-4">
    <div className="flex items-center gap-4">
      <span className="grid size-11 place-items-center rounded-tf-md bg-primary/10 text-primary">
        <Landmark className="size-5" />
      </span>

      <div>
        <p className="font-semibold">USDC</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Available for payout requests
        </p>
      </div>

      <StatusBadge tone="success">Available</StatusBadge>
    </div>
  </div>
</SectionCard>
      </div>

      <SectionCard
        title="Payout history"
        description="Pending, completed, and rejected payout requests."
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
  {loading ? (
    <tr>
      <td
        colSpan={7}
        className="px-5 py-10 text-center text-sm text-muted-foreground"
      >
        Loading payout history...
      </td>
    </tr>
  ) : fetchError ? (
    <tr>
      <td
        colSpan={7}
        className="px-5 py-10 text-center"
      >
        <p className="text-sm font-semibold text-danger">
          Unable to load payout history
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          {fetchError}
        </p>
      </td>
    </tr>
  ) : visible.length === 0 ? (
    <tr>
      <td
        colSpan={7}
        className="px-5 py-10 text-center"
      >
        <p className="text-sm font-semibold">
          No payout requests found
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          Your payout requests will appear here once submitted.
        </p>
      </td>
    </tr>
  ) : (
    visible.map((payout) => (
      <tr
        key={payout.id}
        className="border-b border-border/70 last:border-0 hover:bg-white/[.025]"
      >
        <td className="px-5 py-4 font-semibold text-foreground">
          {payout.reference}
        </td>

        <td className="px-5 py-4 text-muted-foreground">
          {payout.requestedAt}
        </td>

        <td className="px-5 py-4 text-muted-foreground">
          {payout.processedAt}
        </td>

        <td className="px-5 py-4 text-muted-foreground">
          {payout.method}
        </td>

        <td className="px-5 py-4 font-semibold">
          {money(payout.amount)}
        </td>

        <td className="px-5 py-4">
          <StatusBadge tone={statusTone(payout.status)}>
            {payout.status}
          </StatusBadge>
        </td>

        <td className="max-w-xs px-5 py-4 text-muted-foreground">
          {payout.note}
        </td>
      </tr>
    ))
  )}
</tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
