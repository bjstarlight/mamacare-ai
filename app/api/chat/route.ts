import { NextResponse } from "next/server";
import { CareCoordinatorAgent } from "../../lib/agents/careCoordinatorAgent";
import { askGemini } from "../../lib/gemini";

export async function POST(req: Request) {
  const { message, pregnancyWeek, motherName } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ reply: "Please enter a message." });
  }

  try {
    const coordinator = new CareCoordinatorAgent();
    const { response } = coordinator.run(message);

    const contextParts: string[] = [];
    if (motherName) contextParts.push(`Mother's name: ${motherName}`);
    if (pregnancyWeek) contextParts.push(`Pregnancy week: ${pregnancyWeek}`);

    const prompt =
      contextParts.length > 0
        ? `${contextParts.join(". ")}.

Question: ${message}

Agent summary: ${response.reply}`
        : `${message}

Agent summary: ${response.reply}`;

    const reply = await askGemini(prompt);
    return NextResponse.json({
      reply,
      agentSummary: response.reply,
      routedAgents: response.routedAgents,
      recommendations: response.recommendations,
      riskLevel: response.riskLevel,
      followUpQuestion: response.followUpQuestion,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      reply:
        "MamaCare AI is temporarily unavailable. For urgent symptoms, contact your nearest health facility or use Emergency SOS.",
    });
  }
}
