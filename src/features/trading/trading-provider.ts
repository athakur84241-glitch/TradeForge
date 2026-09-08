export type TradingAccountSnapshot = {
  balance: string;
  equity: string;
  providerAccountId: string;
  provider: string;
};

export type TradingAccountProvision = {
  providerAccountId: string;
  platform: string;
  status: "active";
};

export type ProviderTrade = {
  externalTradeId: string;
  symbol: string;
  side: "buy" | "sell";
  volume: string;
  entryPrice: string;
  exitPrice: string | null;
  profit: string;
  commission: string;
  swap: string;
  openedAt: string;
  closedAt: string | null;
};

export type ProviderPosition = {
  externalPositionId: string;
  symbol: string;
  side: "buy" | "sell";
  volume: string;
  entryPrice: string;
  currentPrice: string | null;
  unrealizedProfit: string;
  openedAt: string;
};

export interface TradingProvider {
  readonly name: string;
  createAccount(input: { userId: string; accountSize: string; phase: string }): Promise<TradingAccountProvision>;
  disableAccount(providerAccountId: string): Promise<void>;
  getAccount(providerAccountId: string): Promise<TradingAccountSnapshot>;
  getBalance(providerAccountId: string): Promise<string>;
  getEquity(providerAccountId: string): Promise<string>;
  getPositions(providerAccountId: string): Promise<ProviderPosition[]>;
  getTrades(providerAccountId: string): Promise<ProviderTrade[]>;
  getDailyMetrics(providerAccountId: string): Promise<{ metricDate: string; dailyPnl: string; tradingDay: boolean }[]>;
}

export class UnavailableTradingProvider implements TradingProvider {
  readonly name = "unconfigured";
  private unavailable(): never {
    throw new Error("Trading integration is not configured.");
  }
  createAccount(): Promise<TradingAccountProvision> { return Promise.reject(this.unavailable()); }
  disableAccount(): Promise<void> { return Promise.reject(this.unavailable()); }
  getAccount(): Promise<TradingAccountSnapshot> { return Promise.reject(this.unavailable()); }
  getBalance(): Promise<string> { return Promise.reject(this.unavailable()); }
  getEquity(): Promise<string> { return Promise.reject(this.unavailable()); }
  getPositions(): Promise<ProviderPosition[]> { return Promise.reject(this.unavailable()); }
  getTrades(): Promise<ProviderTrade[]> { return Promise.reject(this.unavailable()); }
  getDailyMetrics(): Promise<{ metricDate: string; dailyPnl: string; tradingDay: boolean }[]> { return Promise.reject(this.unavailable()); }
}

export function getTradingProvider(): TradingProvider {
  if (process.env.TRADING_PROVIDER === "configured" && process.env.TRADING_PROVIDER_API_KEY) {
    throw new Error("A production trading provider adapter must be implemented before enabling TRADING_PROVIDER=configured.");
  }
  return new UnavailableTradingProvider();
}