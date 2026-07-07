"use client";

import { AlertTriangle, Baby, Bot, HeartPulse, ShieldCheck, Siren } from "lucide-react";
import AICareCoordinator from "../AICareCoordinator";
import AIHealthRisk from "../AIHealthRisk";
import AIHealthScore from "../AIHealthScore";
import AIHealthSummary from "../AIHealthSummary";
import AIInsights from "../AIInsights";
import AIMaternalRiskPrediction from "../AIMaternalRiskPrediction";
import BabyGrowthPrediction from "../BabyGrowthPrediction";
import BabyProfile from "../BabyProfile";
import BlockchainAuditExplorer from "../BlockchainAuditExplorer";
import ChatScreen from "../ChatScreen";
import DoctorMode from "../DoctorMode";
import EmergencyRisk from "../EmergencyRisk";
import EmergencySOS from "../EmergencySOS";
import HealthAnalytics from "../HealthAnalytics";
import HealthWallet from "../HealthWallet";
import MedicationReminder from "../MedicationReminder";
import MinistryDashboard from "../MinistryDashboard";
import MotherProfile from "../MotherProfile";
import NearbyHospitals from "../NearbyHospitals";
import NotificationCenter from "../NotificationCenter";
import OfflineEmergencyMode from "../OfflineEmergencyMode";
import PopulationAnalyticsDashboard from "../PopulationAnalyticsDashboard";
import AIPopulationIntelligence from "../AIPopulationIntelligence";
import PregnancyTimeline from "../PregnancyTimeline";
import PregnancyTracker from "../PregnancyTracker";
import SymptomChecker from "../SymptomChecker";
import VaccineReminder from "../VaccineReminder";
import VaccineTracker from "../VaccineTracker";
import GrowthTracker from "../GrowthTracker";
import AppointmentScheduler from "../AppointmentScheduler";
import RiskDistributionChart from "../RiskDistributionChart";
import FeedingGuide from "../baby/FeedingGuide";
import DoctorLoginGate from "../doctor/DoctorLoginGate";
import ModuleSection from "../layout/ModuleSection";
import ModuleBackBar from "../layout/ModuleBackBar";
import SectionAnchor from "../layout/SectionAnchor";
import SettingsPanel from "./SettingsPanel";
import type { AppSection } from "../../config/productFlow";
import type { ChatMessage } from "../../hooks/useMamaCareAppState";

type SharedModuleProps = {
  babyAge: string;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  checkPregnancyWeek: () => void;
  checkVaccines: () => void;
  dueVaccines: string[];
  loading: boolean;
  message: string;
  messages: ChatMessage[];
  pregnancyWeek: string;
  quickQuestion: (text: string, isMedicalComplaint?: boolean) => void;
  sendMessage: () => void | Promise<void>;
  setActiveSection: (section: AppSection) => void;
  setBabyAge: (age: string) => void;
  setMessage: (message: string) => void;
  setPregnancyWeek: (week: string) => void;
  vaccines: { age: string; vaccines: string[] }[];
  weekAdvice: string;
  activeSubview?: string | null;
};

export function AIModule({
  bottomRef,
  loading,
  message,
  messages,
  quickQuestion,
  sendMessage,
  setActiveSection,
  setMessage,
}: SharedModuleProps) {
  return (
    <div className="space-y-6 page-enter">
      <ModuleBackBar title="AI Care" subtitle="Midwife, chat & insights" onBack={() => setActiveSection("dashboard")} />
      <ModuleSection
        title="AI Care Coordinator"
        eyebrow="Brain of the product"
        description="The coordinator drives tasks, risk alerts, emergency referrals, doctor alerts, notifications, and dashboard updates from shared health signals."
        icon={Bot}
      >
        <AICareCoordinator openSection={(id) => setActiveSection(id as AppSection)} />
      </ModuleSection>

      <ModuleSection title="AI Midwife Chat" eyebrow="Conversation">
        <ChatScreen
          message={message}
          setMessage={setMessage}
          loading={loading}
          messages={messages}
          sendMessage={sendMessage}
          quickQuestion={quickQuestion}
          bottomRef={bottomRef}
          goBack={() => setActiveSection("dashboard")}
        />
      </ModuleSection>

      <div className="grid gap-5 lg:grid-cols-2">
        <SymptomChecker />
        <AIInsights />
      </div>
    </div>
  );
}

export function PregnancyModule({
  checkPregnancyWeek,
  pregnancyWeek,
  setPregnancyWeek,
  setActiveSection,
  weekAdvice,
}: SharedModuleProps) {
  return (
    <div className="space-y-6 page-enter">
      <ModuleBackBar title="Pregnancy Care" subtitle="Tracker, advice & appointments" onBack={() => setActiveSection("dashboard")} />
      <ModuleSection
        title="Pregnancy Care"
        eyebrow="Tracker, timeline, insights"
        description="Weekly guidance, AI pregnancy insights, and maternal risk prediction."
        icon={HeartPulse}
      >
        <PregnancyTracker
          pregnancyWeek={pregnancyWeek}
          setPregnancyWeek={setPregnancyWeek}
          checkPregnancyWeek={checkPregnancyWeek}
          weekAdvice={weekAdvice}
        />
      </ModuleSection>
      <PregnancyTimeline pregnancyWeek={pregnancyWeek} />
      <AIMaternalRiskPrediction />
      <div className="grid gap-5 lg:grid-cols-2">
        <MedicationReminder />
        <AppointmentScheduler />
      </div>
    </div>
  );
}

export function MotherModule({ setActiveSection }: Pick<SharedModuleProps, "setActiveSection">) {
  return (
    <div className="space-y-6 page-enter">
      <ModuleBackBar title="Mother Care" subtitle="Profile & health intelligence" onBack={() => setActiveSection("dashboard")} />
      <ModuleSection
        title="Mother Care"
        eyebrow="Profile and health intelligence"
        description="Mother profile, AI health score, summaries, and analytics are grouped for faster review."
        icon={HeartPulse}
      >
        <MotherProfile />
      </ModuleSection>
      <div className="grid gap-5 lg:grid-cols-2">
        <AIHealthScore />
        <AIHealthSummary />
      </div>
      <HealthAnalytics />
    </div>
  );
}

export function BabyModule({
  babyAge,
  checkVaccines,
  dueVaccines,
  setBabyAge,
  setActiveSection,
  activeSubview,
  quickQuestion,
  vaccines,
}: SharedModuleProps) {
  const subview = activeSubview ?? "";

  return (
    <div className="space-y-6 page-enter">
      <ModuleBackBar title="Baby Care" subtitle="Growth, vaccines & feeding" onBack={() => setActiveSection("dashboard")} />

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "profile", label: "Profile" },
            { id: "growth", label: "Growth" },
            { id: "vaccines", label: "Vaccines" },
            { id: "feeding", label: "Feeding" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              window.location.hash = `baby-${tab.id}`;
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              subview === tab.id
                ? "bg-[#6B2545] text-white"
                : "border border-[#EFE4DC] bg-white text-[#5C4C40] hover:bg-[#FFF3E9]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <SectionAnchor id="baby-profile" scrollTo={subview === "profile"}>
        <ModuleSection
          title="Baby Care"
          eyebrow="Profile & predictions"
          description="Baby profile and AI growth prediction."
          icon={Baby}
        >
          <div className="space-y-6">
            <BabyProfile />
            <BabyGrowthPrediction />
          </div>
        </ModuleSection>
      </SectionAnchor>

      <SectionAnchor id="baby-vaccines" scrollTo={subview === "vaccines"}>
        <div className="grid gap-5 lg:grid-cols-2">
          <VaccineTracker
            babyAge={babyAge}
            setBabyAge={setBabyAge}
            dueVaccines={dueVaccines}
            checkVaccines={checkVaccines}
            vaccines={vaccines}
          />
          <VaccineReminder />
        </div>
      </SectionAnchor>

      <SectionAnchor id="baby-growth" scrollTo={subview === "growth"}>
        <div className="grid gap-5 lg:grid-cols-2">
          <MedicationReminder />
          <GrowthTracker />
        </div>
      </SectionAnchor>

      <SectionAnchor id="baby-feeding" scrollTo={subview === "feeding"}>
        <ModuleSection title="Feeding" eyebrow="Breastfeeding & nutrition">
          <FeedingGuide
            onAskAI={(q) => {
              setActiveSection("ai");
              quickQuestion(q);
            }}
          />
        </ModuleSection>
      </SectionAnchor>
    </div>
  );
}

export function EmergencyModule({ setActiveSection }: Pick<SharedModuleProps, "setActiveSection">) {
  return (
    <div className="space-y-6 page-enter">
      <ModuleBackBar title="Emergency" subtitle="SOS, risk & hospitals" onBack={() => setActiveSection("dashboard")} />
      <ModuleSection
        title="Emergency"
        eyebrow="SOS and referral automation"
        description="Emergency SOS → AI risk analysis → ambulance → hospital → doctor → blockchain audit."
        icon={Siren}
      >
        <div className="space-y-6">
          <EmergencySOS onNavigate={(section) => setActiveSection(section as AppSection)} />
          <EmergencyRisk />
          <AIHealthRisk />
        </div>
      </ModuleSection>
      <NearbyHospitals />
      <OfflineEmergencyMode />
    </div>
  );
}

export function WalletModule({ setActiveSection }: Pick<SharedModuleProps, "setActiveSection">) {
  return (
    <div className="space-y-6 page-enter">
      <ModuleBackBar title="Health Wallet" subtitle="BOT Chain records" onBack={() => setActiveSection("dashboard")} />
      <ModuleSection
        title="Health Wallet"
        eyebrow="BOT Chain"
        description="Wallet, audit explorer, identity verification, and notifications remain connected to the blockchain flow."
        icon={ShieldCheck}
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <HealthWallet />
          <NotificationCenter />
        </div>
      </ModuleSection>
      <BlockchainAuditExplorer />
    </div>
  );
}

export function DoctorModule({ setActiveSection }: SharedModuleProps) {
  return (
    <div className="space-y-6 page-enter">
      <ModuleBackBar title="Doctor Portal" subtitle="Patient queue & clinical notes" onBack={() => setActiveSection("dashboard")} />
      <ModuleSection
        title="Doctor Portal"
        eyebrow="Clinical operations"
        description="Doctor dashboard, clinical intelligence, health wallet verification, and patient risk alerts are preserved inside the portal."
      >
        <AICareCoordinator
          viewerRole="doctor"
          openSection={(id) => setActiveSection(id as AppSection)}
        />
      </ModuleSection>
      <DoctorLoginGate>
        <DoctorMode />
      </DoctorLoginGate>
    </div>
  );
}

export function GovernmentModule({ setActiveSection }: Pick<SharedModuleProps, "setActiveSection">) {
  return (
    <div className="space-y-6 page-enter">
      <ModuleBackBar title="Government" subtitle="Population & maternal statistics" onBack={() => setActiveSection("dashboard")} />
      <ModuleSection
        title="Government Dashboard"
        eyebrow="Population intelligence"
        description="Ministry dashboard, population analytics, disease distribution, and AI population intelligence."
      >
        <MinistryDashboard />
      </ModuleSection>
      <PopulationAnalyticsDashboard />
      <RiskDistributionChart />
      <AIPopulationIntelligence />
    </div>
  );
}

export function AppointmentsModule({ setActiveSection }: Pick<SharedModuleProps, "setActiveSection">) {
  return (
    <div className="space-y-6 page-enter">
      <ModuleBackBar title="Appointments" subtitle="Schedule clinic visits" onBack={() => setActiveSection("dashboard")} />
      <ModuleSection title="Appointment Scheduler" eyebrow="Visits">
        <AppointmentScheduler />
      </ModuleSection>
    </div>
  );
}

export function NotificationsModule({ setActiveSection }: Pick<SharedModuleProps, "setActiveSection">) {
  return (
    <div className="space-y-6 page-enter">
      <ModuleBackBar title="Notifications" subtitle="Alerts & reminders" onBack={() => setActiveSection("dashboard")} />
      <ModuleSection title="Notification Center" eyebrow="Inbox">
        <NotificationCenter />
      </ModuleSection>
    </div>
  );
}

export function SettingsModule({ setActiveSection }: Pick<SharedModuleProps, "setActiveSection">) {
  return (
    <div className="space-y-6 page-enter">
      <ModuleBackBar title="Settings" subtitle="Account & preferences" onBack={() => setActiveSection("dashboard")} />
      <SettingsPanel />
    </div>
  );
}

export function InlineRiskPanels() {
  return (
    <div className="space-y-6">
      <ModuleSection title="Symptom Checker" icon={AlertTriangle}>
        <SymptomChecker />
      </ModuleSection>
      <AIHealthRisk />
    </div>
  );
}
