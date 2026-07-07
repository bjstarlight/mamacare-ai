import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { symptoms } = await req.json();

    const prompt = `
You are an experienced maternal and child health doctor.

A pregnant woman reports these symptoms:

"${symptoms}"

Classify the risk as:
- LOW
- MODERATE
- HIGH

Respond ONLY in this JSON format:

{
  "risk":"HIGH",
  "advice":"Go to the nearest hospital immediately because..."
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({
      result: response.text,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to analyze symptoms." },
      { status: 500 }
    );
  }
}