"use client";

import { CheckCircle2, WifiOff } from "lucide-react";

interface ConnectedDevicesProps {
  devices: Array<{ name: string; online: boolean }>;
}

export default function ConnectedDevices({ devices }: ConnectedDevicesProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Live Device Status</h3>
      <div className="mt-4 space-y-3">
        {devices.map((device) => (
          <div key={device.name} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="text-sm font-medium text-slate-700">{device.name}</span>
            {device.online ? (
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                <WifiOff className="h-4 w-4" />
                Offline
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
