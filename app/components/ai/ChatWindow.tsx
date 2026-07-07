"use client";

import { useState } from "react";
import { analyzeSymptoms } from "./SymptomAnalyzer";
import {
  rememberConversation,
  updateDiagnosis,
} from "./AIMemory";
import { loadMemory } from "./AIMemory";

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    {
      sender: "AI",
      text: "Hello 👋 I'm your AI Midwife. How are you feeling today?",
    },
  ]);

  const [input, setInput] = useState("");

  function sendMessage() {
    if (!input.trim()) return;

    const userMessage = {
      sender: "Mother",
      text: input,
    };

    // AI analyzes the mother's symptoms
    const result = analyzeSymptoms(input);
    rememberConversation(input);

updateDiagnosis(
    result.diagnosis,
    input
);

    // If emergency detected, save for the AI Care Coordinator
    if (result.triggerSOS) {
      localStorage.setItem(
        "EmergencySOSPending",
        JSON.stringify({
          symptoms: input,
          analysis: result,
          timestamp: new Date().toISOString(),
        })
      );
    }

    const memory = loadMemory();

let memoryNote = "";

if (memory.lastDiagnosis) {
  memoryNote = `

📁 Previous Diagnosis:
${memory.lastDiagnosis}`;
}
    const aiReply = {
      sender: "AI",
      text: `🩺 Diagnosis: ${result.diagnosis}

⚠️ Risk Level: ${result.severity}

📊 Confidence: ${result.confidence}%
${memoryNote}

🏥 Recommended Unit:
${result.destinationUnit}

✅ Recommendation:
${result.recommendedAction}

${
  result.triggerSOS
    ? "🚨 An emergency has been detected. Emergency response is being prepared."
    : "💚 Continue monitoring and follow the recommendation above."
}`,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
      aiReply,
    ]);

    setInput("");
  }

  return (
    <div className="bg-white rounded-xl shadow p-5">

      <div className="space-y-3 h-[500px] overflow-y-auto">

        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg ${
              m.sender === "AI"
                ? "bg-pink-100"
                : "bg-blue-100"
            }`}
          >
            <strong>{m.sender}</strong>
            <p className="whitespace-pre-line">{m.text}</p>
          </div>
        ))}

      </div>

      <div className="flex gap-3 mt-4">

        <input
          className="border rounded-lg flex-1 px-4 py-2"
          placeholder="Describe how you're feeling..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />

        <button
          onClick={sendMessage}
          className="bg-pink-600 text-white px-5 rounded-lg"
        >
          Send
        </button>

      </div>

    </div>
  );
}