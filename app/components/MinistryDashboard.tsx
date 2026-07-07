"use client";

import { Building2, ShieldCheck, Users, Activity } from "lucide-react";

export default function MinistryDashboard() {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            <Building2 className="h-4 w-4" />
            Ministry of Health Dashboard
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Anonymized national maternal health view</h2>
          <p className="mt-2 text-sm text-slate-600">A different lens for policy, supervision, and funding decisions.</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <span className="font-semibold">Secure</span> • No patient names exposed
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Users className="h-4 w-4" />
            Nigeria • Plateau • Jos North
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pregnant women</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">12,480</p>
            </div>
            <div className="rounded-xl bg-white p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">High risk</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">1,860</p>
            </div>
            <div className="rounded-xl bg-white p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Emergency cases</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">214</p>
            </div>
            <div className="rounded-xl bg-white p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Vaccinations</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">9,320</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Activity className="h-4 w-4" />
            Referral network & hospital capacity
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-xl bg-white p-3">Maternal deaths: <span className="font-semibold text-slate-900">11</span></div>
            <div className="rounded-xl bg-white p-3">Referrals in transit: <span className="font-semibold text-slate-900">48</span></div>
            <div className="rounded-xl bg-white p-3">Hospitals at capacity: <span className="font-semibold text-slate-900">3</span></div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-4 w-4" />
          This ministry view demonstrates how the same BOT Chain foundation scales from patient care to public health governance.
        </div>
      </div>
    </section>
  );
}
