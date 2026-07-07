"use client";

import { useMemo } from "react";
import { ExternalLink, Loader2, ShieldAlert, ShieldCheck, Wallet } from "lucide-react";
import { useBotChain } from "../hooks/useBotChain";
import { readJSON, readString, STORAGE_KEYS } from "../lib/storage/storageService";

export default function HealthWallet() {
  const {
    connected,
    walletAvailable,
    addressLabel,
    addressExplorerUrl,
    isCorrectNetwork,
    chainOnline,
    loading,
    recordCount,
    error,
    txState,
    txHash,
    pendingMilestones,
    lastVerified,
    latestTransactionHash,
    refreshStatus,
    connectWallet,
    switchNetwork,
    queueMilestone,
    submitMilestone,
  } = useBotChain();

  const identityScore = connected && recordCount > 0 ? 100 : connected ? 70 : walletAvailable ? 25 : 0;
  const motherName = useMemo(
    () => readJSON<{ name?: string }>(STORAGE_KEYS.motherProfile, {}).name ?? "active-user",
    []
  );
  const pregnancyWeek = useMemo(() => readString(STORAGE_KEYS.pregnancyWeek), []);

  return (
    <div className="mx-auto max-w-2xl rounded-3xl bg-linear-to-br from-[#35406B] to-[#6B2545] p-6 text-sm text-white shadow-lg">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-6 w-6" />
        <h2 className="font-serif text-lg font-semibold">Health Wallet</h2>
      </div>

      <p className="mt-1 text-xs text-white/70">Secure medical identity powered by BOT Chain</p>

      <div className="mt-6 grid gap-2 md:grid-cols-2">
        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">Protected Milestones</p>
          <p className="mt-1 text-3xl font-bold">{recordCount}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">BOT Chain</p>
          <p className={`mt-1 flex items-center gap-1.5 font-semibold ${chainOnline ? "text-emerald-300" : "text-amber-300"}`}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : chainOnline ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
            {loading ? "Checking" : chainOnline ? "Online" : "Unavailable"}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 text-[#2B2118]">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#35406B]">Wallet & Verification</h3>
          <button onClick={() => void refreshStatus()} className="text-sm font-semibold text-[#6B2545]">Refresh</button>
        </div>

        <div className="mt-3 space-y-2 text-sm">
          <p><strong>Wallet:</strong> {connected ? addressLabel : walletAvailable ? "Not connected" : "Extension not detected"}</p>
          <p><strong>Network:</strong> {isCorrectNetwork ? "BOT Chain ready" : "Switch required"}</p>
          <p><strong>Last verification:</strong> {lastVerified}</p>
          <p><strong>Transaction state:</strong> {txState}</p>
          <p><strong>Error:</strong> {error ?? "None"}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {!connected ? (
            <button
              type="button"
              onClick={() => void connectWallet()}
              className="inline-flex items-center gap-2 rounded-full bg-[#6B2545] px-4 py-2 text-sm font-semibold text-white"
            >
              <Wallet className="h-4 w-4" />
              Connect wallet
            </button>
          ) : null}

          {connected && !isCorrectNetwork ? (
            <button
              type="button"
              onClick={() => void switchNetwork()}
              className="rounded-full border border-[#6B2545] px-4 py-2 text-sm font-semibold text-[#6B2545]"
            >
              Switch to BOT Chain
            </button>
          ) : null}

          {connected && addressExplorerUrl ? (
            <a
              href={addressExplorerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-[#EFE4DC] px-4 py-2 text-sm font-semibold text-[#35406B]"
            >
              Wallet on explorer
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
        </div>

        <div className="mt-4 rounded-lg border border-[#EFE4DC] bg-[#FBF6F1] p-3 break-all text-xs font-mono">
          {txHash ?? latestTransactionHash ?? "No confirmed transaction yet"}
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/60">Milestone queue</p>
            <p className="mt-1 text-sm text-white/80">
              Only user-consented milestones are queued for BOT Chain. Sensitive medical details remain off-chain.
            </p>
          </div>
          <div className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
            {pendingMilestones.length} pending
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              queueMilestone({
                type: "ai_care_plan_approval",
                category: "CareEvent",
                title: "AI care plan approval ready for BOT Chain",
                summary: pregnancyWeek
                  ? `Approved personalized care plan for pregnancy week ${pregnancyWeek}`
                  : "Approved personalized AI care plan",
                patientRef: `mother:${motherName}`,
                actor: "mother",
                consentGranted: true,
                sourceId: `care-plan-approval:${pregnancyWeek || "general"}`,
                metadata: {
                  pregnancyWeek: pregnancyWeek || "not-set",
                  approvedBy: "mother",
                },
              })
            }
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
          >
            Queue care plan approval
          </button>
          <button
            type="button"
            onClick={() =>
              queueMilestone({
                type: "health_achievement",
                category: "CareEvent",
                title: "Health achievement ready for BOT Chain",
                summary: "Completed a user-selected maternal or child care milestone",
                patientRef: `mother:${motherName}`,
                actor: "mother",
                consentGranted: true,
                sourceId: `health-achievement:${new Date().toISOString().slice(0, 10)}`,
                metadata: {
                  achievement: "care-goal-completed",
                },
              })
            }
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
          >
            Queue health achievement
          </button>
        </div>

        <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
          {pendingMilestones.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white/80">
              No pending milestones right now. Appointment confirmations, vaccination completions, care-plan approvals, and achievements will appear here when available.
            </div>
          ) : (
            pendingMilestones.map((milestone) => (
              <div key={milestone.id} className="rounded-2xl bg-white p-4 text-[#2B2118]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#35406B]">{milestone.title}</p>
                    <p className="mt-1 text-sm text-[#6F6258]">{milestone.summary || "User-consented milestone ready for attestation."}</p>
                    <p className="mt-1 text-xs text-[#8A7A6D]">
                      Created {new Date(milestone.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={loading || !connected || !isCorrectNetwork}
                    onClick={() => void submitMilestone(milestone.id)}
                    className="rounded-full bg-[#6B2545] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#C3B6B0]"
                  >
                    Record on-chain
                  </button>
                </div>
                {milestone.error ? (
                  <p className="mt-2 text-xs text-[#A8462C]">{milestone.error}</p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`mt-6 rounded-2xl p-4 text-center ${connected && isCorrectNetwork ? "bg-emerald-500" : "bg-amber-500"}`}>
        <p className="text-sm text-white/90">Medical Identity Score</p>
        <p className="text-4xl font-bold">{identityScore}%</p>
        <p className="text-sm text-white/90">
          {connected && isCorrectNetwork ? "Ready for milestone verification" : "Connect wallet to verify milestones"}
        </p>
      </div>
    </div>
  );
}
