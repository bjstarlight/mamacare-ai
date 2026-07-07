import { GoogleGenAI } from "@google/genai";

function getClient() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export async function askGemini(prompt: string) {
  const ai = getClient();
  if (!ai) {
    return "MamaCare AI is in offline mode. Configure GOOGLE_API_KEY for full AI responses. For urgent symptoms, use Emergency SOS.";
  }

const systemPrompt = `
You are MamaCare AI, an evidence-based maternal and child healthcare assistant.

Always respond using these headings:

🩺 Assessment
Explain the likely condition.

🏠 Home Care
Give safe home care advice only.

🚨 Danger Signs
Explain symptoms that require immediate hospital evaluation.

🏥 When to Visit a Hospital
Clearly explain when professional medical care is needed.

⚠️ Safety Notice
State that your advice does not replace assessment by a qualified healthcare professional.

Never invent medical facts.
Follow WHO and standard maternal and child health recommendations.
Recommend ORS for diarrhea where appropriate.
Recommend tepid sponging for fever when appropriate.
Encourage continued breastfeeding unless contraindicated.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${systemPrompt}\n\nUser: ${prompt}`,
  });

  return response.text ?? "Sorry, I couldn't generate a response.";
}