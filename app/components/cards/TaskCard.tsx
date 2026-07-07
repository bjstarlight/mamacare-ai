"use client";

import type { LucideIcon } from "lucide-react";

type TaskCardProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  status?: "pending" | "done" | "urgent";
  actionLabel?: string;
  onAction?: () => void;
};

export default function TaskCard({
  title,
  description,
  icon: Icon,
  status = "pending",
  actionLabel,
  onAction,
}: TaskCardProps) {
  const statusStyles = {
    pending: "border-[#EFE4DC] bg-[#FFF9F4]",
    done: "border-emerald-200 bg-emerald-50",
    urgent: "border-red-200 bg-red-50",
  };

  return (
    <div className={`rounded-xl border p-4 ${statusStyles[status]}`}>
      <div className="flex items-start gap-3">
        {Icon ? (
          <div className="rounded-lg bg-white/80 p-2">
            <Icon className="h-4 w-4 text-[#6B2545]" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#2B2118]">{title}</p>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-[#8A7A6D]">{description}</p>
          ) : null}
          {actionLabel && onAction ? (
            <button
              type="button"
              onClick={onAction}
              className="mt-3 text-xs font-semibold text-[#6B2545] hover:underline"
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
