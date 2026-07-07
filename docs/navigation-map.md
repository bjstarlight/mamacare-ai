# MamaCare AI — Complete Navigation Map

## Entry & onboarding

```text
/ (root) ──[if !onboardingComplete]──► /welcome
/welcome
  Step 1  Splash Screen
  Step 2  Onboarding (3 slides)
  Step 3  Sign Up / Login (name + contact)
  Step 4  Mother Profile Setup
  Step 5  Pregnancy or Baby selection
  Step 6  ──► / (Dashboard)
```

## Primary app shell (`/` — section SPA)

| Section ID | Label | Components | User journey |
|------------|-------|------------|--------------|
| `dashboard` | Home | DashboardHub, AIAutomationFeed, WorkflowStepper, Tasks, QuickActions | Hub for all features |
| `ai` | AI Care | AICareCoordinator, ChatScreen, SymptomChecker, AIInsights | AI Midwife, chat, symptoms |
| `pregnancy` | Pregnancy | PregnancyTracker, Timeline, Risk, Appointments, Medication | Mother pregnancy flow |
| `mother` | Mother Care | MotherProfile, HealthScore, Summary, Analytics | Profile setup |
| `baby` | Baby Care | BabyProfile, Growth, Vaccines, Medication, Predictions | Baby flow |
| `appointments` | Appointments | AppointmentScheduler | Schedule & view visits |
| `notifications` | Notifications | NotificationCenter | AI + care alerts |
| `emergency` | Emergency | EmergencySOS, AIHealthRisk, NearbyHospitals, Offline | Emergency flow |
| `wallet` | Health Wallet | HealthWallet, BlockchainAuditExplorer | BOT Chain records |
| `doctor` | Doctor Portal | DoctorMode, AICareCoordinator | Clinical workflow |
| `government` | Government | Ministry, Population Analytics, Risk charts | Policy dashboards |
| `settings` | Settings | Profile, care type, notifications toggle | App preferences |

## Dashboard hub destinations

Every card on the home dashboard opens a working destination:

| Card | Destination | Type |
|------|-------------|------|
| AI Midwife | `ai` | section |
| Pregnancy Tracker | `pregnancy` | section |
| Baby Care | `baby` | section |
| Vaccination | `baby` (vaccines) | section |
| Appointments | `appointments` | section |
| Health Wallet | `wallet` | section |
| Emergency SOS | `emergency` | section |
| Ambulance Request | `/ambulance` | route |
| Nearby Hospitals | `emergency` | section |
| AI Insights | `ai` | section |
| Doctor Portal | `doctor` | section |
| Notifications | `notifications` | section |
| Settings | `settings` | section |
| Hospital Center | `/hospital` | route |
| Blockchain Explorer | `/blockchain` | route |
| Verify Records | `/verify` | route |

## Secondary routes (deep links)

| Route | Purpose | Back to Dashboard |
|-------|---------|-------------------|
| `/welcome` | Onboarding | completes → `/` |
| `/mother` | Mother profile | PortalLayout → `/` |
| `/baby` | Baby care | PortalLayout → `/` |
| `/ai-midwife` | Full AI Midwife | PortalLayout → `/` |
| `/doctor` | Doctor portal | PortalLayout → `/` |
| `/hospital` | Hospital network | PortalLayout → `/` |
| `/ambulance` | Dispatch center | PortalLayout → `/` |
| `/chw` | Community health worker | PortalLayout → `/` |
| `/blockchain` | BOT Chain explorer | PortalLayout → `/` |
| `/verify` | Record verification | PortalLayout → `/` |
| `/test` | Dev API test | (dev only) |

## User journey flows

### Mother flow

```text
Dashboard → Pregnancy → AI Advice (ai) → Symptoms (ai) → Medication (baby/pregnancy)
         → Appointment (appointments) → Chat (ai) → Emergency (emergency)
```

### Baby flow

```text
Dashboard → Baby Profile → Growth → Vaccines → Feeding (ai) → AI Predictions
```

### Emergency flow

```text
Dashboard → Emergency SOS → AI Risk Analysis → Ambulance Request (/ambulance)
         → Nearby Hospital → Hospital receives (/hospital) → Doctor portal
         → Blockchain audit (wallet / blockchain)
```

### Doctor flow

```text
/doctor → Login (DoctorMode) → Patient Queue → Open Patient → Timeline
        → AI Summary → Write Notes (SOAP) → Sign → Save to Blockchain
```

### Government flow

```text
Dashboard → government → Population Analytics → Ministry Dashboard
         → Disease heatmaps (RiskDistributionChart) → Maternal Statistics
```

## Component inventory (keep — no removal of features)

**AI:** AICareCoordinator, ChatScreen, AIMidwife, SymptomChecker, AIInsights, AIHealthRisk, AIAutomationFeed

**Mother:** MotherProfile, PregnancyTracker, PregnancyTimeline, AIMaternalRiskPrediction, AIHealthScore

**Baby:** BabyProfile, GrowthTracker, VaccineTracker, BabyGrowthPrediction, MedicationReminder

**Emergency:** EmergencySOS, EmergencyRisk, NearbyHospitals, OfflineEmergencyMode, ReferralSystem

**Clinical:** DoctorMode, HealthWallet, BlockchainAuditExplorer, ShareWithDoctor, SOAPNotes

**Government:** MinistryDashboard, PopulationAnalyticsDashboard, AIPopulationIntelligence, RiskDistributionChart

**Portals:** HospitalNetworkDashboard, AmbulanceDashboard, CHWDashboard

## Dead code removed

- `MainNavigation.tsx` (orphaned, wrong section IDs)
- `components/hospital/page.tsx` (not a route)
- `chatBox.tsx` (empty)
- `CommunityHealthWorkerDashboard.tsx` (empty)
- `baby/BabyProfile.tsx` (empty duplicate)
- `ai/ConversationHistory.tsx` (empty)

## Deep-link sub-views (hash navigation)

Baby section supports hash deep-links:

| Hash | Scrolls to |
|------|------------|
| `#baby-profile` | Baby profile |
| `#baby-growth` | Growth tracker |
| `#baby-vaccines` | Vaccine schedule |
| `#baby-feeding` | Feeding & ORS guide |

Dashboard cards and Quick Actions pass `subview` when navigating.

## Doctor login gate

- Component: `components/doctor/DoctorLoginGate.tsx`
- Protects `/doctor` and in-app Doctor module
- Demo PIN: `1234` (hackathon demo)
- Session key: `doctorAuthSession`

## Feeding module

- Component: `components/baby/FeedingGuide.tsx`
- Embedded in Baby Care at `#baby-feeding`
- Includes breastfeeding tips + ORS guidance + AI ask buttons

## NotificationCenter (consolidated)

- Canonical: `components/NotificationCenter.tsx`
- Re-export: `components/notifications/NotificationCenter.tsx`
- Merges AI notifications + appointments + medications + baby profile reminders
- Supports mark-as-read for persisted notifications
