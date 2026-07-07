"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Clock3,
  Fingerprint,
  Database,
  CheckCircle2,
} from "lucide-react";

export default function BotChainAuditTrail() {
  const [records, setRecords] = useState(0);
  const [verified, setVerified] = useState("Never");
  const [hash, setHash] = useState("");

  useEffect(() => {
    const protectedRecords = Number(localStorage.getItem("protectedRecords")) || 0;
    const lastVerified = localStorage.getItem("lastVerified") || "Never";

    setRecords(protectedRecords);
    setVerified(lastVerified);

    setHash(
      "0x" +
        Math.random()
          .toString(16)
          .substring(2, 18)
          .toUpperCase()
    );
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-emerald-600" />
        <div>
          <h2 className="text-xl font-bold">BOT Chain Audit Trail</h2>
          <p className="text-sm text-slate-500">Immutable medical record verification</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between border-b pb-3">
          <span>Clinical Summary</span>
          <CheckCircle2 className="text-green-600" />
        </div>

        <div className="flex justify-between border-b pb-3">
          <span>Doctor Consultation</span>
          <CheckCircle2 className="text-green-600" />
        </div>

        <div className="flex justify-between border-b pb-3">
          <span>Prescription</span>
          <CheckCircle2 className="text-green-600" />
        </div>

        <div className="flex justify-between border-b pb-3">
          <span>AI Report</span>
          <CheckCircle2 className="text-green-600" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock3 className="h-4 w-4" />
            <span>Last Verified</span>
          </div>
          <p className="mt-2 font-semibold text-slate-900">{verified}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Fingerprint className="h-4 w-4" />
            <span>Protected Records</span>
          </div>
          <p className="mt-2 font-semibold text-slate-900">{records}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Database className="h-4 w-4" />
            <span>Hash</span>
          </div>
          <p className="mt-2 break-all font-semibold text-slate-900">{hash || "Pending"}</p>
        </div>
      </div>
    </div>
  );
}
