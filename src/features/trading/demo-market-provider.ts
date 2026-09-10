export const DEMO_TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H", "1D"] as const;
export type DemoTimeframe = (typeof DEMO_TIMEFRAMES)[number];

export const DEMO_INSTRUMENTS = [
  { symbol: "XAUUSD", name: "Gold / US Dollar", basePrice: 2350 },
  { symbol: "US30", name: "Dow Jones", basePrice: 39000 },
  { symbol: "NAS100", name: "Nasdaq 100", basePrice: 18000 },
  { symbol: "USOIL", name: "WTI Crude Oil", basePrice: 78 },
  { symbol: "EURUSD", name: "Euro / US Dollar", basePrice: 1.085 },
  { symbol: "GBPUSD", name: "Pound / US Dollar", basePrice: 1.27 },
  { symbol: "USDJPY", name: "US Dollar / Yen", basePrice: 149.5 },
] as const;
export type DemoInstrument = (typeof DEMO_INSTRUMENTS)[number];

export type DemoCandle = { time: number; open: number; high: number; low: number; close: number };
type PriceListener = (price: number, candle: DemoCandle) => void;
type ConnectionListener = (state: "connected" | "reconnecting" | "disconnected") => void;
type SymbolState = { price: number; tick: number; history: DemoCandle[]; listeners: Set<PriceListener>; connectionListeners: Set<ConnectionListener>; timer: number | null };

export const timeframeSeconds: Record<DemoTimeframe, number> = { "1m": 60, "5m": 300, "15m": 900, "1H": 3600, "4H": 14400, "1D": 86400 };

function hashSeed(value: string) {
  let seed = 2166136261;
  for (const character of value) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619);
  return seed >>> 0;
}

function seededNoise(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

function startOfMinute(timestamp: number) { return Math.floor(timestamp / 60) * 60; }
function instrument(symbol: string) { return DEMO_INSTRUMENTS.find((item) => item.symbol === symbol) ?? DEMO_INSTRUMENTS[0]; }

function createHistory(symbol: string, count = 5000) {
  const definition = instrument(symbol);
  const seed = hashSeed(symbol);
  const candles: DemoCandle[] = [];
  let price: number = definition.basePrice;
  const now = startOfMinute(Math.floor(Date.now() / 1000));
  const volatility = definition.basePrice * 0.0004;
  for (let index = count; index >= 0; index -= 1) {
    const time = now - index * 60;
    const open = price;
    const close = Math.max(0.0001, open + seededNoise(seed + index) * volatility);
    candles.push({ time, open, close, high: Math.max(open, close) + Math.abs(seededNoise(seed + index + 17) * volatility), low: Math.max(0.0001, Math.min(open, close) - Math.abs(seededNoise(seed + index + 31) * volatility)) });
    price = close;
  }
  return candles;
}

function aggregate(candles: DemoCandle[], timeframe: DemoTimeframe, count: number) {
  const interval = timeframeSeconds[timeframe];
  const grouped: DemoCandle[] = [];
  for (const candle of candles) {
    const time = Math.floor(candle.time / interval) * interval;
    const previous = grouped[grouped.length - 1];
    if (!previous || previous.time !== time) grouped.push({ time, open: candle.open, high: candle.high, low: candle.low, close: candle.close });
    else grouped[grouped.length - 1] = { ...previous, high: Math.max(previous.high, candle.high), low: Math.min(previous.low, candle.low), close: candle.close };
  }
  return grouped.slice(-count);
}

export interface MarketDataProvider {
  getHistoricalCandles(symbol: string, timeframe: DemoTimeframe, count?: number): DemoCandle[];
  getCurrentPrice(symbol: string): number;
  subscribe(symbol: string, onPrice: PriceListener, onConnection?: ConnectionListener): () => void;
}

export class DemoMarketProvider implements MarketDataProvider {
  private states = new Map<string, SymbolState>();

  private getState(symbol: string) {
    let state = this.states.get(symbol);
    if (!state) {
      const history = createHistory(symbol);
      state = { price: history.at(-1)?.close ?? instrument(symbol).basePrice, tick: 0, history, listeners: new Set(), connectionListeners: new Set(), timer: null };
      this.states.set(symbol, state);
    }
    return state;
  }

  getHistoricalCandles(symbol: string, timeframe: DemoTimeframe, count = 180) { return aggregate(this.getState(symbol).history, timeframe, count); }
  getCurrentPrice(symbol: string) { return this.getState(symbol).price; }

  subscribe(symbol: string, onPrice: PriceListener, onConnection?: ConnectionListener) {
    const state = this.getState(symbol);
    state.listeners.add(onPrice);
    if (onConnection) state.connectionListeners.add(onConnection);
    onConnection?.("connected");
    if (state.timer === null) state.timer = window.setInterval(() => this.emitTick(symbol), 250);
    return () => {
      state.listeners.delete(onPrice);
      if (onConnection) state.connectionListeners.delete(onConnection);
      if (state.listeners.size === 0 && state.timer !== null) { window.clearInterval(state.timer); state.timer = null; }
    };
  }

  private emitTick(symbol: string) {
    const state = this.getState(symbol);
    state.tick += 1;
    const definition = instrument(symbol);
    const volatility = definition.basePrice * 0.00004;
    state.price = Math.max(0.0001, state.price + Math.sin(state.tick / 37) * volatility * 0.5 + seededNoise(state.tick + hashSeed(symbol)) * volatility);
    const time = startOfMinute(Math.floor(Date.now() / 1000));
    const previous = state.history.at(-1);
    const candle = !previous || previous.time !== time
      ? { time, open: state.price, high: state.price, low: state.price, close: state.price }
      : { ...previous, high: Math.max(previous.high, state.price), low: Math.min(previous.low, state.price), close: state.price };
    if (!previous || previous.time !== time) state.history.push(candle);
    else state.history[state.history.length - 1] = candle;
    if (state.history.length > 6000) state.history.shift();
    for (const listener of state.listeners) listener(state.price, candle);
  }
}

export const demoMarketProvider = new DemoMarketProvider();
