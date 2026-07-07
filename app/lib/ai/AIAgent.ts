import {
  buildAIContext,
  runAICore,
  type AgentAction,
  type AIResult,
} from "../AICoreEngine";
import {
  pushAIMessage,
  pushDoctorAlert,
  updateDashboardSnapshot,
} from "./aiDashboardService";
import {
  pushAlertsFromAI,
  pushRecommendationNotifications,
} from "./aiNotificationService";
import { handleHighRiskReferrals } from "./aiReferralService";
import { writeJSON, STORAGE_KEYS } from "../storage/storageService";
import type { AppSection } from "../../config/productFlow";

export type ExecutedAction = AgentAction & { executed: boolean };

export type AgentRun = {
  result: AIResult;
  context: ReturnType<typeof buildAIContext>;
  executedActions: ExecutedAction[];
  snapshot: ReturnType<typeof updateDashboardSnapshot>;
  ranAt: string;
};

const recentRuns = new Map<string, number>();

function recentlyRan(key: string, windowMs = 60_000): boolean {
  const last = recentRuns.get(key);
  const now = Date.now();
  if (last && now - last < windowMs) return true;
  recentRuns.set(key, now);
  return false;
}

function executeAgentActions(
  result: AIResult,
  motherName: string
): ExecutedAction[] {
  const executed: ExecutedAction[] = [];
  const done = new Set<string>();

  for (const action of result.agentActions) {
    const key = `${action.type}-${action.label}`;
    let didExecute = false;

    if (!done.has(action.type)) {
      switch (action.type) {
        case "notification":
          if (!recentlyRan("notif-recs")) {
            pushRecommendationNotifications(result);
            didExecute = true;
            done.add(action.type);
          }
          break;

        case "doctor_alert":
          if (result.risk !== "LOW" && !recentlyRan("doctor-alert")) {
            pushDoctorAlert(result, motherName);
            didExecute = true;
            done.add(action.type);
          }
          break;

        case "emergency_referral":
        case "ambulance_dispatch":
          if (result.risk === "HIGH" && !recentlyRan("emergency-ref")) {
            handleHighRiskReferrals(result);
            didExecute = true;
            done.add("emergency_referral");
            done.add("ambulance_dispatch");
          }
          break;

        case "ai_message":
          if (result.risk === "HIGH" && !recentlyRan("ai-msg")) {
            pushAIMessage(
              `⚠️ ${result.summary} I have prepared emergency referrals and alerted your care team.`
            );
            didExecute = true;
            done.add(action.type);
          }
          break;

        case "dashboard_update":
        case "health_score":
        case "task":
        case "navigate":
          didExecute = true;
          done.add(action.type);
          break;

        default:
          break;
      }
    }

    executed.push({ ...action, executed: didExecute || done.has(action.type) });
  }

  return executed;
}

/** Central AI agent — analyzes context, plans actions, executes automation */
export function runAIAgent(): AgentRun {
  const context = buildAIContext();
  const result = runAICore(context);
  const motherName = context.motherName ?? "Current Mother";

  pushAlertsFromAI(result);

  const executedActions = executeAgentActions(result, motherName);

  const snapshot = updateDashboardSnapshot(result, {
    babyAgeMonths: context.babyAgeMonths,
    babyWeight: context.babyWeight,
    pendingTasks: result.tasks.length,
  });

  writeJSON(STORAGE_KEYS.dashboardSnapshot, {
    ...snapshot,
    agentTasks: result.tasks,
    agentSummary: result.summary,
    focusAreas: result.focusAreas,
  });

  writeJSON(STORAGE_KEYS.healthScore, {
    score: snapshot.healthScore,
    risk: result.risk,
    summary: result.summary,
    recommendations: result.recommendations,
    focusAreas: result.focusAreas,
    tasks: result.tasks,
    updatedAt: snapshot.lastUpdated,
  });

  return {
    result,
    context,
    executedActions,
    snapshot,
    ranAt: new Date().toISOString(),
  };
}

export function getSuggestedSection(result: AIResult): AppSection | null {
  if (result.risk === "HIGH") return "emergency";
  if (result.focusAreas.includes("vaccines")) return "baby";
  if (result.focusAreas.includes("symptoms")) return "ai";
  if (result.focusAreas.includes("pregnancy")) return "pregnancy";
  if (result.tasks.length > 0) return result.tasks[0].section;
  return null;
}

export { buildAIContext, runAICore };
