"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { adminSetPayoutStatus } from "@/features/payouts/payout-service";
import { setChallengePlanActive } from "@/features/admin/admin-service";
import { reconcileAdminPayment } from "@/features/admin/admin-service";

export function AdminPayoutActions({ payoutId, status }: { payoutId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function transition(nextStatus: string, reference?: string) {
    setBusy(true);
    try {
      await adminSetPayoutStatus(payoutId, nextStatus, reference);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }
  if (status !== "pending" && status !== "approved" && status !== "processing") return null;
  function settle() {
    const reference = window.prompt("Enter the real payout settlement reference:");
    if (reference?.trim()) void transition("paid", reference.trim());
  }
  return <div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void transition("approved")}>Approve</Button><Button type="button" size="sm" variant="danger" disabled={busy} onClick={() => void transition("rejected")}>Reject</Button>{status === "approved" && <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void transition("processing")}>Mark processing</Button>}{status === "processing" && <Button type="button" size="sm" variant="outline" disabled={busy} onClick={settle}>Mark settled</Button>}</div>;
}

export function AdminPlanToggle({ planId, isActive }: { planId: string; isActive: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return <Button type="button" size="sm" variant="outline" disabled={busy} onClick={async () => { setBusy(true); try { await setChallengePlanActive(planId, !isActive); router.refresh(); } finally { setBusy(false); } }}>{isActive ? "Disable" : "Enable"}</Button>;
}

export function AdminReconcilePayment({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function reconcile() { setBusy(true); try { await reconcileAdminPayment(orderId); router.refresh(); } finally { setBusy(false); } }
  return <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void reconcile()}>{busy ? "Checking..." : "Reconcile payment"}</Button>;
}