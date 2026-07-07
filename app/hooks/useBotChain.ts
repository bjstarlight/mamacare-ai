"use client";

import { useEffect, useState, useCallback } from "react";
import {
  abbreviateAddress,
  connectWallet,
  getChainStatus,
  getExplorerAddressUrl,
  getWalletState,
  switchToBotChain,
  writeMilestoneRecord,
} from "../lib/blockchain/service";
import {
  applyMilestoneResult,
  getMilestoneStats,
  markMilestonePending,
  queueMilestoneCandidate,
  readMilestones,
  readPendingMilestones,
  subscribeMilestones,
} from "../lib/blockchain/milestoneStore";
import type {
  BlockchainMilestone,
  BlockchainRecordResult,
  MilestoneCandidateInput,
  WalletState,
} from "../lib/blockchain/types";

export function useBotChain() {
  const [wallet, setWallet] = useState<WalletState>({
    walletAvailable: false,
    connected: false,
    address: null,
    chainId: null,
    chainIdHex: null,
    networkName: "BOT Chain",
    isCorrectNetwork: false,
  });
  const [loading, setLoading] = useState(false);
  const [recordCount, setRecordCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [txState, setTxState] = useState<BlockchainRecordResult["state"]>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<BlockchainMilestone[]>([]);
  const [pendingMilestones, setPendingMilestones] = useState<BlockchainMilestone[]>([]);
  const [lastVerified, setLastVerified] = useState("Never");
  const [latestTransactionHash, setLatestTransactionHash] = useState("");
  const [chainOnline, setChainOnline] = useState(false);

  const refreshStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [status, walletState] = await Promise.all([
        getChainStatus(),
        getWalletState(),
      ]);
      setWallet(walletState);
      const stats = getMilestoneStats(readMilestones());
      setRecordCount(stats.confirmed);
      setChainOnline(Boolean(status.connected));
      if (!status.connected) {
        setError(status.error ?? "BOT Chain is currently unavailable.");
      }
      setLastVerified(stats.lastVerified);
      setLatestTransactionHash(stats.latestTransactionHash);
    } catch (err) {
      setWallet((current) => ({ ...current, connected: false }));
      setError(err instanceof Error ? err.message : "Unable to reach BOT Chain");
    } finally {
      setLoading(false);
    }
  }, []);

  const queueMilestone = useCallback((input: MilestoneCandidateInput) => {
    const milestone = queueMilestoneCandidate(input);
    const nextMilestones = readMilestones();
    setMilestones(nextMilestones);
    setPendingMilestones(readPendingMilestones());
    const stats = getMilestoneStats(nextMilestones);
    setLastVerified(stats.lastVerified);
    setLatestTransactionHash(stats.latestTransactionHash);
    return milestone;
  }, []);

  const submitMilestone = useCallback(async (milestoneId: string) => {
    setLoading(true);
    setTxState("signing");
    setError(null);
    setTxHash(null);

    try {
      const milestone = readMilestones().find((item) => item.id === milestoneId);
      if (!milestone) {
        throw new Error("Milestone not found.");
      }

      markMilestonePending(milestoneId);
      const result = await writeMilestoneRecord(milestone);
      setTxState(result.state);
      setTxHash(result.transactionHash ?? null);
      if (!result.success) {
        setError(result.error ?? "Transaction failed.");
      } else {
        applyMilestoneResult(milestoneId, result);
        await refreshStatus();
      }
      setMilestones(readMilestones());
      setPendingMilestones(readPendingMilestones());
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transaction failed";
      setTxState("error");
      setError(message);
      return { success: false, state: "error" as const, error: message };
    } finally {
      setLoading(false);
    }
  }, [refreshStatus]);

  const connect = useCallback(async () => {
    setLoading(true);
    setTxState("connecting");
    setError(null);
    try {
      const nextWallet = await connectWallet();
      setWallet(nextWallet);
      setTxState("idle");
      await refreshStatus();
      return nextWallet;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to connect wallet.";
      setError(message);
      setTxState("error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshStatus]);

  const switchNetwork = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextWallet = await switchToBotChain();
      setWallet(nextWallet);
      await refreshStatus();
      return nextWallet;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to switch network.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshStatus]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    const unsubscribe = subscribeMilestones((nextMilestones) => {
      setMilestones(nextMilestones);
      setPendingMilestones(nextMilestones.filter((milestone) => milestone.status === "pending" || milestone.status === "failed"));
      const stats = getMilestoneStats(nextMilestones);
      setLastVerified(stats.lastVerified);
      setLatestTransactionHash(stats.latestTransactionHash);
    });

    return unsubscribe;
  }, []);

  return {
    wallet,
    connected: wallet.connected,
    walletAvailable: wallet.walletAvailable,
    address: wallet.address,
    addressLabel: abbreviateAddress(wallet.address),
    addressExplorerUrl: getExplorerAddressUrl(wallet.address),
    isCorrectNetwork: wallet.isCorrectNetwork,
    chainOnline,
    loading,
    recordCount,
    error,
    txState,
    txHash,
    milestones,
    pendingMilestones,
    lastVerified,
    latestTransactionHash,
    refreshStatus,
    connectWallet: connect,
    switchNetwork,
    queueMilestone,
    submitMilestone,
  };
}
