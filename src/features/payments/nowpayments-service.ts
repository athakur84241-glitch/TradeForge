import { createHmac, timingSafeEqual } from "node:crypto";
import type { PaymentMethod } from "@/features/payments/payment-config";

const currencyEnvByMethod: Record<PaymentMethod, string> = {
  USDT_TRC20: "NOWPAYMENTS_USDT_TRC20_CURRENCY",
  USDT_ERC20: "NOWPAYMENTS_USDT_ERC20_CURRENCY",
  USDT_SOLANA: "NOWPAYMENTS_USDT_ERC20_CURRENCY",
  USDC_ERC20: "NOWPAYMENTS_USDC_ERC20_CURRENCY",
  SOL_SOLANA: "NOWPAYMENTS_SOL_CURRENCY",
};

export type NowPaymentsRequest = {
  paymentId: string;
  paymentCurrency: string;
  paymentAmount: string;
  paymentAmountAtomic: string;
  exchangeRate: string | null;
  paymentAddress: string;
  expiresAt: string;
};

export type NowPaymentsIpn = {
  payment_id: number | string;
  payment_status: string;
  pay_address?: string;
  pay_amount?: string;
  actually_paid?: string;
  pay_currency?: string;
  order_id?: string;
  purchase_id?: string;
  transaction_id?: string;
  created_at?: string;
  updated_at?: string;
};

function getConfiguration() {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!apiKey || !ipnSecret || !appUrl) {
    throw new Error("NOWPayments is not configured.");
  }
  return { apiKey, ipnSecret, appUrl: appUrl.replace(/\/$/, "") };
}

export function isNowPaymentsConfigured() {
  return Boolean(process.env.NOWPAYMENTS_API_KEY && process.env.NOWPAYMENTS_IPN_SECRET && process.env.NEXT_PUBLIC_APP_URL);
}

export async function createNowPaymentsRequest(input: {
  orderId: string;
  amountCents: number;
  currency: string;
  method: PaymentMethod;
}): Promise<NowPaymentsRequest> {
  const { apiKey, appUrl } = getConfiguration();
  const paymentCurrency = process.env[currencyEnvByMethod[input.method]];
  if (!paymentCurrency) throw new Error("The selected NOWPayments currency is not configured.");

  const response = await fetch("https://api.nowpayments.io/v1/payment", {
    method: "POST",
    headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      price_amount: (input.amountCents / 100).toFixed(2),
      price_currency: input.currency.toLowerCase(),
      pay_currency: paymentCurrency,
      order_id: input.orderId,
      order_description: `TradeForge challenge order ${input.orderId}`,
      ipn_callback_url: `${appUrl}/api/payments/nowpayments/webhook`,
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("NOWPayments could not create a payment request.");
  const data = await response.json() as {
    payment_id?: number | string;
    pay_currency?: string;
    pay_amount?: string;
    pay_address?: string;
    price_amount?: string | number;
    expiration_estimate_date?: string;
  };
  if (!data.payment_id || !data.pay_currency || !data.pay_amount || !data.pay_address) {
    throw new Error("NOWPayments returned an incomplete payment request.");
  }
  const decimals = input.method === "SOL_SOLANA" ? 9 : 6;
  const paymentAmountAtomic = decimalToAtomic(data.pay_amount, decimals);
  const exchangeRate = data.price_amount ? calculateExchangeRate(String(data.price_amount), data.pay_amount) : null;
  return {
    paymentId: String(data.payment_id),
    paymentCurrency: data.pay_currency,
    paymentAmount: data.pay_amount,
    paymentAmountAtomic,
    exchangeRate,
    paymentAddress: data.pay_address,
    expiresAt: data.expiration_estimate_date ?? new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
}

export function decimalToAtomic(value: string, decimals: number) {
  if (!/^\d+(?:\.\d+)?$/.test(value)) throw new Error("Invalid provider amount.");
  const [whole, fraction = ""] = value.split(".");
  if (fraction.length > decimals) throw new Error("Provider amount has excessive precision.");
  return BigInt(`${whole}${fraction.padEnd(decimals, "0")}`).toString();
}

function calculateExchangeRate(fiatAmount: string, cryptoAmount: string) {
  if (!/^\d+(?:\.\d+)?$/.test(fiatAmount) || !/^\d+(?:\.\d+)?$/.test(cryptoAmount)) return null;
  const [fiatWhole, fiatFraction = ""] = fiatAmount.split(".");
  const [cryptoWhole, cryptoFraction = ""] = cryptoAmount.split(".");
  const fiatScale = fiatFraction.length;
  const cryptoScale = cryptoFraction.length;
  const numerator = BigInt(`${fiatWhole}${fiatFraction}`) * 10n ** BigInt(cryptoScale + 18);
  const denominator = BigInt(`${cryptoWhole}${cryptoFraction}`) * 10n ** BigInt(fiatScale);
  if (denominator === 0n) return null;
  const scaled = numerator / denominator;
  const text = scaled.toString().padStart(19, "0");
  return `${text.slice(0, -18)}.${text.slice(-18)}`;
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>).sort().reduce<Record<string, unknown>>((result, key) => {
      result[key] = sortObject((value as Record<string, unknown>)[key]);
      return result;
    }, {});
  }
  return value;
}

export function verifyNowPaymentsSignature(rawBody: string, signature: string | null) {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret || !signature) return false;
  let normalizedBody: string;
  try {
    normalizedBody = JSON.stringify(sortObject(JSON.parse(rawBody)));
  } catch {
    return false;
  }
  const expected = createHmac("sha512", secret).update(normalizedBody).digest("hex");
  const supplied = Buffer.from(signature, "utf8");
  const calculated = Buffer.from(expected, "utf8");
  return supplied.length === calculated.length && timingSafeEqual(supplied, calculated);
}

export function isSuccessfulNowPaymentsStatus(status: string) {
  return status === "finished" || status === "confirmed";
}

export function isFailedNowPaymentsStatus(status: string) {
  return status === "failed" || status === "expired" || status === "refunded";
}

export function getNowPaymentsCurrency(method: PaymentMethod) {
  return process.env[currencyEnvByMethod[method]];
}
