"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  Ambulance,
  ShieldCheck,
  Sparkles,
  ArrowDownToLine,
  ArrowUpFromLine,
  Siren,
  Clock,
} from "lucide-react";

import HospitalCapacityCard from "./HospitalCapacityCard";
import IncomingReferrals from "./IncomingReferrals";
import OutgoingReferrals from "./OutgoingReferrals";
import AIHospitalRecommendation from "./AIHospitalRecommendation";
import HospitalTimeline from "./HospitalTimeline";
import IncomingAmbulances from "./IncomingAmbulances";

type Hospital = {
  id: number;
  name: string;
  capacity: number;
  labour: number;
  nicu: number;
  icu: number;
  emergency: "High" | "Medium" | "Low" | string;
};

const defaultHospitals: Hospital[] = [
  {
    id: 1,
    name: "Jos University Teaching Hospital",
    capacity: 82,
    labour: 6,
    nicu: 5,
    icu: 3,
    emergency: "High",
  },
  {
    id: 2,
    name: "Plateau Specialist Hospital",
    capacity: 61,
    labour: 4,
    nicu: 2,
    icu: 2,
    emergency: "Medium",
  },
  {
    id: 3,
    name: "Bingham University Teaching Hospital",
    capacity: 73,
    labour: 5,
    nicu: 3,
    icu: 2,
    emergency: "High",
  },
  {
    id: 4,
    name: "Vom Christian Hospital",
    capacity: 48,
    labour: 2,
    nicu: 1,
    icu: 1,
    emergency: "Low",
  },
];

// Capacity bar color reflects real ER load, not decoration — this is
// one of the few places outside the emergency screens where red is
// justified, because it's reporting genuine operational strain.
function capacityTone(capacity: number) {
  if (capacity >= 80) return { bar: "bg-red-500", text: "text-red-700" };
  if (capacity >= 60) return { bar: "bg-amber-500", text: "text-amber-700" };
  return { bar: "bg-emerald-500", text: "text-emerald-700" };
}

function emergencyBadgeTone(level: string) {
  if (level === "High") return "bg-red-50 text-red-700 border-red-200";
  if (level === "Medium") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

function SectionEyebrow({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-[#35406B]" />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#35406B]">
        {label}
      </p>
    </div>
  );
}

export default function HospitalNetworkDashboard() {
  const [hospitals, setHospitals] = useState<Hospital[]>(defaultHospitals);
  const [protectedRecords, setProtectedRecords] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("hospitalDirectory");

    if (saved) {
      setHospitals(JSON.parse(saved));
    } else {
      localStorage.setItem(
        "hospitalDirectory",
        JSON.stringify(defaultHospitals)
      );
    }

    setProtectedRecords(Number(localStorage.getItem("protectedRecords")) || 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#FBF6F1]">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="bg-linear-to-br from-[#35406B] to-[#2A3354] text-white px-8 py-8">
        <div className="flex items-center gap-3">
          <Building2 size={34} className="text-[#F3B091]" />
          <div>
            <h1 className="font-serif text-3xl font-semibold">
              MamaCare Hospital Network
            </h1>
            <p className="text-white/70 mt-0.5">
              Multi-Hospital Emergency Coordination
            </p>
          </div>
        </div>

        {/* Signature element: a live capacity strip, so the network's
            real-time load is visible before scrolling to any
            sub-component. */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {hospitals.map((h) => {
            const tone = capacityTone(h.capacity);
            return (
              <div
                key={h.id}
                className="rounded-xl bg-white/10 backdrop-blur-sm p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-white/90 truncate">
                    {h.name}
                  </p>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${emergencyBadgeTone(
                      h.emergency
                    )}`}
                  >
                    {h.emergency}
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-white/20">
                  <div
                    className={`h-1.5 rounded-full ${tone.bar}`}
                    style={{ width: `${h.capacity}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-white/60">
                  {h.capacity}% capacity
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-8 space-y-10">

        {/* ── Unified stats ledger — one card, four columns, instead
            of four repeated boxes — matches the ledger structure used
            in ShareWithDoctor's verification card. ─────────────────── */}
        <div className="rounded-2xl bg-white border border-[#EFE4DC] shadow-sm divide-y sm:divide-y-0 sm:divide-x divide-[#EFE4DC] grid grid-cols-1 sm:grid-cols-4">
          <StatCell
            icon={Building2}
            iconTone="text-[#35406B]"
            value={hospitals.length}
            label="Connected Hospitals"
            tag="Live"
            tagTone="bg-emerald-50 text-emerald-700"
          />
          <StatCell
            icon={Users}
            iconTone="text-[#B5533F]"
            value={126}
            label="Patients Today"
            tag="Illustrative"
            tagTone="bg-amber-50 text-amber-700"
          />
          <StatCell
            icon={Ambulance}
            iconTone="text-[#35406B]"
            value={8}
            label="Active Referrals"
            tag="Illustrative"
            tagTone="bg-amber-50 text-amber-700"
          />
          <StatCell
            icon={ShieldCheck}
            iconTone="text-emerald-600"
            value={protectedRecords}
            label="BOT Chain Verified Records"
            tag="Live"
            tagTone="bg-emerald-50 text-emerald-700"
          />
        </div>

        {/* ── Network capacity detail ─────────────────────────── */}
        <div>
          <SectionEyebrow icon={Building2} label="Network Capacity" />
          <HospitalCapacityCard hospitals={hospitals} />
        </div>

        {/* ── AI recommendation gets its own visual weight, since
            it's the most differentiated feature on this page. ───── */}
        <div>
          <SectionEyebrow icon={Sparkles} label="AI Hospital Recommendation" />
          <AIHospitalRecommendation hospitals={hospitals} />
        </div>

        {/* ── Referrals ────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <SectionEyebrow icon={ArrowDownToLine} label="Incoming Referrals" />
            <IncomingReferrals />
          </div>
          <div>
            <SectionEyebrow icon={ArrowUpFromLine} label="Outgoing Referrals" />
            <OutgoingReferrals />
          </div>
        </div>

        {/* ── Ambulances + timeline ───────────────────────────── */}
        <div>
          <SectionEyebrow icon={Siren} label="Incoming Ambulances" />
          <IncomingAmbulances />
        </div>

        <div>
          <SectionEyebrow icon={Clock} label="Network Timeline" />
          <HospitalTimeline />
        </div>

      </div>

    </div>
  );
}

function StatCell({
  icon: Icon,
  iconTone,
  value,
  label,
  tag,
  tagTone,
}: {
  icon: React.ElementType;
  iconTone: string;
  value: number;
  label: string;
  tag: string;
  tagTone: string;
}) {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <Icon className={`h-5 w-5 ${iconTone}`} />
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tagTone}`}>
          {tag}
        </span>
      </div>
      <h2 className="mt-3 text-3xl font-bold text-[#2B2118]">{value}</h2>
      <p className="text-sm text-[#8a7a6d]">{label}</p>
    </div>
  );
}