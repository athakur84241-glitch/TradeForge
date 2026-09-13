# Historical market data

Raw downloads belong in `data/raw/` and normalized local files belong in `data/normalized/`. Both directories are ignored because source archives can become large. The tracked ingestion and validation scripts use only Node.js built-ins.

Validate a source file before importing it:

```bash
npm run validate:historical -- --file data/raw/xauusd-12h.csv --symbol XAUUSD --source getdata-finance --timeframe 12H
npm run ingest:historical -- --file data/raw/xauusd-12h.csv --output data/normalized/xauusd-1d.json --symbol XAUUSD --source getdata-finance --timeframe 12H --aggregate 1D
```

The command reports columns, row count, date range, duplicate timestamps, missing values, invalid OHLC rows, invalid timestamps, and unsorted rows. It exits non-zero for critical failures. After validation, normalize it with `npm run ingest:historical` using the same metadata and an output path under `data/normalized/`.

The first approved source is the MIT-licensed GetData Finance XAUUSD 12-hour evaluation sample: `https://github.com/getdata-finance/xauusd-12h-ohlcv-metals-historical-data`. It represents gold reference/spot data, not a broker-specific CFD. Its 12-hour OHLCV bars can be aggregated into daily candles, but they must not be presented as 1-minute, 5-minute, 15-minute, 1-hour, or 4-hour history. The advertised full archive is not included unless separately downloaded and validated.

`XAUUSD` is the TradeForge display symbol. A registered historical dataset supplies the genuinely supported historical timeframe; once it ends, the existing in-memory stream is explicitly the demo continuation. Symbols without a validated dataset remain demo continuation only.

Add another dataset by downloading one source into `data/raw/`, recording its source URL and usage terms in the manifest, validating it, normalizing it, and registering only the source timeframes it actually contains. Never manufacture OHLC from close-only data.