"use client";

import { AlertTriangle, Bell, Info } from "lucide-react";
import type { AppNotification } from "../../lib/ai/aiNotificationService";

type AIAlertCardProps = {
  notification: AppNotification;
  onMarkRead?: (id: string) => void;
};

export default function AIAlertCard({ notification, onMarkRead }: AIAlertCardProps) {
  const isCritical = notification.type === "Critical";
  const isAlert = notification.type === "Alert";

  const Icon = isCritical ? AlertTriangle : isAlert ? Bell : Info;

  return (
    <div
      className={`rounded-xl border p-4 ${
        isCritical
          ? "border-red-200 bg-red-50"
          : isAlert
            ? "border-amber-200 bg-amber-50"
            : "border-[#EFE4DC] bg-[#FFF9F4]"
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`h-4 w-4 shrink-0 ${
            isCritical ? "text-red-600" : isAlert ? "text-amber-600" : "text-[#6B2545]"
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#2B2118]">{notification.title}</p>
          <p className="mt-1 text-xs leading-5 text-[#5C4C40]">{notification.message}</p>
          <p className="mt-2 text-[10px] uppercase tracking-wide text-[#8A7A6D]">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>
        {!notification.read && onMarkRead ? (
          <button
            type="button"
            onClick={() => onMarkRead(notification.id)}
            className="shrink-0 text-xs font-semibold text-[#6B2545] hover:underline"
          >
            Mark read
          </button>
        ) : null}
      </div>
    </div>
  );
}
