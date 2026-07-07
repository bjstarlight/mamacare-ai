"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import AppShell from "./components/AppShell";
import DashboardModule from "./components/modules/DashboardModule";
import {
  AIModule,
  AppointmentsModule,
  BabyModule,
  DoctorModule,
  EmergencyModule,
  GovernmentModule,
  MotherModule,
  NotificationsModule,
  PregnancyModule,
  SettingsModule,
  WalletModule,
} from "./components/modules/CareModules";
import EmergencySOS from "./components/EmergencySOS";
import NearbyHospitals from "./components/NearbyHospitals";
import AIHealthRisk from "./components/AIHealthRisk";
import ModuleSection from "./components/layout/ModuleSection";
import { useMamaCare } from "./components/providers/MamaCareProvider";
import { normalizeSection, type AppSection } from "./config/productFlow";
import { readString, STORAGE_KEYS } from "./lib/storage/storageService";

export default function Home() {
  const router = useRouter();
  const app = useMamaCare();

  useEffect(() => {
    if (readString(STORAGE_KEYS.onboardingComplete) !== "true") {
      router.replace("/welcome");
    }
  }, [router]);

  function openSection(section: AppSection | string, subview?: string) {
    app.navigateTo(normalizeSection(section), subview);
  }

  const sharedModuleProps = {
    babyAge: app.babyAge,
    bottomRef: app.bottomRef,
    checkPregnancyWeek: app.checkPregnancyWeek,
    checkVaccines: app.checkVaccines,
    dueVaccines: app.dueVaccines,
    loading: app.loading,
    message: app.message,
    messages: app.messages,
    pregnancyWeek: app.pregnancyWeek,
    quickQuestion: app.quickQuestion,
    sendMessage: app.sendMessage,
    setActiveSection: app.setActiveSection,
    setBabyAge: app.setBabyAge,
    setMessage: app.setMessage,
    setPregnancyWeek: app.setPregnancyWeek,
    vaccines: app.vaccines,
    weekAdvice: app.weekAdvice,
  };

  function handleOrchestratorRefresh() {
    app.refreshAI();
    app.hydrateFromStorage();
    app.workflow.refresh();
    app.notifications.refresh();
  }

  return (
    <AppShell activeSection={app.activeSection} onNavigate={openSection}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-0">
        {app.activeSection === "dashboard" && (
          <DashboardModule
            babyAgeText={app.babyAgeText}
            hasPregnancyProgress={app.hasPregnancyProgress}
            journeyPercent={app.journeyPercent}
            motherName={app.motherName}
            pregnancyWeek={app.pregnancyWeek}
            protectedRecords={app.protectedRecords}
            lastVerified={app.lastVerified}
            quickQuestion={app.quickQuestion}
            openSection={openSection}
            weekNumber={app.weekNumber}
            orchestratorResult={app.orchestratorResult}
            onOrchestratorRefresh={handleOrchestratorRefresh}
            isFirstVisit={app.workflow.isFirstVisit}
            workflowSteps={app.workflow.firstVisitSteps}
            completedStepIds={app.workflow.workflow.completedSteps}
            currentStepId={app.workflow.workflow.currentStepId}
            workflowProgress={app.workflow.progressPercent}
            returningSteps={app.workflow.returningSteps}
            recentNotifications={app.notifications.notifications}
            onMarkNotificationRead={app.notifications.markRead}
            messages={app.messages}
          />
        )}

        {app.activeSection === "ai" && <AIModule {...sharedModuleProps} />}
        {app.activeSection === "pregnancy" && (
          <PregnancyModule {...sharedModuleProps} />
        )}
        {app.activeSection === "mother" && (
          <MotherModule setActiveSection={app.setActiveSection} />
        )}
        {app.activeSection === "baby" && (
          <BabyModule {...sharedModuleProps} activeSubview={app.activeSubview} />
        )}
        {app.activeSection === "emergency" && (
          <EmergencyModule setActiveSection={app.setActiveSection} />
        )}
        {app.activeSection === "wallet" && (
          <WalletModule setActiveSection={app.setActiveSection} />
        )}
        {app.activeSection === "doctor" && (
          <DoctorModule {...sharedModuleProps} />
        )}
        {app.activeSection === "government" && (
          <GovernmentModule setActiveSection={app.setActiveSection} />
        )}
        {app.activeSection === "appointments" && (
          <AppointmentsModule setActiveSection={app.setActiveSection} />
        )}
        {app.activeSection === "notifications" && (
          <NotificationsModule setActiveSection={app.setActiveSection} />
        )}
        {app.activeSection === "settings" && (
          <SettingsModule setActiveSection={app.setActiveSection} />
        )}

        {app.showSymptomChecker && (
          <div className="mt-6">
            <ModuleSection title="Symptom Review" icon={AlertTriangle}>
              <p className="text-sm leading-6 text-[#4A5170]">
                Before giving advice, please consider age, symptom duration,
                fever, feeding or drinking changes, and danger signs.
              </p>
            </ModuleSection>
          </div>
        )}

        {app.emergency && (
          <div className="mt-6 rounded-2xl border-2 border-red-600 bg-red-50 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h2 className="text-lg font-bold text-red-700">
                Medical Emergency
              </h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-red-800">
              The symptoms described may require urgent medical attention.
              Please proceed to the nearest hospital immediately while
              continuing safe first aid where appropriate.
            </p>
            <div className="mt-4 space-y-4">
              <EmergencySOS />
              <NearbyHospitals />
              <AIHealthRisk />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
