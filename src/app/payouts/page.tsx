import type { Metadata } from "next";
import { PayoutsWorkspace } from "@/features/payouts/payouts-workspace";

export const metadata: Metadata = {
  title: "Payouts",
};

export default function Page() {
  return <PayoutsWorkspace />;
}
