"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useMamaCareAppState } from "../../hooks/useMamaCareAppState";
import { useCareWorkflow } from "../../hooks/useCareWorkflow";
import { useNotifications } from "../../hooks/useNotifications";

type MamaCareContextValue = ReturnType<typeof useMamaCareAppState> & {
  workflow: ReturnType<typeof useCareWorkflow>;
  notifications: ReturnType<typeof useNotifications>;
};

const MamaCareContext = createContext<MamaCareContextValue | null>(null);

export function MamaCareProvider({ children }: { children: ReactNode }) {
  const app = useMamaCareAppState();
  const workflow = useCareWorkflow();
  const notifications = useNotifications();

  return (
    <MamaCareContext.Provider value={{ ...app, workflow, notifications }}>
      {children}
    </MamaCareContext.Provider>
  );
}

export function useMamaCare() {
  const ctx = useContext(MamaCareContext);
  if (!ctx) {
    throw new Error("useMamaCare must be used within MamaCareProvider");
  }
  return ctx;
}

/** Optional hook for components outside the provider tree */
export function useMamaCareOptional() {
  return useContext(MamaCareContext);
}
