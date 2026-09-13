import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const argumentValue = (name) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
};
const filePath = argumentValue("--file");
const outputPath = argumentValue("--output");
const symbol = argumentValue("--symbol") ?? "XAUUSD";
const source = argumentValue("--source") ?? "unspecified";
const timeframe = argumentValue("--timeframe") ?? "unspecified";
const aggregateTimeframe = argumentValue("--aggregate");
if (!filePath || !outputPath) {
  console.error("Usage: npm run ingest:historical -- --file data/raw/xauusd-12h.csv --output data/normalized/xauusd-1d.json --symbol XAUUSD --source getdata-finance --timeframe 12H --aggregate 1D");
  process.exit(2);
}

execFileSync(process.execPath, [path.resolve("scripts/validate-historical-data.mjs"), "--file", filePath, "--symbol", symbol, "--source", source, "--timeframe", timeframe], { stdio: "inherit" });
const lines = fs.readFileSync(path.resolve(filePath), "utf8").trim().split(/\r?\n/);
const columns = lines.shift().split(",").map((column) => column.trim());
const index = Object.fromEntries(columns.map((column, position) => [column, position]));
const sourceCandles = lines.filter(Boolean).map((line) => {
  const values = line.split(",");
  return {
    time: Math.floor(Date.parse(values[index.datetime]) / 1000),
    open: Number(values[index.open]),
    high: Number(values[index.high]),
    low: Number(values[index.low]),
    close: Number(values[index.close]),
  };
});
const candles = aggregateTimeframe === "1D"
  ? sourceCandles.reduce((daily, candle) => {
    const time = Math.floor(candle.time / 86400) * 86400;
    const previous = daily.at(-1);
    if (!previous || previous.time !== time) daily.push({ time, open: candle.open, high: candle.high, low: candle.low, close: candle.close });
    else daily[daily.length - 1] = { ...previous, high: Math.max(previous.high, candle.high), low: Math.min(previous.low, candle.low), close: candle.close };
    return daily;
  }, [])
  : sourceCandles;
const destination = path.resolve(outputPath);
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, `${JSON.stringify({ symbol, source, sourceTimeframe: timeframe, timeframe: aggregateTimeframe ?? timeframe, candles }, null, 2)}\n`);
console.log(`Wrote ${candles.length} normalized candles to ${outputPath}`);