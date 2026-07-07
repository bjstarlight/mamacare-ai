"use client";

import { ShieldCheck } from "lucide-react";

type BlockchainStatusCardProps = {
  protectedRecords: number;
  lastVerified: string;
  connected?: boolean;
};

export default function BlockchainStatusCard({
  protectedRecords,
  lastVerified,
  connected = true,
}: BlockchainStatusCardProps) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-center gap-2 text-emerald-700">
        <ShieldCheck className="h-5 w-5" />
        <p className="text-sm font-semibold">
          BOT Chain {connected ? "Connected" : "Offline"}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-white/70 p-3">
          <p className="text-xs text-emerald-700/70">Protected Records</p>
          <p className="mt-1 text-xl font-semibold text-emerald-800">{protectedRecords}</p>
        </div>
        <div className="rounded-lg bg-white/70 p-3">
          <p className="text-xs text-emerald-700/70">Last Verified</p>
          <p className="mt-1 text-sm font-semibold text-emerald-800">{lastVerified}</p>
        </div>
      </div>
    </div>
  );
}
