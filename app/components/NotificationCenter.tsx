"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, ChevronDown, ChevronUp, Filter } from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  type AppNotification,
} from "../lib/ai/aiNotificationService";
import { readJSON, STORAGE_KEYS, subscribeStorage } from "../lib/storage/storageService";
import { syncMedicationSupplementAgent } from "../lib/medications/medicationSupplementAgent";

type DisplayNotification = AppNotification & { synthetic?: boolean };
type NotificationFilter = "all" | "critical" | "medication" | "appointment";

// Shown per "page" — keeps the card compact so the blockchain transaction
// history below it stays reachable without endless scrolling past a
// growing notification feed.
const PAGE_SIZE = 6;
// Belt-and-suspenders cap: even if a page's messages run long, the list
// itself never grows past this height — it scrolls internally instead.
const LIST_MAX_HEIGHT = "26rem";

function buildNotificationList(): DisplayNotification[] {
  const list: DisplayNotification[] = [...getNotifications()];

  const appointments = readJSON<{ type?: string; title?: string; date?: string }[]>(
    STORAGE_KEYS.appointments,
    []
  );
  if (appointments.length > 0) {
    const next = appointments[0];
    const label = next.title ?? next.type ?? "Care visit";
    const dateLabel = next.date ? new Date(next.date).toLocaleString() : "Date not set";
    list.push({
      id: "synthetic-appointment",
      title: "Appointment",
      message: `Upcoming: ${label} on ${dateLabel}`,
      type: "Appointment",
      createdAt: new Date().toISOString(),
      synthetic: true,
    });
  }

  const medicines = readJSON<{ name: string }[]>(STORAGE_KEYS.medications, []);
  if (medicines.length > 0) {
    list.push({
      id: "synthetic-medication",
      title: "Medication",
      message: `Remember to take ${medicines[0].name} today`,
      type: "Medication",
      createdAt: new Date().toISOString(),
      synthetic: true,
    });
  }

  const medicationAgent = syncMedicationSupplementAgent();
  if (medicationAgent.missedDoses.length > 0) {
    list.push({
      id: "synthetic-medication-missed",
      title: "Missed medication doses",
      message: `${medicationAgent.missedDoses.length} missed today. Open Medication & Supplement Agent to update status.`,
      type: "Medication",
      createdAt: new Date().toISOString(),
      synthetic: true,
    });
  } else if (medicationAgent.upcomingDoses.length > 0) {
    const nextDose = medicationAgent.upcomingDoses[0];
    list.push({
      id: "synthetic-medication-next",
      title: "Upcoming medication reminder",
      message: `${nextDose.name} (${nextDose.dosage}) at ${nextDose.time}`,
      type: "Medication",
      createdAt: new Date().toISOString(),
      synthetic: true,
    });
  }

  const baby = readJSON<{ name?: string }>(STORAGE_KEYS.babyProfile, {});
  if (!baby.name) {
    list.push({
      id: "synthetic-baby",
      title: "Baby Profile",
      message: "Complete your baby's profile.",
      type: "Info",
      createdAt: new Date().toISOString(),
      synthetic: true,
    });
  }

  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "medication", label: "Medication" },
  { id: "appointment", label: "Appointments" },
] as const;

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<DisplayNotification[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const refresh = useCallback(() => {
    setNotifications(buildNotificationList());
  }, []);

  useEffect(() => {
    refresh();
    const unsub = subscribeStorage((key) => {
      if (
        key === STORAGE_KEYS.notifications ||
        key === STORAGE_KEYS.appointments ||
        key === STORAGE_KEYS.medications ||
        key === STORAGE_KEYS.medicationRegistry ||
        key === STORAGE_KEYS.medicationDoseLogs ||
        key === STORAGE_KEYS.babyProfile
      ) {
        refresh();
      }
    });
    const timer = window.setInterval(refresh, 5000);
    return () => {
      unsub();
      window.clearInterval(timer);
    };
  }, [refresh]);

  // Reset back to the first page whenever the filter changes, so
  // switching filters never leaves you mid-scroll in a stale position.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter]);

  function handleMarkRead(id: string) {
    if (id.startsWith("synthetic-")) return;
    markNotificationRead(id);
    refresh();
  }

  const filteredNotifications = notifications.filter((note) => {
    if (filter === "all") return true;
    if (filter === "critical") return note.type === "Critical" || note.type === "Alert";
    if (filter === "medication") return note.type === "Medication";
    if (filter === "appointment") return note.type === "Appointment";
    return true;
  });

  const visibleNotifications = filteredNotifications.slice(0, visibleCount);
  const hasMore = filteredNotifications.length > visibleCount;
  const canCollapse = visibleCount > PAGE_SIZE;

  return (
    <div className="rounded-2xl border border-[#EFE4DC] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-[#6B2545]" />
          <h2 className="text-lg font-semibold text-[#2B2118]">Notifications</h2>
        </div>
        {filteredNotifications.length > 0 && (
          <span
            className="text-xs font-medium text-[#8A7A6D]"
            role="status"
            aria-live="polite"
          >
            Showing {visibleNotifications.length} of {filteredNotifications.length}
          </span>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#8A7A6D]">
          <Filter className="h-3.5 w-3.5" />
          Filter
        </span>
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              filter === item.id
                ? "bg-[#6B2545] text-white"
                : "border border-[#EFE4DC] bg-[#FFF9F4] text-[#6F6258] hover:bg-[#FFF3E9]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filteredNotifications.length === 0 ? (
        <p className="text-sm text-[#8A7A6D]" role="status">
          You&apos;re all caught up!
        </p>
      ) : (
        <>
          {/* Fixed-height, internally scrolling feed — the card's overall
              height stays predictable regardless of how many
              notifications exist or how long their messages are. */}
          <ul
            className="space-y-3 overflow-y-auto pr-1"
            style={{ maxHeight: LIST_MAX_HEIGHT }}
            aria-label="Notifications"
          >
            {visibleNotifications.map((note) => (
              <li
                key={note.id}
                className={`rounded-xl border p-4 transition-colors ${
                  note.type === "Critical"
                    ? "border-red-200 bg-red-50"
                    : note.type === "Alert"
                      ? "border-amber-200 bg-amber-50"
                      : note.read
                        ? "border-[#EFE4DC] bg-[#FFF9F4]"
                        : "border-[#E8D3E0] bg-[#FFF3E9]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#2B2118]">{note.title}</h3>
                    <p className="mt-1 text-sm text-[#5C4C40]">{note.message}</p>
                    <p className="mt-2 text-xs text-[#8A7A6D]">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!note.read && !note.synthetic ? (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(note.id)}
                      className="shrink-0 text-xs font-semibold text-[#6B2545] hover:underline focus:outline-none focus:ring-2 focus:ring-[#6B2545]/40 rounded"
                    >
                      Mark read
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination controls — keeps the surrounding page (and the
              blockchain transaction history below it) at a predictable
              height instead of growing with every new notification. */}
          {(hasMore || canCollapse) && (
            <div className="mt-3 flex items-center justify-center gap-3 border-t border-[#EFE4DC] pt-3">
              {canCollapse && (
                <button
                  type="button"
                  onClick={() => setVisibleCount(PAGE_SIZE)}
                  className="inline-flex items-center gap-1 rounded-full border border-[#EFE4DC] bg-[#FFF9F4] px-3 py-1.5 text-xs font-semibold text-[#6F6258] hover:bg-[#FFF3E9] focus:outline-none focus:ring-2 focus:ring-[#6B2545]/40"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                  Previous
                </button>
              )}
              {hasMore && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                  className="inline-flex items-center gap-1 rounded-full bg-[#6B2545] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#7A2E52] focus:outline-none focus:ring-2 focus:ring-[#6B2545]/40"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  Load {Math.min(PAGE_SIZE, filteredNotifications.length - visibleCount)} more
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}