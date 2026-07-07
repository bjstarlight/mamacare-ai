"use client";

import { useState } from "react";

interface ChatMessage {
  sender: "parent" | "ai";
  text: string;
}

export default function AIPediatricAssistant() {

  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Hello 👶 I'm your AI Pediatric Assistant. Tell me what is happening with your baby."
    }
  ]);

  function generateResponse(question: string) {

    const q = question.toLowerCase();

    const age =
      localStorage.getItem("babyAgeText") || "Unknown";

    const growth =
      localStorage.getItem("latestGrowthAnalysis") || "";

    if (q.includes("fever")) {

      return `🌡️ Your baby is ${age} old.

Persistent fever can be serious in young infants.

✅ Keep baby hydrated.

✅ Monitor temperature.

🚨 Seek immediate medical care if temperature exceeds 38°C (100.4°F) in infants under 3 months.`;

    }

    if (q.includes("diarrhea")) {

      return `💧 Frequent diarrhea may lead to dehydration.

Offer breast milk frequently.

Watch for sunken eyes, poor feeding or reduced urination.

Visit the nearest hospital if symptoms continue.`;

    }

    if (q.includes("cough")) {

      return `😷 Keep baby warm.

Monitor breathing difficulty.

If breathing becomes fast or difficult, seek urgent care.`;

    }

    if (q.includes("rash")) {

      return `🩺 Baby rashes are common.

Observe whether it spreads quickly, develops blisters or is associated with fever.

If yes, seek medical evaluation.`;

    }

    if (q.includes("breastfeed")) {

      return `🤱 Continue exclusive breastfeeding.

Feed on demand every 2-3 hours.

Poor feeding together with sleepiness requires immediate assessment.`;

    }

    if (q.includes("cry")) {

      return `👶 Babies cry for hunger, discomfort, tiredness or illness.

Persistent inconsolable crying should be medically evaluated.`;

    }

    return `Based on your baby's profile:

${growth}

I recommend monitoring your baby closely. If symptoms worsen, seek medical attention immediately.`;

  }

  function sendMessage() {

    if (!input.trim()) return;

    const reply = generateResponse(input);

    const updated: ChatMessage[] = [
      ...messages,
      {
        sender: "parent",
        text: input,
      },
      {
        sender: "ai",
        text: reply,
      },
    ];

    setMessages(updated);

    localStorage.setItem(
      "babyChatHistory",
      JSON.stringify(updated)
    );

    const logs =
      JSON.parse(
        localStorage.getItem("blockchainLogs") || "[]"
      );

    logs.push({

      id: crypto.randomUUID(),

      type: "AI_PEDIATRIC_CHAT",

      prompt: input,

      timestamp: new Date().toISOString()

    });

    localStorage.setItem(
      "blockchainLogs",
      JSON.stringify(logs)
    );

    setInput("");

  }

  return (

    <div className="rounded-xl border bg-white p-5">

      <h2 className="text-xl font-bold text-blue-700">

        🤖 AI Pediatric Assistant

      </h2>

      <div className="border rounded-lg h-80 overflow-y-auto p-4 mt-4 bg-gray-50">

        {messages.map((msg,index)=>(

          <div

            key={index}

            className={`mb-4 ${
              msg.sender==="ai"
              ? "text-left"
              : "text-right"
            }`}

          >

            <div

              className={`inline-block rounded-lg px-4 py-3 max-w-xs

              ${
                msg.sender==="ai"

                ? "bg-blue-100"

                : "bg-green-100"

              }`}

            >

              {msg.text}

            </div>

          </div>

        ))}

      </div>

      <div className="flex mt-4 gap-2">

        <input

          className="flex-1 border rounded-lg p-3"

          placeholder="Describe your baby's symptoms..."

          value={input}

          onChange={(e)=>setInput(e.target.value)}

        />

        <button

          onClick={sendMessage}

          className="bg-blue-600 text-white px-5 rounded-lg"

        >

          Send

        </button>

      </div>

    </div>

  );

}