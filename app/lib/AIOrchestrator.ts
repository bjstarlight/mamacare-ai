import { runAIAgent, type AgentRun } from "./ai/AIAgent";

/** @deprecated Use runAIAgent — kept for backward compatibility */
export type OrchestratorRun = AgentRun & {
  actions: string[];
};

export function runAIOrchestrator(): OrchestratorRun {
  const run = runAIAgent();

  const actions = run.executedActions
    .filter((a) => a.executed)
    .map((a) => `${a.label}: ${a.detail}`);

  actions.push(`Health score updated to ${run.snapshot.healthScore}`);
  actions.push(`Risk level: ${run.result.risk}`);
  if (run.result.tasks.length > 0) {
    actions.push(`${run.result.tasks.length} care task(s) identified`);
  }

  return { ...run, actions };
}

export { runAIAgent };
export type { AgentRun };
