"use client";

import { AlertCircle, Bell } from "lucide-react";

interface DoctorAlertsProps {
  alerts: string[];
}

export default function DoctorAlerts({ alerts }: DoctorAlertsProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-amber-600" />
        <h3 className="text-lg font-semibold text-slate-900">Doctor Notifications</h3>
      </div>
      <div className="mt-4 space-y-3">
        {alerts.map((alert) => (
          <div key={alert} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600" />
            <p className="text-sm text-slate-700">{alert}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
