"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getNotifications,
  markNotificationRead,
  type AppNotification,
} from "../lib/ai/aiNotificationService";
import { subscribeStorage, STORAGE_KEYS } from "../lib/storage/storageService";

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refresh = useCallback(() => {
    setNotifications(getNotifications());
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeStorage((key) => {
      if (key === STORAGE_KEYS.notifications) refresh();
    });

    return () => {
      unsubscribe();
    };
  }, [refresh]);

  const markRead = useCallback(
    (id: string) => {
      markNotificationRead(id);
      refresh();
    },
    [refresh]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, refresh, markRead };
}
