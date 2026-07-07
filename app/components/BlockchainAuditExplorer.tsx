"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Clock3,
  Database,
  FileText,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getChainStatus } from "../lib/blockchain/service";
import { subscribeMilestones } from "../lib/blockchain/milestoneStore";
import type { BlockchainMilestone } from "../lib/blockchain/types";

export default function BlockchainAuditExplorer() {
  const [records, setRecords] = useState<BlockchainMilestone[]>([]);
  const [search, setSearch] = useState("");
  const [chainOnline, setChainOnline] = useState(false);

  useEffect(() => {
  const unsubscribe = subscribeMilestones((milestones) => {
    setRecords(milestones);
  });

  void getChainStatus().then((status) => {
    setChainOnline(Boolean(status.connected));
  });

  return () => {
    unsubscribe();
  };
}, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return records.filter((record) => {
      const haystack = `${record.patientRef} ${record.type} ${record.recordHash ?? ""} ${record.summary || ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [records, search]);

  return (
    <section className="`rounded-4xl` border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            BOT Chain Audit Explorer
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Every life event becomes a visible blockchain event.</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Read the immutable trail of consented care milestones, including appointments, vaccination completions, AI care-plan approvals, and health achievements.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Live view</span> • {records.length} entries in the ledger
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Database className="h-4 w-4" />
            Total records
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{records.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck className="h-4 w-4" />
            Verified
          </div>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">{records.filter((record) => record.status === "confirmed").length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Activity className="h-4 w-4" />
            Network
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{chainOnline ? "Online" : "Unavailable"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock3 className="h-4 w-4" />
            Latest block
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900">#{Math.max(records.filter((record) => record.status === "confirmed").length, 1)}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search milestone, patient reference, or hash"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none ring-0"
          />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No milestone events yet. Confirm an appointment, complete a vaccine, approve a care plan, or record a health achievement to populate the explorer.
          </div>
        ) : (
          filtered.map((record, index) => (
            <div key={`${record.id}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{record.title}</p>
                    <p className="text-sm text-slate-500">{record.patientRef}</p>
                    <p className="mt-1 text-xs text-slate-400">{record.summary || "Consent-ready milestone queued for BOT Chain."}</p>
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  <div className="font-medium text-slate-700">{new Date(record.updatedAt || record.createdAt).toLocaleString()}</div>
                  <div className={`mt-1 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    record.status === "confirmed" ? "bg-emerald-50 text-emerald-700" : record.status === "failed" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    <Sparkles className="h-3.5 w-3.5" />
                    {record.status === "confirmed" ? "Verified" : record.status === "failed" ? "Retry needed" : "Pending consent write"}
                  </div>
                </div>
              </div>
              <div className="mt-3 rounded-xl bg-slate-50 p-3 font-mono text-xs text-slate-600">
                {record.recordHash ? `${record.recordHash.slice(0, 24)}...` : "Hash will appear after on-chain confirmation"}
              </div>
              {record.transactionHash && record.explorerUrl ? (
                <a
                  href={record.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-emerald-700"
                >
                  Open transaction
                  <Sparkles className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
