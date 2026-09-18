"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { adminSetPayoutStatus } from "@/features/payouts/payout-service";
import { setChallengePlanActive } from "@/features/admin/admin-service";
import { reconcileAdminPayment } from "@/features/admin/admin-service";

export function AdminPayoutActions({
  payoutId,
  status,
}: {
  payoutId: string;
  status: string;
}) {
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

  function settle() {
    const reference = window.prompt(
      "Enter the real payout settlement reference:"
    );

    if (reference?.trim()) {
      void transition("paid", reference.trim());
    }
  }

  if (status === "pending") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => void transition("approved")}
        >
          Approve
        </Button>

        <Button
          type="button"
          size="sm"
          variant="danger"
          disabled={busy}
          onClick={() => void transition("rejected")}
        >
          Reject
        </Button>
      </div>
    );
  }

  if (status === "approved") {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={() => void transition("processing")}
      >
        Mark processing
      </Button>
    );
  }

  if (status === "processing") {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={settle}
      >
        Mark settled
      </Button>
    );
  }

  return null;
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