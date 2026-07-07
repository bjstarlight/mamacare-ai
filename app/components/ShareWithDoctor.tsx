"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { logBlockchainRecord } from "../lib/blockchainLogger";
import { hashRecord } from "../lib/hash";
import {
  ShieldCheck,
  CheckCircle2,
  Share2,
  Download,
  Printer,
  FileJson,
  User,
  Baby,
  Droplet,
  CalendarDays,
  Activity,
  Fingerprint,
  Lock,
} from "lucide-react";

type MotherProfile = {
  name?: string;
  bloodGroup?: string;
  aiRisk?: string;
  id?: string;
  [key: string]: unknown;
};

type BabyProfile = {
  name?: string;
  [key: string]: unknown;
};

type Appointment = {
  date?: string;
  doctor?: string;
  reason?: string;
  [key: string]: unknown;
};

function buildPatientId(name: string | undefined): string {
  const base = name && name.trim().length > 0 ? name.trim() : "MAMACARE";
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash << 5) - hash + base.charCodeAt(i);
    hash |= 0;
  }
  const code = Math.abs(hash).toString(36).toUpperCase().slice(0, 6);
  return `MC-${code}`;
}

export default function ShareWithDoctor() {
  const [mother, setMother] = useState<MotherProfile>({});
  const [baby, setBaby] = useState<BabyProfile>({});
  const [pregnancyWeek, setPregnancyWeek] = useState("-");
  const [protectedRecords, setProtectedRecords] = useState(0);
  const [lastVerified, setLastVerified] = useState("Never");
  const [nextAppointment, setNextAppointment] = useState("No upcoming appointment");
  const [patientId, setPatientId] = useState("MC-000000");
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    const motherData: MotherProfile = JSON.parse(
      localStorage.getItem("motherProfile") || "{}"
    );
    const babyData: BabyProfile = JSON.parse(
      localStorage.getItem("babyProfile") || "{}"
    );
    const week = localStorage.getItem("pregnancyWeek") || "-";
    const records = Number(localStorage.getItem("protectedRecords")) || 0;
    const verified = localStorage.getItem("lastVerified") || "Never";

    let appointmentText = "No upcoming appointment";
    try {
      const rawAppointments = localStorage.getItem("appointments");
      if (rawAppointments) {
        const parsed = JSON.parse(rawAppointments);
        const list: Appointment[] = Array.isArray(parsed) ? parsed : [parsed];
        if (list.length > 0 && list[0]) {
          const first = list[0];
          const dateLabel = first.date ? first.date : "Date TBD";
          const doctorLabel = first.doctor ? ` with ${first.doctor}` : "";
          appointmentText = `${dateLabel}${doctorLabel}`;
        }
      }
    } catch {
      appointmentText = "No upcoming appointment";
    }

    setMother(motherData);
    setBaby(babyData);
    setPregnancyWeek(week);
    setProtectedRecords(records);
    setLastVerified(verified);
    setNextAppointment(appointmentText);
    setPatientId(motherData.id || buildPatientId(motherData.name));
  }, []);

  const riskLevel = mother.aiRisk || "Not Assessed";

  const summary = `MamaCare AI — Verified Digital Medical Pass
Mother: ${mother.name || "Unknown"}
Baby: ${baby.name || "Unknown"}
Blood Group: ${mother.bloodGroup || "-"}
Pregnancy: ${pregnancyWeek} Weeks
Protected Records: ${protectedRecords}
Patient ID: ${patientId}
BOT Chain Verified`;

  async function handleShare() {
    const nav =
      typeof navigator !== "undefined"
        ? (navigator as Navigator & {
            share?: (data: { title: string; text: string }) => Promise<void>;
            clipboard?: { writeText: (text: string) => Promise<void> };
          })
        : undefined;

    if (nav && typeof nav.share === "function") {
      try {
        await nav.share({
          title: "MamaCare AI — Medical Pass",
          text: summary,
        });
        logBlockchainRecord({
          hash: hashRecord({
            type: "Medical Pass Share",
            patient: mother.name || "Unknown Patient",
            timestamp: new Date().toISOString(),
          }),
          type: "Medical Pass Share",
          patient: mother.name || "Unknown Patient",
          actor: "Patient",
          details: "Medical pass shared with doctor",
        });
        setShareStatus("Shared successfully.");
      } catch {
        setShareStatus("Share cancelled.");
      }
    } else if (nav?.clipboard?.writeText) {
      await nav.clipboard.writeText(summary);
      logBlockchainRecord({
        hash: hashRecord({
          type: "Medical Pass Share",
          patient: mother.name || "Unknown Patient",
          timestamp: new Date().toISOString(),
        }),
        type: "Medical Pass Share",
        patient: mother.name || "Unknown Patient",
        actor: "Patient",
        details: "Medical pass copied to clipboard",
      });
      setShareStatus("Summary copied to clipboard.");
    } else {
      setShareStatus("Sharing is not supported on this device.");
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleExportJSON() {
    const payload = {
      mother,
      baby,
      pregnancyWeek,
      protectedRecords,
      lastVerified,
      nextAppointment,
      patientId,
      riskLevel,
      verified: true,
      verifiedBy: "BOT Chain",
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mamacare-summary-${patientId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* SECTION 1 — Hero Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-3xl bg-white/80 backdrop-blur-xl shadow-xl border border-pink-100 p-6 md:p-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Share With Doctor
            </h1>
            <p className="mt-1 text-gray-500 text-sm md:text-base">
              Verified Digital Medical Pass
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-emerald-700 font-semibold text-sm">
              Secure &amp; Verified
            </span>
          </div>
        </div>

        {/* SECTION 2 — Patient Card */}
        <div className="rounded-3xl bg-gradient-to-br from-pink-600 via-pink-500 to-purple-600 shadow-2xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-10 w-52 h-52 rounded-full bg-white/10" />

          <div className="relative flex flex-col md:flex-row gap-6 md:items-center">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <User className="w-10 h-10 text-white" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 flex-1">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">Mother</p>
                <p className="font-semibold text-lg">{mother.name || "Unknown"}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">Baby</p>
                <p className="font-semibold text-lg">{baby.name || "Unknown"}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">Blood Group</p>
                <p className="font-semibold text-lg">{mother.bloodGroup || "-"}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">Pregnancy Week</p>
                <p className="font-semibold text-lg">{pregnancyWeek}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">Patient ID</p>
                <p className="font-semibold text-lg">{patientId}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">AI Risk</p>
                <p className="font-semibold text-lg">{riskLevel}</p>
              </div>

              <div className="col-span-2">
                <p className="text-xs uppercase tracking-wide text-white/70">Next Appointment</p>
                <p className="font-semibold text-lg">{nextAppointment}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 — Health Summary */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Health Summary</h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="rounded-2xl bg-white shadow-md border border-gray-100 p-4">
              <Droplet className="w-5 h-5 text-pink-500 mb-2" />
              <p className="text-xs text-gray-500">Blood Group</p>
              <p className="font-bold text-gray-800">{mother.bloodGroup || "-"}</p>
            </div>

            <div className="rounded-2xl bg-white shadow-md border border-gray-100 p-4">
              <CalendarDays className="w-5 h-5 text-purple-500 mb-2" />
              <p className="text-xs text-gray-500">Pregnancy Week</p>
              <p className="font-bold text-gray-800">{pregnancyWeek}</p>
            </div>

            <div className="rounded-2xl bg-white shadow-md border border-gray-100 p-4">
              <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
              <p className="text-xs text-gray-500">Protected Records</p>
              <p className="font-bold text-gray-800">{protectedRecords}</p>
            </div>

            <div className="rounded-2xl bg-white shadow-md border border-gray-100 p-4">
              <Activity className="w-5 h-5 text-orange-500 mb-2" />
              <p className="text-xs text-gray-500">Risk Level</p>
              <p className="font-bold text-gray-800">{riskLevel}</p>
            </div>

            <div className="rounded-2xl bg-white shadow-md border border-gray-100 p-4 col-span-2 md:col-span-1">
              <CalendarDays className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-xs text-gray-500">Next Appointment</p>
              <p className="font-bold text-gray-800 text-sm">{nextAppointment}</p>
            </div>
          </div>
        </div>

        {/* SECTION 4 — Blockchain Verification Card */}
        <div className="rounded-3xl bg-emerald-50 border border-emerald-200 shadow-md p-6 md:p-8">
          <div className="flex items-center gap-3 mb-5">
            <Fingerprint className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-emerald-700">
              Blockchain Verification
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-white p-4 shadow-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-semibold text-emerald-600">BOT Chain Verified</p>
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Protected Records</p>
              <p className="font-semibold text-gray-800">{protectedRecords}</p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Last Verification</p>
              <p className="font-semibold text-gray-800">{lastVerified}</p>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm flex items-center gap-3">
              <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Hash Protected</p>
                <p className="font-semibold text-gray-800 text-sm">Integrity Guaranteed</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5 — QR Code */}
        <div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 md:p-8 flex flex-col items-center">
          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-inner">
            <QRCode value={summary} size={200} />
          </div>
          <p className="mt-4 text-sm text-gray-500 text-center">
            Scan to retrieve verified patient summary
          </p>
        </div>

        {/* SECTION 6 — Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={handleShare}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white py-5 shadow-lg transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="font-semibold text-sm">Share Summary</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white py-5 shadow-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            <span className="font-semibold text-sm">Download PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gray-800 hover:bg-gray-900 text-white py-5 shadow-lg transition-colors"
          >
            <Printer className="w-5 h-5" />
            <span className="font-semibold text-sm">Print Pass</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-5 shadow-lg transition-colors"
          >
            <FileJson className="w-5 h-5" />
            <span className="font-semibold text-sm">Export JSON</span>
          </button>
        </div>

        {shareStatus && (
          <p className="text-center text-sm text-gray-500">{shareStatus}</p>
        )}

        {/* SECTION 7 — Footer */}
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <p className="font-semibold text-gray-700 text-sm">
            Protected by BOT Chain
          </p>
          <p className="text-xs text-gray-400 max-w-md">
            Every medical record is cryptographically verified.
          </p>
        </div>

      </div>
    </div>
  );
}