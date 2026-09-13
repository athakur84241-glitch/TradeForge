"use client";

import { useEffect, useRef, useState } from "react";
import { CandlestickSeries, ColorType, createChart, type IChartApi, type IPriceLine, type ISeriesApi, type UTCTimestamp } from "lightweight-charts";
import { CircleDot, RefreshCw, ShieldAlert, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/workspace/status-badge";
import { supabase } from "@/lib/supabase";
import { DEMO_INSTRUMENTS, demoMarketProvider, getInstrumentDefinition, type DemoTimeframe } from "./demo-market-provider";
import { closePosition, createPaperPosition, updatePosition, type PaperPosition, type PaperSide } from "./paper-trading-engine";

const timeframeLabels: Record<DemoTimeframe, string> = { "1m": "1m", "5m": "5m", "15m": "15m", "1H": "1H", "4H": "4H", "1D": "1D" };

type PositionRow = {
  id: string;
  user_id: string;
  account_id: string;
  symbol: string;
  side: PaperSide;
  quantity: number;
  entry_price: number;
  current_price: number;
  stop_loss: number | null;
  take_profit: number | null;
  unrealized_pnl: number;
  status: "open" | "closed";
  opened_at: string;
  closed_at: string | null;
  close_reason: string | null;
};

function formatPrice(value: number) {
  return value.toFixed(2);
}

function formatPnl(value: number) {
  return `${value >= 0 ? "+" : ""}$${value.toFixed(2)}`;
}

function rowToPosition(row: PositionRow): PaperPosition {
  return { ...row, accountId: row.account_id, entryPrice: Number(row.entry_price), currentPrice: Number(row.current_price), stopLoss: row.stop_loss === null ? null : Number(row.stop_loss), takeProfit: row.take_profit === null ? null : Number(row.take_profit), unrealizedPnl: Number(row.unrealized_pnl), openedAt: row.opened_at, closedAt: row.closed_at, closeReason: row.close_reason };
}

function positionToRow(position: PaperPosition, userId: string) {
  return {
    id: position.id,
    user_id: userId,
    account_id: position.accountId,
    symbol: position.symbol,
    side: position.side,
    quantity: position.quantity,
    entry_price: position.entryPrice,
    current_price: position.currentPrice,
    stop_loss: position.stopLoss,
    take_profit: position.takeProfit,
    unrealized_pnl: position.unrealizedPnl,
    status: position.status,
    opened_at: position.openedAt,
    closed_at: position.closedAt,
    close_reason: position.closeReason,
    updated_at: new Date().toISOString(),
  };
}

export function TradingTerminal({ accountId: initialAccountId = null }: { accountId?: string | null }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const positionLinesRef = useRef<IPriceLine[]>([]);
  const currentPriceLineRef = useRef<IPriceLine | null>(null);
  const timeframeRef = useRef<DemoTimeframe>("5m");
  const positionsRef = useRef<PaperPosition[]>([]);
  const persistTimerRef = useRef<number | null>(null);
  const [timeframe, setTimeframe] = useState<DemoTimeframe>("5m");
  const [symbol, setSymbol] = useState("XAUUSD");
  const [price, setPrice] = useState(() => demoMarketProvider.getCurrentPrice("XAUUSD"));
  const [accountId, setAccountId] = useState(initialAccountId);
  const [userId, setUserId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Array<{ id: string; name: string }>>([]);
  const [connection, setConnection] = useState<"connected" | "reconnecting" | "disconnected">("connected");
  const [positions, setPositions] = useState<PaperPosition[]>([]);
  const [quantity, setQuantity] = useState("1");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [message, setMessage] = useState("Paper environment only. No real orders are sent.");
  const [historicalVersion, setHistoricalVersion] = useState(0);
  const availableTimeframes = demoMarketProvider.getAvailableTimeframes(symbol);

  useEffect(() => {
    let active = true;
    async function loadHistoricalData() {
      const response = await fetch(`/api/market-data/historical?symbol=${symbol}`);
      if (!response.ok || !active) return;
      const dataset = await response.json() as { candles?: Array<{ time: number; open: number; high: number; low: number; close: number }>; timeframe?: DemoTimeframe };
      if (dataset.timeframe && dataset.candles?.length) {
        demoMarketProvider.registerDataset(symbol, dataset.candles, dataset.timeframe);
        setHistoricalVersion((version) => version + 1);
      }
      if (active) setTimeframe((current) => dataset.timeframe && current !== dataset.timeframe ? dataset.timeframe : current);
    }
    void loadHistoricalData();
    return () => { active = false; };
  }, [symbol]);

  useEffect(() => {
    if (!availableTimeframes.includes(timeframe)) setTimeframe(availableTimeframes[0] ?? "1D");
  }, [availableTimeframes, timeframe, historicalVersion]);

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (active) setUserId(user?.id ?? null);
    });
    if (initialAccountId) {
      setAccountId(initialAccountId);
      return () => { active = false; };
    }
    async function loadAccounts() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase.from("accounts").select("id, account_name").eq("user_id", user.id).order("created_at", { ascending: false });
      if (!active) return;
      const options = (data ?? []).map((row) => ({ id: row.id, name: row.account_name }));
      setAccounts(options);
      setAccountId((current) => current && options.some((item) => item.id === current) ? current : options[0]?.id ?? null);
    }
    void loadAccounts();
    return () => { active = false; };
  }, [initialAccountId]);

  function replacePositions(next: PaperPosition[]) {
    positionsRef.current = next;
    setPositions(next);
  }

  useEffect(() => {
    let active = true;
    async function loadPositions() {
      if (!accountId) {
        replacePositions([]);
        return;
      }
      setLoadingPositions(true);
      const { data, error } = await supabase.from("demo_positions").select("*").eq("account_id", accountId).order("opened_at", { ascending: false });
      if (!active) return;
      if (error) setMessage("Paper positions could not be restored. You can continue in this session.");
      replacePositions((data ?? []).map((row) => rowToPosition(row as PositionRow)));
      setLoadingPositions(false);
    }
    void loadPositions();
    return () => { active = false; };
  }, [accountId]);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: "#101418" }, textColor: "#9ca3af" },
      grid: { vertLines: { color: "#20262d" }, horzLines: { color: "#20262d" } },
      rightPriceScale: { borderColor: "#303841" }, timeScale: { borderColor: "#303841", timeVisible: true, secondsVisible: false },
      crosshair: { vertLine: { color: "#68727d" }, horzLine: { color: "#68727d" } },
      autoSize: true,
    });
    const series = chart.addSeries(CandlestickSeries, { upColor: "#26a69a", downColor: "#ef5350", borderVisible: false, wickUpColor: "#26a69a", wickDownColor: "#ef5350" });
    chartRef.current = chart;
    candleSeriesRef.current = series;
    return () => { chart.remove(); chartRef.current = null; candleSeriesRef.current = null; currentPriceLineRef.current = null; };
  }, []);

  useEffect(() => {
    timeframeRef.current = timeframe;
    const series = candleSeriesRef.current;
    const chart = chartRef.current;
    if (!series || !chart) return;
    const history = demoMarketProvider.getHistoricalCandles(symbol, timeframe, 180);
    series.setData(history.map((candle) => ({ ...candle, time: candle.time as UTCTimestamp })));
    chart.timeScale().fitContent();
    if (currentPriceLineRef.current) series.removePriceLine(currentPriceLineRef.current);
    currentPriceLineRef.current = series.createPriceLine({ price: demoMarketProvider.getCurrentPrice(symbol), color: "#fbbf24", lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: "Demo price" });
    positionLinesRef.current.forEach((line) => candleSeriesRef.current?.removePriceLine(line));
    positionLinesRef.current = [];
    setPrice(demoMarketProvider.getCurrentPrice(symbol));

  }, [timeframe, symbol]);

  useEffect(() => {
    const series = candleSeriesRef.current;
    if (!series) return;
    function schedulePersist(next: PaperPosition[]) {
      if (!accountId) return;
      if (persistTimerRef.current !== null) window.clearTimeout(persistTimerRef.current);
      persistTimerRef.current = window.setTimeout(async () => {
        for (const position of next.filter((item) => item.status === "closed")) {
          if (!userId) return;
          const { error } = await supabase.from("demo_positions").update(positionToRow(position, userId)).eq("id", position.id).eq("account_id", accountId).eq("user_id", userId).eq("status", "open");
          if (error) setMessage("A paper position changed locally but could not be persisted.");
        }
      }, 500);
    }

    const unsubscribe = demoMarketProvider.subscribe(symbol, (nextPrice, candle) => {
      setPrice(nextPrice);
      const selectedCandle = demoMarketProvider.getHistoricalCandles(symbol, timeframeRef.current, 1)[0] ?? candle;
      series.update({ ...selectedCandle, time: selectedCandle.time as UTCTimestamp });
      currentPriceLineRef.current?.applyOptions({ price: nextPrice });
      const updated = positionsRef.current.map((position) => position.symbol === symbol ? updatePosition(position, nextPrice) : position);
      const hasClosed = updated.some((position, index) => position.status !== positionsRef.current[index]?.status);
      replacePositions(updated);
      if (hasClosed) schedulePersist(updated);
    }, setConnection);

    function handleVisibility() {
      setConnection(document.visibilityState === "visible" ? "reconnecting" : "disconnected");
      if (document.visibilityState === "visible") window.setTimeout(() => setConnection("connected"), 150);
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      unsubscribe();
    };
  }, [symbol, accountId, userId]);

  useEffect(() => {
    const series = candleSeriesRef.current;
    if (!series) return;
    positionLinesRef.current.forEach((line) => series.removePriceLine(line));
    positionLinesRef.current = [];
    for (const position of positions.filter((item) => item.status === "open")) {
      positionLinesRef.current.push(series.createPriceLine({ price: position.entryPrice, color: "#60a5fa", lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: `${position.side.toUpperCase()} entry` }));
      if (position.stopLoss !== null) positionLinesRef.current.push(series.createPriceLine({ price: position.stopLoss, color: "#ef5350", lineWidth: 1, lineStyle: 1, axisLabelVisible: true, title: "SL" }));
      if (position.takeProfit !== null) positionLinesRef.current.push(series.createPriceLine({ price: position.takeProfit, color: "#26a69a", lineWidth: 1, lineStyle: 1, axisLabelVisible: true, title: "TP" }));
    }
  }, [positions]);

  async function openPosition(side: PaperSide) {
    if (!accountId) return setMessage("Select a TradeForge account before opening a paper position.");
    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) return setMessage("Quantity must be greater than zero.");
    const parsedStop = stopLoss ? Number(stopLoss) : null;
    const parsedTarget = takeProfit ? Number(takeProfit) : null;
    if (parsedStop !== null && !Number.isFinite(parsedStop)) return setMessage("Stop loss must be a valid price.");
    if (parsedTarget !== null && !Number.isFinite(parsedTarget)) return setMessage("Take profit must be a valid price.");
    if ((side === "buy" && parsedStop !== null && parsedStop >= price) || (side === "sell" && parsedStop !== null && parsedStop <= price)) return setMessage("Stop loss must be below the entry for buys and above it for sells.");
    if ((side === "buy" && parsedTarget !== null && parsedTarget <= price) || (side === "sell" && parsedTarget !== null && parsedTarget >= price)) return setMessage("Take profit must be above the entry for buys and below it for sells.");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setMessage("Your session expired. Sign in again to place a paper order.");
    setUserId(user.id);
    const position = createPaperPosition({ accountId, symbol, side, quantity: parsedQuantity, entryPrice: price, stopLoss: parsedStop, takeProfit: parsedTarget });
    const { data, error } = await supabase.from("demo_positions").insert(positionToRow(position, user.id)).select().single();
    if (error || !data) return setMessage(`Paper position could not be saved: ${error?.message ?? "no position returned"}`);
    replacePositions([rowToPosition(data as PositionRow), ...positionsRef.current]);
    setMessage(`${side === "buy" ? "Buy" : "Sell"} paper position opened at ${formatPrice(price)}.`);
  }

  async function manuallyClose(position: PaperPosition) {
    if (position.status === "closed" || !userId) return;
    const closed = closePosition(position, demoMarketProvider.getCurrentPrice(position.symbol), "manual");
    const { error } = await supabase.from("demo_positions").update(positionToRow(closed, userId)).eq("id", position.id).eq("account_id", closed.accountId).eq("user_id", userId).eq("status", "open");
    if (error) return setMessage(`Paper position could not be closed: ${error.message}`);
    replacePositions(positionsRef.current.map((item) => item.id === position.id ? closed : item));
    setMessage(`${position.symbol} paper position closed at ${formatPrice(closed.currentPrice)}.`);
  }

  const openPositions = positions.filter((position) => position.status === "open");
  const totalPnl = openPositions.reduce((sum, position) => sum + position.unrealizedPnl, 0);

  return (
    <div className="min-h-[calc(100vh-9rem)] overflow-hidden rounded-tf-lg border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-warning/15 text-warning"><CircleDot className="size-4" /></span><div><p className="text-sm font-semibold">TradeForge Trading Terminal</p><p className="text-xs text-muted-foreground">DEMO/PAPER · no real execution</p></div></div>
        <div className="flex items-center gap-2"><StatusBadge tone={connection === "connected" ? "success" : "warning"}>{connection}</StatusBadge><span className="font-mono text-sm">{formatPrice(price)}</span></div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface/60 p-3">
        <div className="flex flex-wrap items-center gap-2"><select value={symbol} onChange={(event) => setSymbol(event.target.value)} className="h-9 rounded border border-border bg-background px-3 text-sm font-semibold text-foreground">{DEMO_INSTRUMENTS.map((item) => <option key={item.symbol} value={item.symbol}>{item.symbol}</option>)}</select>{accounts.length > 0 && <select value={accountId ?? ""} onChange={(event) => setAccountId(event.target.value || null)} className="h-9 max-w-52 rounded border border-border bg-background px-3 text-sm text-foreground">{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select>}<span className="text-xs text-muted-foreground">{getInstrumentDefinition(symbol).name} · {getInstrumentDefinition(symbol).sourceType}</span></div>
        <div className="flex flex-wrap items-center gap-2"><div className="flex items-center gap-1">{availableTimeframes.map((item) => <button key={item} type="button" onClick={() => setTimeframe(item)} className={`rounded px-3 py-1.5 text-xs font-semibold ${timeframe === item ? "bg-primary-solid text-primary-solid-foreground" : "text-muted-foreground hover:text-foreground"}`}>{timeframeLabels[item]}</button>)}</div><div className="flex items-center gap-2 text-xs text-muted-foreground"><RefreshCw className="size-3.5" /> {demoMarketProvider.getSourceType(symbol)}</div></div>
      </div>
      <div ref={chartContainerRef} className="h-[420px] w-full" />
      <div className="grid gap-4 border-t border-border p-4 lg:grid-cols-[1fr_260px]">
        <div>
          <div className="mb-3 flex items-center justify-between"><div><p className="text-sm font-semibold">Paper positions</p><p className="text-xs text-muted-foreground">Open and closed demo positions for this TradeForge account.</p></div><p className={`font-mono text-sm ${totalPnl >= 0 ? "text-success" : "text-danger"}`}>Open P&amp;L {formatPnl(totalPnl)}</p></div>
          {loadingPositions ? <p className="py-8 text-center text-sm text-muted-foreground">Restoring paper positions...</p> : positions.length === 0 ? <p className="rounded border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No paper positions yet.</p> : <div className="grid gap-2">{positions.slice(0, 8).map((position) => <div key={position.id} className="flex flex-wrap items-center justify-between gap-3 rounded border border-border bg-surface p-3 text-xs"><div className="grid gap-1"><div className="flex items-center gap-2"><span className={position.side === "buy" ? "text-success" : "text-danger"}>{position.side === "buy" ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}</span><span className="font-semibold">{position.symbol} {position.side.toUpperCase()} {position.quantity}</span><span className="text-muted-foreground">Entry {formatPrice(position.entryPrice)} · Exit {position.status === "closed" ? formatPrice(position.currentPrice) : formatPrice(demoMarketProvider.getCurrentPrice(position.symbol))}</span>{position.status === "open" && <button type="button" className="text-warning hover:text-foreground" onClick={() => void manuallyClose(position)}>Close</button>}</div><span className="text-muted-foreground">SL {position.stopLoss === null ? "-" : formatPrice(position.stopLoss)} · TP {position.takeProfit === null ? "-" : formatPrice(position.takeProfit)}{position.closeReason ? ` · ${position.closeReason.replace("_", " ")}` : ""}</span></div><div className="flex items-center gap-3"><StatusBadge tone={position.status === "open" ? "primary" : "neutral"}>{position.status}</StatusBadge><span className={position.unrealizedPnl >= 0 ? "text-success" : "text-danger"}>{formatPnl(position.unrealizedPnl)}</span></div></div>)}</div>}
        </div>
        <div className="rounded border border-border bg-surface p-4"><p className="text-sm font-semibold">Paper order</p><p className="mt-1 text-xs text-muted-foreground">Set optional levels before opening.</p><div className="mt-4 grid gap-3"><label className="grid gap-1 text-xs text-muted-foreground">Quantity<input value={quantity} onChange={(event) => setQuantity(event.target.value)} type="number" min="0.01" step="0.01" className="h-9 rounded border border-border bg-background px-2 text-sm text-foreground" /></label><label className="grid gap-1 text-xs text-muted-foreground">Stop loss<input value={stopLoss} onChange={(event) => setStopLoss(event.target.value)} type="number" min="0" step="0.01" placeholder="Optional" className="h-9 rounded border border-border bg-background px-2 text-sm text-foreground" /></label><label className="grid gap-1 text-xs text-muted-foreground">Take profit<input value={takeProfit} onChange={(event) => setTakeProfit(event.target.value)} type="number" min="0" step="0.01" placeholder="Optional" className="h-9 rounded border border-border bg-background px-2 text-sm text-foreground" /></label><div className="grid grid-cols-2 gap-2"><Button type="button" onClick={() => void openPosition("buy")}><TrendingUp className="size-4" /> Buy</Button><Button type="button" variant="danger" onClick={() => void openPosition("sell")}><TrendingDown className="size-4" /> Sell</Button></div></div></div>
      </div>
      <div className="flex items-center gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground"><ShieldAlert className="size-3.5 text-warning" /> {message}</div>
    </div>
  );
}
