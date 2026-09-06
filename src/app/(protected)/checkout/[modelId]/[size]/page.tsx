import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutPage } from "@/features/checkout/checkout-page";
import { getChallengePlan } from "@/features/challenges/challenge-catalogue";

export const metadata: Metadata = {
  title: "Checkout",
};

type PageProps = {
  params: Promise<{ modelId: string; size: string }>;
};

export default async function Page({ params }: PageProps) {
  const { modelId, size } = await params;
  const model = await getChallengePlan(modelId, Number(size));

  if (!model) notFound();

  return <CheckoutPage model={model} />;
}