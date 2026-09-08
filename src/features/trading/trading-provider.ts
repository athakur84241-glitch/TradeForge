export type TradingAccountSnapshot = {
  balance: string;
  equity: string;
  providerAccountId: string;
  provider: string;
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
  getAccountSnapshot(providerAccountId: string): Promise<TradingAccountSnapshot>;
  getClosedTrades(providerAccountId: string): Promise<ProviderTrade[]>;
  getOpenPositions(providerAccountId: string): Promise<ProviderPosition[]>;
}

export class UnavailableTradingProvider implements TradingProvider {
  readonly name = "unconfigured";
  private unavailable(): never {
    throw new Error("Trading integration is not configured.");
  }
  getAccountSnapshot(): Promise<TradingAccountSnapshot> { return Promise.reject(this.unavailable()); }
  getClosedTrades(): Promise<ProviderTrade[]> { return Promise.reject(this.unavailable()); }
  getOpenPositions(): Promise<ProviderPosition[]> { return Promise.reject(this.unavailable()); }
}

export function getTradingProvider(): TradingProvider {
  if (process.env.TRADING_PROVIDER === "configured" && process.env.TRADING_PROVIDER_API_KEY) {
    throw new Error("A production trading provider adapter must be implemented before enabling TRADING_PROVIDER=configured.");
  }
  return new UnavailableTradingProvider();
}