import type { LucideIcon } from "lucide-react";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  active?: boolean;
};

export type Metric = {
  label: string;
  value: string;
  detail: string;
  tone: "neutral" | "positive" | "warning" | "danger";
};

export type ActivityItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  kind: "trade" | "milestone" | "payout";
};
