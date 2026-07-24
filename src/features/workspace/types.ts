export type Tone = "neutral" | "primary" | "success" | "warning" | "danger";

export type AccountCategory = "Evaluation" | "Funded" | "Passed" | "Failed" | "Archived";

export type Account = {
  id: string;
  name: string;
  size: number;
  category: AccountCategory;
  status: "Active" | "Funded" | "Passed" | "Failed" | "Archived";
  phase: "Phase 1" | "Phase 2" | "Funded" | "Complete";
  balance: number;
  equity: number;
  pnl: number;
  pnlPercent: number;
  platform: string;
  createdAt: string;
  lastActivity: string;
  health: "Good standing" | "Review" | "Closed";
};

export type Challenge = {
  id: string;
  name: string;
  accountId: string;
  size: number;
  phase: "Phase 1" | "Phase 2" | "Funded";
  status: "Active" | "Passed" | "Failed";
  currentBalance: number;
  profit: number;
  profitTarget: number;
  dailyLossUsed: number;
  dailyLossLimit: number;
  overallLossUsed: number;
  overallLossLimit: number;
  tradingDays: number;
  minimumTradingDays: number;
  progress: number;
  nextMilestone: string;
};

export type ChallengeModel = {
  id: string;
  name: string;
  description: string;
  phases: number;
  profitTarget: string;
  dailyLossLimit: string;
  overallLossLimit: string;
  tradingDays: string;
  sizes: number[];
  recommended?: boolean;
};

export type Payout = {
  id: string;
  reference: string;
  requestedAt: string;
  processedAt: string;
  amount: number;
  method: "Bank transfer" | "USDC";
  status: "Pending" | "Completed" | "Rejected";
  note: string;
};

export type LeaderboardTrader = {
  id: string;
  rank: number;
  alias: string;
  country: string;
  accountSize: number;
  weeklyReturn: number;
  monthlyReturn: number;
  winRate: number;
  profitFactor: number;
  badge: "Consistent" | "Risk control" | "Momentum" | "Breakout";
};

export type WorkspaceNotification = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: "Account" | "Rule alert" | "Payout" | "Challenge" | "System";
  unread: boolean;
  href: string;
};

export type SearchResult = {
  id: string;
  title: string;
  description: string;
  type: "Account" | "Challenge" | "Payout" | "Help";
  href: string;
  keywords: string[];
};

export type ActivityEvent = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "Trade" | "Challenge" | "Account" | "Payout" | "System";
};

export type Trade = {
  id: string;
  symbol: string;
  side: "Buy" | "Sell";
  closedAt: string;
  pnl: number;
  riskReward: number;
  duration: string;
};

export type ChartPoint = {
  date: string;
  balance: number;
  equity: number;
};
