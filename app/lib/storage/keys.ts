/** Canonical localStorage keys — preserve names for backward compatibility. */
export const STORAGE_KEYS = {
  // Profiles
  motherProfile: "motherProfile",
  babyProfile: "babyProfile",
  babyMedicalRecord: "babyMedicalRecord",
  babyAgeText: "babyAgeText",
  babyAgeDays: "babyAgeDays",
  babyAgeMonths: "babyAgeMonths",
  babyWeight: "babyWeight",
  pregnancyWeek: "pregnancyWeek",
  doctorName: "doctorName",
  clinicalSummary: "clinicalSummary",
  doctorConsultation: "doctorConsultation",
  emergencyContact: "emergencyContact",
  sessionActive: "mamacare:sessionActive",

  // Clinical
  vitalSigns: "vitalSigns",
  latestBP: "latestBP",
  currentSymptoms: "currentSymptoms",
  consultationNotes: "consultationNotes",
  prescriptionHistory: "prescriptionHistory",
  medications: "medications",
  medicationRegistry: "medicationRegistry",
  medicationDoseLogs: "medicationDoseLogs",
  appointments: "appointments",
  growthHistory: "growthHistory",
  babyGrowth: "babyGrowth",
  latestGrowthAnalysis: "latestGrowthAnalysis",
  aiMaternalRiskDraft: "aiMaternalRiskDraft",

  // AI / chat
  aiMemory: "aiMemory",
  healthMemory: "healthMemory",
  motherMemory: "motherMemory",
  aiMessages: "aiMessages",
  notifications: "notifications",
  emergency: "emergency",

  // Emergency / referrals
  EmergencySOS: "EmergencySOS",
  EmergencySOSPending: "EmergencySOSPending",
  EmergencyMode: "EmergencyMode",
  lastSOSTriggeredAt: "lastSOSTriggeredAt",
  referrals: "referrals",
  hospitalReferrals: "hospitalReferrals",
  dispatchQueue: "dispatchQueue",
  ambulanceTrips: "ambulanceTrips",
  ambulanceHistory: "ambulanceHistory",

  // Blockchain / wallet
  blockchainRecords: "blockchainRecords",
  blockchainLogs: "blockchainLogs",
  botChainMilestones: "botChainMilestones",
  protectedRecords: "protectedRecords",
  lastVerified: "lastVerified",
  latestTransaction: "latestTransaction",

  // Hospital network
  hospitalDirectory: "hospitalDirectory",
  doctorDirectory: "doctorDirectory",
  ambulanceDirectory: "ambulanceDirectory",
  hospitalDashboardMetrics: "hospitalDashboardMetrics",
  hospitalEmergencyFlag: "hospitalEmergencyFlag",
  hospitalChainStatus: "hospitalChainStatus",

  // CHW
  chwPatients: "chwPatients",
  mothers: "mothers",
  babyVaccinations: "babyVaccinations",
  CHWNotifications: "CHWNotifications",

  // Baby vaccines
  completedVaccines: "completedVaccines",
  vaccinesDue: "vaccinesDue",
  NewBabyRegistered: "NewBabyRegistered",

  // Population
  populationHealth: "populationHealth",

  // Workflow / dashboard (new centralized keys)
  careWorkflow: "careWorkflow",
  dashboardSnapshot: "dashboardSnapshot",
  doctorAlerts: "doctorAlerts",
  healthScore: "healthScore",
  notificationsEnabled: "notificationsEnabled",

  // Onboarding / auth
  onboardingComplete: "onboardingComplete",
  authUser: "authUser",
  careType: "careType",
  doctorAuthSession: "doctorAuthSession",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
