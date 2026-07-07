"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import PortalLayout from "../components/layout/PortalLayout";
import { hashRecord } from "../lib/hash";
import { logBlockchainRecord } from "../lib/blockchainLogger";
import {
  verifyRecord,
  getRecordId,
  getRecord,
} from "../lib/medicalRecordService";

export default function VerifyPage() {
  const [text, setText] = useState("");

  const [loading, setLoading] = useState(false);

  const [verified, setVerified] = useState(false);

  const [record, setRecord] = useState<any>(null);

  async function verify() {
    try {
      setLoading(true);

      const hash = hashRecord({
        summary: text,
        category: "Clinical Summary",
      });

      const exists = await verifyRecord(hash);

      if (!exists) {
        setVerified(false);
        setRecord(null);

        alert("❌ Record not found on BOT Chain.");

        return;
      }

      const id = await getRecordId(hash);

      const blockchainRecord =
        await getRecord(Number(id));

      setVerified(true);

      logBlockchainRecord({
        hash: hashRecord({
          type: "Record Verification",
          recordHash: hash,
          timestamp: new Date().toISOString(),
        }),
        type: "Record Verification",
        patient: "Verified Record",
        actor: "Verifier",
        details: `Verified medical record ${hash.slice(0, 12)}`,
      });

      setRecord({
        hash: blockchainRecord[0],
        category: blockchainRecord[1],
        timestamp: new Date(
          Number(blockchainRecord[2]) * 1000
        ).toLocaleString(),
        owner: blockchainRecord[3],
      });

    } catch (err) {
      console.error(err);

      alert("Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PortalLayout
      title="Verify Medical Record"
      eyebrow="Blockchain"
      description="Verify that a clinical summary has not been altered on BOT Chain."
    >
    <div className="max-w-3xl">

      <div className="mt-8 rounded-3xl bg-gradient-to-r from-emerald-500 to-green-600 text-white p-8 shadow-xl">

<h2 className="text-3xl font-bold">
🛡 Medical Record Verification
</h2>

<p className="mt-3 opacity-90">
Verify that a patient's clinical record has not been altered since it was stored on BOT Chain.
</p>

</div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mt-8 w-full rounded-3xl border border-gray-200 bg-gray-50 p-6 h-56 shadow-inner"
        placeholder="Paste the Clinical Summary..."
      />

      <button
        onClick={verify}
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-emerald-600 py-3 text-white font-semibold hover:bg-emerald-700"
      >
        {loading
          ? "Checking BOT Chain..."
          : "Verify Record"}
      </button>

      {verified && record && (
  <div className="mt-8 relative overflow-hidden rounded-2xl border border-emerald-900/15 bg-white p-8 shadow-[0_1px_0_0_rgba(6,78,59,0.08),0_20px_40px_-24px_rgba(6,78,59,0.35)]">
    {/* certificate frame */}
    <div className="pointer-events-none absolute inset-3 rounded-xl border border-dashed border-emerald-900/15" />

    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex gap-5">
        {/* Seal */}
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-900 ring-4 ring-emerald-900/10">
          <div className="absolute inset-[3px] rounded-full border border-dashed border-white/40" />
          <Check className="h-7 w-7 text-white" strokeWidth={2.5} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700/70">
            BOT Chain Certificate
          </p>
          <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-emerald-950">
            Verification Passed
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-emerald-900/60">
            This medical record exactly matches the fingerprint stored on BOT Chain.
          </p>
        </div>
      </div>

      <span className="self-start rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap">
        Authentic
      </span>
    </div>

    {/* Ledger-style detail rows */}
    <dl className="relative mt-8 divide-y divide-emerald-900/10 border-y border-emerald-900/10">
      {[
        { label: "Blockchain", value: "BOT Chain" },
        { label: "Category", value: record.category },
        { label: "Protected on", value: record.timestamp },
        { label: "Record owner", value: record.owner, mono: true },
      ].map((row) => (
        <div
          key={row.label}
          className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between"
        >
          <dt className="text-xs uppercase tracking-wide text-emerald-900/45">
            {row.label}
          </dt>
          <dd
            className={`text-sm font-medium text-emerald-950 break-all sm:text-right sm:max-w-[60%] ${
              row.mono ? "font-mono" : ""
            }`}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>

    {/* Hash block */}
    <div className="relative mt-6 rounded-xl bg-emerald-950 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/70">
        SHA-256 Fingerprint
      </p>
      <p className="mt-2 break-all font-mono text-xs leading-relaxed text-emerald-50/90">
        {record.hash}
      </p>
    </div>

    <p className="relative mt-6 text-center text-sm text-emerald-900/60">
      This record has not been altered since it was secured on BOT Chain.
    </p>
  </div>
)}
    </div>
    </PortalLayout>
  );
}