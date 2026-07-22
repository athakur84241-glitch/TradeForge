import {
  CircleDollarSign,
  Crown,
  LayoutDashboard,
  Medal,
  Settings,
  ShieldCheck,
  Trophy,
  UserRound,
} from "lucide-react";
import type { ActivityItem, Metric, NavigationItem } from "./types";

export const navigationItems: NavigationItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, active: true },
  { label: "Challenges", href: "/challenges", icon: Trophy },
  { label: "Accounts", href: "/accounts", icon: CircleDollarSign },
  { label: "Payouts", href: "/payouts", icon: Crown },
  { label: "Leaderboard", href: "/leaderboard", icon: Medal },
  { label: "Profile", href: "/profile", icon: UserRound },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const dashboardMetrics: Metric[] = [
  { label: "Balance", value: "$104,260.80", detail: "Live account equity", tone: "neutral" },
  { label: "Profit", value: "+$4,260.80", detail: "+4.26% since start", tone: "positive" },
  { label: "Profit target", value: "68%", detail: "$1,739.20 remaining", tone: "warning" },
  { label: "Daily drawdown", value: "1.18%", detail: "$3,821.40 available", tone: "neutral" },
  { label: "Overall drawdown", value: "2.64%", detail: "$7,359.20 available", tone: "neutral" },
  { label: "Trading days", value: "9 / 10", detail: "One day to minimum", tone: "positive" },
];

export const recentActivities: ActivityItem[] = [
  { id: "activity-1", title: "EUR/USD position closed", description: "+$480.00 realised profit", timestamp: "14 minutes ago", kind: "trade" },
  { id: "activity-2", title: "Trading day recorded", description: "9 of 10 minimum trading days complete", timestamp: "Yesterday", kind: "milestone" },
  { id: "activity-3", title: "Payout profile verified", description: "Your payout details are ready when eligible", timestamp: "18 Jul 2026", kind: "payout" },
];

export const accountSummary = {
  name: "Apex Evaluation 100K",
  accountId: "TF-82104",
  phase: "Phase 2",
  status: "Active",
  balance: "$104,260.80",
  initialBalance: "$100,000.00",
  platform: "TradeLocker",
  verified: true,
  complianceLabel: "Trading parameters in good standing",
};

export const challengeProgress = {
  title: "Your evaluation is on track",
  description: "Complete the remaining objective while keeping your risk limits protected.",
  completed: 68,
  items: [
    { label: "Profit target", value: "$4,260.80 of $6,000", progress: 71, state: "In progress" },
    { label: "Minimum trading days", value: "9 of 10 days", progress: 90, state: "Almost there" },
    { label: "Daily drawdown", value: "1.18% of 5.00%", progress: 24, state: "Protected" },
  ],
};

export const trustNote = { icon: ShieldCheck, label: "Account health", value: "Good standing" };
