import {
  Activity,
  Baby,
  Bot,
  Globe,
  HeartPulse,
  LayoutDashboard,
  ShieldCheck,
  Siren,
  Stethoscope,
  User,
} from "lucide-react";

export type AppSection =
  | "dashboard"
  | "ai"
  | "pregnancy"
  | "mother"
  | "baby"
  | "emergency"
  | "wallet"
  | "doctor"
  | "government"
  | "symptoms"
  | "chat"
  | "appointments"
  | "notifications"
  | "settings"
  | "vaccines"
  | "growth"
  | "offline"
  | "breastfeeding"
  | "ors";

export type PrimarySection = Extract<
  AppSection,
  | "dashboard"
  | "ai"
  | "pregnancy"
  | "mother"
  | "baby"
  | "emergency"
  | "wallet"
  | "doctor"
  | "government"
>;

export const primaryNavigation = [
  {
    id: "dashboard",
    label: "Home",
    shortLabel: "Home",
    icon: LayoutDashboard,
    description: "Today's tasks, AI alerts, appointments, meds, vaccines",
  },
  {
    id: "ai",
    label: "AI Care",
    shortLabel: "AI",
    icon: Bot,
    description: "AI Midwife, chat, symptom checker, coordinator, insights",
  },
  {
    id: "pregnancy",
    label: "Pregnancy Care",
    shortLabel: "Pregnancy",
    icon: Activity,
    description: "Tracker, timeline, insights, risk prediction, weekly advice",
  },
  {
    id: "mother",
    label: "Mother Care",
    shortLabel: "Mother",
    icon: HeartPulse,
    description: "Profile, health score, summary, analytics",
  },
  {
    id: "baby",
    label: "Baby Care",
    shortLabel: "Baby",
    icon: Baby,
    description: "Profile, growth, vaccines, medication and reminders",
  },
  {
    id: "emergency",
    label: "Emergency",
    shortLabel: "SOS",
    icon: Siren,
    description: "SOS, nearby hospitals, emergency risk, offline mode",
  },
  {
    id: "wallet",
    label: "Health Wallet",
    shortLabel: "Wallet",
    icon: ShieldCheck,
    description: "BOT Chain wallet, audit explorer, verification",
  },
  {
    id: "doctor",
    label: "Doctor Portal",
    shortLabel: "Doctor",
    icon: Stethoscope,
    description: "Clinical dashboard, verification, patient alerts",
  },
  {
    id: "government",
    label: "Government",
    shortLabel: "Gov",
    icon: Globe,
    description: "Ministry dashboard, population analytics and intelligence",
  },
] as const satisfies readonly {
  id: PrimarySection;
  label: string;
  shortLabel: string;
  icon: typeof User;
  description: string;
}[];

export type WorkflowStep = {
  id: string;
  label: string;
  section: AppSection;
  description: string;
};

export const firstVisitWorkflow: WorkflowStep[] = [
  {
    id: "mother-profile",
    label: "Create Mother Profile",
    section: "mother",
    description: "Register mother's name and last menstrual period.",
  },
  {
    id: "pregnancy-details",
    label: "Complete Pregnancy Details",
    section: "pregnancy",
    description: "Enter pregnancy week and receive weekly guidance.",
  },
  {
    id: "ai-assessment",
    label: "Receive AI Assessment",
    section: "ai",
    description: "AI evaluates risk, alerts, and care recommendations.",
  },
  {
    id: "baby-profile",
    label: "Create Baby Profile",
    section: "baby",
    description: "Register baby details for growth and vaccine tracking.",
  },
  {
    id: "notifications",
    label: "Enable Notifications",
    section: "wallet",
    description: "Turn on care reminders and AI alert delivery.",
  },
  {
    id: "health-wallet",
    label: "Health Wallet Activated",
    section: "wallet",
    description: "Protect records on BOT Chain for verification.",
  },
];

/** @deprecated Use firstVisitWorkflow — kept for backward compatibility */
export const workflowSteps = firstVisitWorkflow.map((s) => s.label) as readonly string[];

export type ReturningFlowItem = {
  id: string;
  label: string;
  section: AppSection;
};

export const returningUserFlow: ReturningFlowItem[] = [
  { id: "dashboard", label: "Dashboard", section: "dashboard" },
  { id: "tasks", label: "Today's Tasks", section: "dashboard" },
  { id: "alerts", label: "AI Alerts", section: "ai" },
  { id: "appointments", label: "Appointments", section: "appointments" },
  { id: "medication", label: "Medication", section: "baby" },
  { id: "vaccines", label: "Vaccines", section: "baby" },
  { id: "chat", label: "Chat AI", section: "ai" },
];

export function normalizeSection(id: string): AppSection {
  const sectionMap: Record<string, AppSection> = {
    dashboard: "dashboard",
    home: "dashboard",
    ai: "ai",
    chat: "ai",
    coordinator: "ai",
    pregnancy: "pregnancy",
    mother: "mother",
    baby: "baby",
    emergency: "emergency",
    hospital: "emergency",
    offline: "emergency",
    wallet: "wallet",
    blockchain: "wallet",
    doctor: "doctor",
    government: "government",
    ministry: "government",
    symptoms: "ai",
    appointments: "appointments",
    notifications: "notifications",
    settings: "settings",
    vaccines: "baby",
    growth: "baby",
    breastfeeding: "baby",
    ors: "baby",
  };

  return sectionMap[id] ?? "dashboard";
}

/** Sub-views within sections — used for hash deep-links e.g. #baby-vaccines */
export type SectionSubview = {
  section: AppSection;
  subview: string;
};

export function buildSectionHash(section: AppSection, subview?: string) {
  return subview ? `#${section}-${subview}` : "";
}

export function parseSectionHash(hash: string): SectionSubview | null {
  const raw = hash.replace(/^#/, "");
  if (!raw) return null;
  const dash = raw.indexOf("-");
  if (dash === -1) {
    return { section: normalizeSection(raw), subview: "" };
  }
  const sectionPart = raw.slice(0, dash);
  const subview = raw.slice(dash + 1);
  return { section: normalizeSection(sectionPart), subview };
}
