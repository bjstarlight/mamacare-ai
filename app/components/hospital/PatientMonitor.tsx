"use client";

import { Search, UserCircle2 } from "lucide-react";
import type { PatientRecord } from "./types";

interface PatientMonitorProps {
  patients: PatientRecord[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedPatient: PatientRecord;
  onSelectPatient: (patient: PatientRecord) => void;
}

export default function PatientMonitor({
  patients,
  searchTerm,
  onSearchChange,
  selectedPatient,
  onSelectPatient,
}: PatientMonitorProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-400">Patient Monitor</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Search and open the EMR</h2>
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-300">
          <UserCircle2 className="h-5 w-5" />
        </div>
      </div>

      <label className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-3 text-sm text-slate-400">
        <Search className="h-4 w-4" />
        <input
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name, patient ID, phone or QR code"
          className="w-full bg-transparent outline-none"
        />
      </label>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          {patients.map((patient) => (
            <button
              key={patient.id}
              onClick={() => onSelectPatient(patient)}
              className={`w-full rounded-2xl border p-3 text-left transition ${selectedPatient.id === patient.id ? "border-cyan-500/40 bg-cyan-500/10" : "border-slate-800 bg-slate-950/50 hover:border-slate-700"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-white">{patient.name}</p>
                  <p className="text-sm text-slate-400">{patient.id}</p>
                </div>
                <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">{patient.status}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">EMR Snapshot</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{selectedPatient.name}</h3>
          <p className="mt-1 text-sm text-slate-400">{selectedPatient.condition}</p>

          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="flex justify-between"><span>Patient ID</span><span className="text-white">{selectedPatient.id}</span></div>
            <div className="flex justify-between"><span>Phone</span><span className="text-white">{selectedPatient.phone}</span></div>
            <div className="flex justify-between"><span>QR Code</span><span className="text-white">{selectedPatient.qrCode}</span></div>
            <div className="flex justify-between"><span>Weeks</span><span className="text-white">{selectedPatient.weeks}w</span></div>
          </div>

          <p className="mt-4 text-sm text-slate-300">{selectedPatient.summary}</p>
          <button className="mt-5 rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400">
            Open Full Record
          </button>
        </div>
      </div>
    </section>
  );
}
