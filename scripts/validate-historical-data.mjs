import fs from "node:fs";
import path from "node:path";

const argumentsList = process.argv.slice(2);
const argumentValue = (name) => {
  const index = argumentsList.indexOf(name);
  return index === -1 ? null : argumentsList[index + 1];
};
const filePath = argumentValue("--file");
const symbol = argumentValue("--symbol") ?? "XAUUSD";
const source = argumentValue("--source") ?? "unspecified";
const timeframe = argumentValue("--timeframe") ?? "unspecified";

if (!filePath) {
  console.error("Usage: npm run validate:historical -- --file data/raw/xauusd-12h.csv --symbol XAUUSD --source getdata-finance --timeframe 12H");
  process.exit(2);
}

const requiredColumns = ["datetime", "open", "high", "low", "close"];
const rows = fs.readFileSync(path.resolve(filePath), "utf8").trim().split(/\r?\n/);
const columns = rows.shift()?.split(",").map((column) => column.trim()) ?? [];
const columnIndexes = Object.fromEntries(columns.map((column, index) => [column, index]));
const missingColumns = requiredColumns.filter((column) => columnIndexes[column] === undefined);
if (missingColumns.length > 0) {
  console.error(`Missing required columns: ${missingColumns.join(", ")}`);
  process.exit(1);
}

const parsed = rows.filter(Boolean).map((line, index) => {
  const values = line.split(",");
  const value = (column) => values[columnIndexes[column]];
  return {
    line: index + 2,
    timestamp: Date.parse(value("datetime")),
    open: Number(value("open")),
    high: Number(value("high")),
    low: Number(value("low")),
    close: Number(value("close")),
  };
});
const missingValueCount = parsed.reduce((count, row) => count + [row.timestamp, row.open, row.high, row.low, row.close].filter((value) => !Number.isFinite(value)).length, 0);
const sorted = parsed.slice().sort((left, right) => left.timestamp - right.timestamp);
const duplicateCount = sorted.reduce((count, row, index) => count + (index > 0 && row.timestamp === sorted[index - 1].timestamp ? 1 : 0), 0);
const invalidOhlcCount = parsed.filter((row) => row.open <= 0 || row.high <= 0 || row.low <= 0 || row.close <= 0 || row.high < Math.max(row.open, row.close) || row.low > Math.min(row.open, row.close)).length;
const invalidTimestampCount = parsed.filter((row) => !Number.isFinite(row.timestamp)).length;
const unsortedCount = parsed.reduce((count, row, index) => count + (index > 0 && row.timestamp < parsed[index - 1].timestamp ? 1 : 0), 0);
const firstDate = sorted[0]?.timestamp;
const lastDate = sorted.at(-1)?.timestamp;
const report = {
  symbol,
  source,
  timeframe,
  rowCount: parsed.length,
  earliestDate: Number.isFinite(firstDate) ? new Date(firstDate).toISOString() : null,
  latestDate: Number.isFinite(lastDate) ? new Date(lastDate).toISOString() : null,
  columns,
  duplicateCount,
  invalidOhlcCount,
  missingValueCount,
  invalidTimestampCount,
  unsortedCount,
};
console.log(JSON.stringify(report, null, 2));
if (parsed.length === 0 || missingValueCount > 0 || duplicateCount > 0 || invalidOhlcCount > 0 || invalidTimestampCount > 0 || unsortedCount > 0) process.exit(1);