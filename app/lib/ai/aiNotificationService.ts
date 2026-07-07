import type { AIResult } from "../AICoreEngine";
import { appendToArray, readJSON, STORAGE_KEYS, writeJSON } from "../storage/storageService";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: "Critical" | "Alert" | "Info" | "Appointment" | "Medication" | "Vaccine";
  createdAt: string;
  read?: boolean;
  source?: "orchestrator" | "system";
};

export function pushNotification(
  notification: Omit<AppNotification, "id" | "createdAt"> & {
    id?: string;
    createdAt?: string;
  }
) {
  const item: AppNotification = {
    id: notification.id ?? crypto.randomUUID(),
    createdAt: notification.createdAt ?? new Date().toISOString(),
    ...notification,
    source: notification.source ?? "orchestrator",
  };

  appendToArray<AppNotification>(STORAGE_KEYS.notifications, item);
  return item;
}

export function pushAlertsFromAI(result: AIResult) {
  if (result.alerts.length === 0) return [];

  return [
    pushNotification({
      title: "AI Alert",
      message: result.alerts.join(", "),
      type: result.risk === "HIGH" ? "Critical" : "Alert",
    }),
  ];
}

export function pushRecommendationNotifications(result: AIResult) {
  return result.recommendations.map((rec) =>
    pushNotification({
      title: "AI Recommendation",
      message: rec,
      type: "Info",
    })
  );
}

export function getNotifications(): AppNotification[] {
  return readJSON<AppNotification[]>(STORAGE_KEYS.notifications, []);
}

export function markNotificationRead(id: string) {
  const list = getNotifications().map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  writeJSON(STORAGE_KEYS.notifications, list);
}
