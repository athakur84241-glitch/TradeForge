export const PAYMENT_METHODS = ["USDT_TRON", "USDT_ERC20", "USDC_ERC20", "SOL_SOLANA"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type PaymentMethodConfig = {
  method: PaymentMethod;
  asset: "USDT" | "USDC" | "SOL";
  network: "TRC20" | "ERC20" | "SOLANA";
  address: string;
  rateUsd: string;
  decimals: number;
  confirmations: number;
};

export const PAYMENT_METHOD_ASSETS: Record<PaymentMethod, PaymentMethodConfig["asset"]> = {
  USDT_TRON: "USDT",
  USDT_ERC20: "USDT",
  USDC_ERC20: "USDC",
  SOL_SOLANA: "SOL",
};

const definitions: Record<PaymentMethod, Omit<PaymentMethodConfig, "address" | "rateUsd"> & { addressEnv: string; rateEnv: string }> = {
  USDT_TRON: { method: "USDT_TRON", asset: "USDT", network: "TRC20", decimals: 6, confirmations: 20, addressEnv: "CRYPTO_USDT_TRC20_ADDRESS", rateEnv: "CRYPTO_USDT_USD_RATE" },
  USDT_ERC20: { method: "USDT_ERC20", asset: "USDT", network: "ERC20", decimals: 6, confirmations: 12, addressEnv: "CRYPTO_USDT_ERC20_ADDRESS", rateEnv: "CRYPTO_USDT_USD_RATE" },
  USDC_ERC20: { method: "USDC_ERC20", asset: "USDC", network: "ERC20", decimals: 6, confirmations: 12, addressEnv: "CRYPTO_USDC_ERC20_ADDRESS", rateEnv: "CRYPTO_USDC_USD_RATE" },
  SOL_SOLANA: { method: "SOL_SOLANA", asset: "SOL", network: "SOLANA", decimals: 9, confirmations: 32, addressEnv: "CRYPTO_SOL_SOLANA_ADDRESS", rateEnv: "CRYPTO_SOL_USD_RATE" },
};

export function getPaymentMethodConfig(method: string): PaymentMethodConfig {
  if (!PAYMENT_METHODS.includes(method as PaymentMethod)) throw new Error("Unsupported payment method.");
  const definition = definitions[method as PaymentMethod];
  const address = process.env[definition.addressEnv];
  const rateUsd = process.env[definition.rateEnv];
  if (!address || !rateUsd || !/^\d+(\.\d+)?$/.test(rateUsd) || parseDecimal(rateUsd).units <= 0n) {
    throw new Error("This payment method is not configured.");
  }
  return { method: definition.method, asset: definition.asset, network: definition.network, decimals: definition.decimals, confirmations: definition.confirmations, address, rateUsd };
}

function parseDecimal(value: string) {
  const [whole, fraction = ""] = value.split(".");
  return { units: BigInt(`${whole}${fraction}`), scale: fraction.length };
}

export function calculateExpectedAmount(amountCents: number, config: PaymentMethodConfig) {
  const rate = parseDecimal(config.rateUsd);
  const numerator = BigInt(amountCents) * 10n ** BigInt(config.decimals + rate.scale);
  const denominator = 100n * rate.units;
  const atomic = (numerator + denominator - 1n) / denominator;
  if (atomic <= 0n) throw new Error("Calculated payment amount is invalid.");
  const units = atomic.toString().padStart(config.decimals + 1, "0");
  const amount = `${units.slice(0, -config.decimals)}.${units.slice(-config.decimals)}`;
  return { atomic: atomic.toString(), amount };
}