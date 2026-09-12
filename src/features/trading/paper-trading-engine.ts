export type PaperSide = "buy" | "sell";
export type PaperPositionStatus = "open" | "closed";

export type PaperPosition = {
  id: string;
  accountId: string;
  symbol: string;
  side: PaperSide;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number | null;
  takeProfit: number | null;
  unrealizedPnl: number;
  status: PaperPositionStatus;
  openedAt: string;
  closedAt: string | null;
  closeReason: string | null;
};

export function calculatePnl(position: Pick<PaperPosition, "side" | "entryPrice" | "currentPrice" | "quantity">) {
  const delta = position.side === "buy"
    ? position.currentPrice - position.entryPrice
    : position.entryPrice - position.currentPrice;
  return Number((delta * position.quantity).toFixed(8));
}

export function shouldClose(position: PaperPosition, price: number) {
  if (position.side === "buy") {
    if (position.stopLoss !== null && price <= position.stopLoss) return "stop_loss";
    if (position.takeProfit !== null && price >= position.takeProfit) return "take_profit";
  } else {
    if (position.stopLoss !== null && price >= position.stopLoss) return "stop_loss";
    if (position.takeProfit !== null && price <= position.takeProfit) return "take_profit";
  }
  return null;
}

export function updatePosition(position: PaperPosition, price: number, now = new Date().toISOString()): PaperPosition {
  if (position.status === "closed") return position;
  const currentPrice = Number(price.toFixed(8));
  const unrealizedPnl = calculatePnl({ ...position, currentPrice });

  const closeReason = shouldClose(position, currentPrice);
  if (!closeReason) return { ...position, currentPrice, unrealizedPnl };

  return {
    ...position,
    currentPrice,
    unrealizedPnl,
    status: "closed",
    closedAt: now,
    closeReason,
  };
}

export function closePosition(position: PaperPosition, price: number, reason: "manual" | "stop_loss" | "take_profit", now = new Date().toISOString()): PaperPosition {
  if (position.status === "closed") return position;
  const currentPrice = Number(price.toFixed(8));
  return { ...position, currentPrice, unrealizedPnl: calculatePnl({ ...position, currentPrice }), status: "closed", closedAt: now, closeReason: reason };
}

export function createPaperPosition(input: {
  accountId: string;
  symbol: string;
  side: PaperSide;
  quantity: number;
  entryPrice: number;
  stopLoss: number | null;
  takeProfit: number | null;
}) : PaperPosition {
  const openedAt = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    accountId: input.accountId,
    symbol: input.symbol,
    side: input.side,
    quantity: Number(input.quantity.toFixed(8)),
    entryPrice: Number(input.entryPrice.toFixed(8)),
    currentPrice: Number(input.entryPrice.toFixed(8)),
    stopLoss: input.stopLoss === null ? null : Number(input.stopLoss.toFixed(8)),
    takeProfit: input.takeProfit === null ? null : Number(input.takeProfit.toFixed(8)),
    unrealizedPnl: 0,
    status: "open",
    openedAt,
    closedAt: null,
    closeReason: null,
  };
}
