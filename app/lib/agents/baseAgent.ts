import type { AppSection } from "../../config/productFlow";
import type { AgentContext, AgentRecommendation, AgentResponse, AgentRole } from "./agentTypes";

export abstract class BaseAgent {
  abstract role: AgentRole;

  abstract run(context: AgentContext, message: string): AgentResponse;

  protected createRecommendation(
    title: string,
    description: string,
    agent: AgentRole,
    priority: "low" | "medium" | "high" = "medium",
    section?: AppSection
  ): AgentRecommendation {
    return {
      id: `${agent}-${title.toLowerCase().replace(/\s+/g, "-")}`,
      title,
      description,
      agent,
      priority,
      section,
    };
  }
}
