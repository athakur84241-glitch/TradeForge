import { createHash } from "node:crypto";
import { getConfiguredTokenAddress, getPaymentMethodConfig, type PaymentMethod } from "@/features/payments/payment-config";

export type DirectWalletVerificationResult = {
  status: "pending" | "confirmed" | "failed" | "unavailable" | "expired";
  reason: string;
  confirmations?: number;
  transactionHash?: string;
  amountAtomic?: string;
  network?: string;
  address?: string;
  asset?: string;
  provider?: string;
};

const RPC_ENV_BY_METHOD: Record<PaymentMethod, string> = {
  USDT_TRC20: "TRON_RPC_URL",
  USDT_ERC20: "ETHEREUM_RPC_URL",
  USDT_SOLANA: "SOLANA_RPC_URL",
  USDC_ERC20: "ETHEREUM_RPC_URL",
  SOL_SOLANA: "SOLANA_RPC_URL",
};

const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a7e3d8b8e6";

type VerificationInput = {
  method: PaymentMethod;
  expectedAmountAtomic: string;
  expectedAddress: string;
  network: string;
  transactionHash: string;
  tokenAddress?: string;
};

type ChainEvidence = {
  amountAtomic: string;
  receivingAddress: string;
  confirmations: number;
  successful: boolean;
  assetIdentifier?: string;
};

export function isDirectWalletVerificationConfigured(method: PaymentMethod) {
  return Boolean(process.env[RPC_ENV_BY_METHOD[method]]);
}

export function getVerificationRequirement(method: PaymentMethod) {
  const config = getPaymentMethodConfig(method);
  return {
    confirmations: config.confirmations,
    decimals: config.decimals,
    network: config.network,
  };
}

async function rpcRequest(url: string, method: string, params: unknown[]) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Blockchain RPC returned HTTP ${response.status}.`);
  const body = await response.json() as { result?: unknown; error?: { message?: string } };
  if (body.error) throw new Error(body.error.message ?? "Blockchain RPC request failed.");
  return body.result;
}

function hexToBigInt(value: string | undefined) {
  if (!value || !/^0x[0-9a-f]+$/i.test(value)) throw new Error("Blockchain response contains an invalid numeric value.");
  return BigInt(value);
}

function normalizeEvmAddress(value: string) {
  return value.toLowerCase().replace(/^0x/, "").padStart(40, "0");
}

async function lookupEvm(method: PaymentMethod, hash: string, expectedTokenAddress: string | undefined, expectedAddress: string): Promise<ChainEvidence> {
  const rpcUrl = process.env.ETHEREUM_RPC_URL;
  const config = getPaymentMethodConfig(method);
  const tokenAddress = expectedTokenAddress ?? getConfiguredTokenAddress(config);
  if (!rpcUrl || !tokenAddress || !process.env.ETHEREUM_CHAIN_ID) throw new Error("Ethereum RPC, chain ID, or token contract is not configured.");

  const chainId = await rpcRequest(rpcUrl, "eth_chainId", []) as string;
  const configuredChainId = process.env.ETHEREUM_CHAIN_ID.startsWith("0x") ? process.env.ETHEREUM_CHAIN_ID : `0x${BigInt(process.env.ETHEREUM_CHAIN_ID).toString(16)}`;
  if (chainId.toLowerCase() !== configuredChainId.toLowerCase()) throw new Error("Ethereum provider chain does not match the configured network.");

  const receipt = await rpcRequest(rpcUrl, "eth_getTransactionReceipt", [hash]) as {
    status?: string;
    blockNumber?: string;
    logs?: Array<{ address?: string; topics?: string[]; data?: string }>;
  } | null;
  if (!receipt) throw new Error("Transaction is not yet indexed.");
  if (receipt.status !== "0x1") throw new Error("Transaction failed or reverted.");

  const latestBlock = hexToBigInt(await rpcRequest(rpcUrl, "eth_blockNumber", [] ) as string);
  const transactionBlock = hexToBigInt(receipt.blockNumber);
  const destination = normalizeEvmAddress(expectedAddress);
  const configuredToken = tokenAddress.toLowerCase();
  const transfer = (receipt.logs ?? []).find((log) =>
    log.address?.toLowerCase() === configuredToken
      && log.topics?.[0]?.toLowerCase() === TRANSFER_TOPIC
      && normalizeEvmAddress(`0x${log.topics[2]?.slice(-40) ?? ""}`) === destination,
  );
  if (!transfer?.data) throw new Error("No matching token transfer to the configured wallet was found.");

  return {
    amountAtomic: hexToBigInt(transfer.data).toString(),
    receivingAddress: config.address,
    confirmations: Number(latestBlock - transactionBlock + 1n),
    successful: true,
    assetIdentifier: configuredToken,
  };
}

async function tronRequest(url: string, path: string, body: Record<string, unknown> = {}) {
  const response = await fetch(`${url.replace(/\/$/, "")}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`TRON provider returned HTTP ${response.status}.`);
  return response.json() as Promise<Record<string, unknown>>;
}

function base58AddressToHex(address: string) {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let value = 0n;
  for (const character of address) {
    const digit = alphabet.indexOf(character);
    if (digit < 0) throw new Error("Invalid TRON receiving address.");
    value = value * 58n + BigInt(digit);
  }
  const bytes: number[] = [];
  while (value > 0n) {
    bytes.unshift(Number(value & 255n));
    value >>= 8n;
  }
  for (const character of address) {
    if (character !== "1") break;
    bytes.unshift(0);
  }
  if (bytes.length < 5) throw new Error("Invalid TRON receiving address.");
  const payload = Buffer.from(bytes.slice(0, -4));
  const checksum = Buffer.from(bytes.slice(-4));
  const expected = createHash("sha256").update(createHash("sha256").update(payload).digest()).digest().subarray(0, 4);
  if (!checksum.equals(expected)) throw new Error("Invalid TRON receiving address checksum.");
  return payload.toString("hex");
}

function normalizeTronHexAddress(address: string) {
  return address.startsWith("T") ? base58AddressToHex(address) : address.toLowerCase().replace(/^0x/, "");
}

async function lookupTron(hash: string, expectedTokenAddress: string | undefined, expectedAddress: string): Promise<ChainEvidence> {
  const rpcUrl = process.env.TRON_RPC_URL;
  const config = getPaymentMethodConfig("USDT_TRC20");
  const tokenAddress = expectedTokenAddress ?? getConfiguredTokenAddress(config);
  if (!rpcUrl || !tokenAddress) throw new Error("TRON RPC or token contract is not configured.");

  const transaction = await tronRequest(rpcUrl, "/wallet/gettransactionbyid", { value: hash });
  const contract = (transaction.raw_data as { contract?: Array<{ parameter?: { value?: { data?: string; contract_address?: string } } }> } | undefined)?.contract?.[0];
  const value = contract?.parameter?.value;
  const data = value?.data;
  const contractAddress = value?.contract_address;
  if (!data || !contractAddress || normalizeTronHexAddress(contractAddress) !== normalizeTronHexAddress(tokenAddress)) {
    throw new Error("Transaction is not a USDT TRC20 transfer from the configured token contract.");
  }
  if (!data.startsWith("a9059cbb") || data.length < 136) throw new Error("Transaction is not a TRC20 transfer.");

  const recipient = data.slice(8 + 24, 8 + 64).toLowerCase();
  const expectedRecipient = base58AddressToHex(expectedAddress).toLowerCase();
  if (recipient !== expectedRecipient) throw new Error("TRC20 recipient does not match the order wallet.");

  const info = await tronRequest(rpcUrl, "/wallet/gettransactioninfobyid", { value: hash });
  if (info.receipt && (info.receipt as { result?: string }).result !== "SUCCESS") throw new Error("TRON transaction failed or reverted.");
  const blockNumber = Number(info.blockNumber);
  const latest = await tronRequest(rpcUrl, "/wallet/getnowblock");
  const latestBlock = Number((latest.block_header as { raw_data?: { number?: number } } | undefined)?.raw_data?.number);
  if (!Number.isSafeInteger(blockNumber) || !Number.isSafeInteger(latestBlock)) throw new Error("TRON confirmation data is unavailable.");

  return {
    amountAtomic: BigInt(`0x${data.slice(72, 136)}`).toString(),
    receivingAddress: expectedAddress,
    confirmations: Math.max(0, latestBlock - blockNumber + 1),
    successful: true,
    assetIdentifier: tokenAddress.toLowerCase(),
  };
}

async function lookupSolana(method: PaymentMethod, hash: string, expectedMint: string | undefined, expectedAddress: string): Promise<ChainEvidence> {
  const rpcUrl = process.env.SOLANA_RPC_URL;
  const config = getPaymentMethodConfig(method);
  const mint = expectedMint ?? getConfiguredTokenAddress(config);
  if (!rpcUrl || !process.env.SOLANA_GENESIS_HASH || (method === "USDT_SOLANA" && !mint)) throw new Error("Solana RPC, genesis hash, or token mint is not configured.");

  const genesisHash = await rpcRequest(rpcUrl, "getGenesisHash", []) as string;
  if (genesisHash !== process.env.SOLANA_GENESIS_HASH) throw new Error("Solana provider cluster does not match the configured network.");

  const transaction = await rpcRequest(rpcUrl, "getTransaction", [hash, { encoding: "jsonParsed", commitment: "confirmed", maxSupportedTransactionVersion: 0 }]) as {
    slot?: number;
    meta?: { err?: unknown; preBalances?: number[]; postBalances?: number[]; preTokenBalances?: Array<{ accountIndex: number; owner?: string; mint: string; uiTokenAmount: { amount: string } }>; postTokenBalances?: Array<{ accountIndex: number; owner?: string; mint: string; uiTokenAmount: { amount: string } }> };
    transaction?: { message?: { accountKeys?: Array<{ pubkey: string } | string> } };
  } | null;
  if (!transaction?.meta || transaction.meta.err) throw new Error("Solana transaction is missing or failed.");

  const keys = transaction.transaction?.message?.accountKeys ?? [];
  let amountAtomic = 0n;
  if (method === "SOL_SOLANA") {
    const index = keys.findIndex((key) => (typeof key === "string" ? key : key.pubkey) === expectedAddress);
    if (index < 0) throw new Error("SOL recipient wallet was not present in the transaction.");
    amountAtomic = BigInt((transaction.meta.postBalances?.[index] ?? 0) - (transaction.meta.preBalances?.[index] ?? 0));
  } else {
    const balances = [...(transaction.meta.preTokenBalances ?? []), ...(transaction.meta.postTokenBalances ?? [])];
    const matching = balances.find((balance) => balance.owner === expectedAddress && balance.mint === mint);
    if (!matching) throw new Error("No matching SPL token account for the configured wallet and mint was found.");
    const before = transaction.meta.preTokenBalances?.find((balance) => balance.accountIndex === matching.accountIndex)?.uiTokenAmount.amount ?? "0";
    const after = transaction.meta.postTokenBalances?.find((balance) => balance.accountIndex === matching.accountIndex)?.uiTokenAmount.amount ?? "0";
    amountAtomic = BigInt(after) - BigInt(before);
  }
  if (amountAtomic <= 0n) throw new Error("Transaction did not transfer a positive amount to the configured wallet.");

  const currentSlot = await rpcRequest(rpcUrl, "getSlot", [{ commitment: "finalized" }]) as number;
  return {
    amountAtomic: amountAtomic.toString(),
    receivingAddress: expectedAddress,
    confirmations: Math.max(0, currentSlot - (transaction.slot ?? currentSlot) + 1),
    successful: true,
    assetIdentifier: mint,
  };
}

export async function verifyPaymentOnChain(input: VerificationInput): Promise<DirectWalletVerificationResult> {
  try {
    const config = getPaymentMethodConfig(input.method);
    if (input.network !== config.network) return { status: "failed", reason: "Transaction network does not match the order.", provider: RPC_ENV_BY_METHOD[input.method] };

    const evidence = input.method === "USDT_TRC20"
      ? await lookupTron(input.transactionHash, input.tokenAddress, input.expectedAddress)
      : input.network === "ERC20"
        ? await lookupEvm(input.method, input.transactionHash, input.tokenAddress, input.expectedAddress)
        : await lookupSolana(input.method, input.transactionHash, input.tokenAddress, input.expectedAddress);

    if (evidence.receivingAddress !== input.expectedAddress) return { status: "failed", reason: "Receiving address does not match the order wallet.", provider: RPC_ENV_BY_METHOD[input.method] };
    if (!evidence.successful) return { status: "failed", reason: "Blockchain transaction failed or reverted.", provider: RPC_ENV_BY_METHOD[input.method] };
    if (BigInt(evidence.amountAtomic) < BigInt(input.expectedAmountAtomic)) return { status: "failed", reason: "Detected amount is below the required amount.", amountAtomic: evidence.amountAtomic, transactionHash: input.transactionHash, provider: RPC_ENV_BY_METHOD[input.method] };
    if (evidence.confirmations < getVerificationRequirement(input.method).confirmations) return { status: "pending", reason: "Payment is detected but not sufficiently confirmed.", confirmations: evidence.confirmations, amountAtomic: evidence.amountAtomic, transactionHash: input.transactionHash, provider: RPC_ENV_BY_METHOD[input.method] };

    return { status: "confirmed", reason: "Payment independently verified on-chain.", confirmations: evidence.confirmations, transactionHash: input.transactionHash, amountAtomic: evidence.amountAtomic, network: input.network, address: evidence.receivingAddress, asset: config.asset, provider: RPC_ENV_BY_METHOD[input.method] };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Blockchain provider verification failed.";
    const status = reason.includes("not configured") || reason.includes("HTTP") || reason.includes("RPC") || reason.includes("provider")
      ? "unavailable"
      : reason.includes("not yet indexed")
        ? "pending"
        : "failed";
    return { status, reason, provider: RPC_ENV_BY_METHOD[input.method] };
  }
}

export function verifyDirectWalletPayment(input: {
  method: PaymentMethod;
  expectedAmountAtomic: string;
  expectedAddress: string;
  network: string;
  transactionHash?: string | null;
  paymentReference?: string | null;
  amountAtomic?: string | null;
  confirmations?: number;
  expiredAt?: string | null;
  currentTime?: string;
}): DirectWalletVerificationResult {
  if (input.expiredAt && new Date(input.expiredAt).getTime() <= new Date(input.currentTime ?? Date.now()).getTime()) {
    return {
      status: "expired",
      reason: "The payment window expired before a valid blockchain confirmation was recorded.",
    };
  }

  if (!input.transactionHash || !input.amountAtomic || !/^\d+$/.test(input.amountAtomic)) return { status: "pending", reason: "Independent blockchain evidence is not available yet." };
  if (input.network !== getVerificationRequirement(input.method).network) return { status: "failed", reason: "Transaction network does not match the order." };
  if (input.expectedAddress.trim().length === 0) return { status: "failed", reason: "Order receiving address is invalid." };
  if (BigInt(input.amountAtomic) < BigInt(input.expectedAmountAtomic)) return { status: "failed", reason: "Detected payment is below the required order amount.", amountAtomic: input.amountAtomic, transactionHash: input.transactionHash };
  if ((input.confirmations ?? 0) < getVerificationRequirement(input.method).confirmations) return { status: "pending", reason: "Payment is detected but not sufficiently confirmed.", confirmations: input.confirmations, transactionHash: input.transactionHash, amountAtomic: input.amountAtomic, network: input.network };
  return { status: "confirmed", reason: "Payment verified on-chain.", confirmations: input.confirmations, transactionHash: input.transactionHash, amountAtomic: input.amountAtomic, network: input.network, address: input.expectedAddress };
}
