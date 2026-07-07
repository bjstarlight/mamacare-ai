"use client";
import { ExternalLink, Wallet } from "lucide-react";
import { useBotChain } from "../hooks/useBotChain";

export default function WalletConnect() {
  const { connected, addressLabel, addressExplorerUrl, isCorrectNetwork, loading, connectWallet, switchNetwork } = useBotChain();

  return (
    <div className="rounded-xl bg-white shadow p-6">
      <h2 className="mb-4 text-xl font-bold">Blockchain Wallet</h2>

      {connected ? (
        <>
          <p className="font-semibold text-green-600">Connected</p>
          <p className="mt-2 text-sm break-all">{addressLabel}</p>
          {!isCorrectNetwork ? (
            <button
              onClick={() => void switchNetwork()}
              className="mt-4 rounded-lg border border-purple-600 px-5 py-3 text-purple-700"
            >
              Switch to BOT Chain
            </button>
          ) : null}
          {addressExplorerUrl ? (
            <a
              href={addressExplorerUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-purple-700"
            >
              View wallet
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
        </>
      ) : (
        <button
          onClick={() => void connectWallet()}
          className="rounded-lg bg-purple-600 px-5 py-3 text-white hover:bg-purple-700"
        >
          <span className="inline-flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            {loading ? "Connecting..." : "Connect wallet"}
          </span>
        </button>
      )}
    </div>
  );
}