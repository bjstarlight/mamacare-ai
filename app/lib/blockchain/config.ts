export type BotChainNetworkConfig = {
  chainId: number;
  chainIdHex: string;
  rpcUrl: string;
  contractAddress: string;
  explorerUrl?: string;
  networkName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isConfigured: boolean;
};

export function getBotChainConfig(): BotChainNetworkConfig {
  const chainId = Number(process.env.NEXT_PUBLIC_BOT_CHAIN_ID || 1);
  const rpcUrl = process.env.NEXT_PUBLIC_BOT_RPC || "";
  const contractAddress = process.env.NEXT_PUBLIC_MEDICAL_RECORD_CONTRACT || "";
  const networkName = process.env.NEXT_PUBLIC_BOT_NETWORK || "BOT Chain";
  const explorerUrl = process.env.NEXT_PUBLIC_BOT_EXPLORER;
  const nativeSymbol = process.env.NEXT_PUBLIC_BOT_CURRENCY_SYMBOL || "BOT";
  const nativeName = process.env.NEXT_PUBLIC_BOT_CURRENCY_NAME || "BOT";
  const nativeDecimals = Number(process.env.NEXT_PUBLIC_BOT_CURRENCY_DECIMALS || 18);
  const isConfigured = Boolean(rpcUrl && contractAddress);

  return {
    chainId,
    chainIdHex: `0x${chainId.toString(16)}`,
    rpcUrl,
    contractAddress,
    explorerUrl,
    networkName,
    nativeCurrency: {
      name: nativeName,
      symbol: nativeSymbol,
      decimals: nativeDecimals,
    },
    isConfigured,
  };
}
