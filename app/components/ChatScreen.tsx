"use client";

import { RefObject } from "react";
import {
  ArrowLeft,
  Stethoscope,
  Baby,
  Thermometer,
  Droplets,
  Syringe,
} from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  agentSummary?: string;
  routedAgents?: string[];
  recommendations?: Array<{ title: string; description?: string; priority?: string }>;
  riskLevel?: string;
  followUpQuestion?: string;
};

type ChatScreenProps = {
  message: string;
  setMessage: (value: string) => void;
  loading: boolean;
  messages: ChatMessage[];
  sendMessage: () => void | Promise<void>;
  quickQuestion: (text: string, isMedicalComplaint?: boolean) => void | Promise<void>;
  bottomRef: RefObject<HTMLDivElement | null>;
  goBack?: () => void;
};

export default function ChatScreen({
  message,
  setMessage,
  loading,
  messages,
  sendMessage,
  quickQuestion,
  bottomRef,
  goBack,
}: ChatScreenProps) {
  const handleBack = goBack ?? (() => undefined);
  return (
    <>
      <button
        onClick={handleBack}
        className="mb-4 flex items-center gap-1.5 rounded-lg bg-[#EFE4DC] px-4 py-2 text-sm font-medium text-[#2B2118] hover:bg-[#E9D7CE]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <textarea
        className="w-full mt-8 border border-[#EFE4DC] rounded-xl p-4 h-36 text-[#2B2118] focus:outline-none focus:ring-2 focus:ring-[#B5533F]/40"
        placeholder="Ask a pregnancy, newborn or child health question..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6B2545] py-3 font-semibold text-[#FBF6F1] hover:bg-[#7A2E52] disabled:bg-[#EFE4DC] disabled:text-[#a89887] disabled:cursor-not-allowed"
      >
        <Stethoscope className="h-4 w-4" />
        {loading ? "MamaCare AI is thinking..." : "Ask MamaCare AI"}
      </button>

      <div ref={bottomRef}></div>

      {messages.length === 0 && (
        <div className="mt-8 rounded-2xl border border-[#EFE4DC] bg-[#FFF9F4] p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#6B2545]">
            <Stethoscope className="h-8 w-8 text-[#FBF6F1]" />
          </div>

          <h2 className="font-serif text-2xl font-semibold text-[#6B2545]">
            Welcome to MamaCare AI
          </h2>

          <p className="mt-3 text-[#8a7a6d]">
            Ask me anything about pregnancy, childbirth, newborn care,
            breastfeeding, childhood illnesses, vaccinations and women's
            health.
          </p>

          <div className="grid md:grid-cols-2 gap-3 mt-8">
            <button
              onClick={() =>
                quickQuestion(
                  "I am 32 weeks pregnant and my feet are swollen."
                )
              }
              className="flex items-center gap-3 rounded-xl border border-[#EFE4DC] bg-white p-4 text-left text-[#2B2118] hover:bg-[#FFF3E9]"
            >
              <Baby className="h-5 w-5 shrink-0-[#B5533F]" />
              Pregnancy Advice
            </button>

            <button
              onClick={() => quickQuestion("My baby has a fever.")}
              className="flex items-center gap-3 rounded-xl border border-[#EFE4DC] bg-white p-4 text-left text-[#2B2118] hover:bg-[#FFF3E9]"
            >
              <Thermometer className="h-5 w-5 shrink-0 text-[#B5533F]" />
              Baby Fever
            </button>

            <button
              onClick={() => quickQuestion("My child has diarrhea.")}
              className="flex items-center gap-3 rounded-xl border border-[#EFE4DC] bg-white p-4 text-left text-[#2B2118] hover:bg-[#FFF3E9]"
            >
              <Droplets className="h-5 w-5 shrink-0 text-[#B5533F]" />
              Diarrhea &amp; ORS
            </button>

            <button
              onClick={() =>
                quickQuestion("Which vaccines are due at 10 weeks?")
              }
              className="flex items-center gap-3 rounded-xl border border-[#EFE4DC] bg-white p-4 text-left text-[#2B2118] hover:bg-[#FFF3E9]"
            >
              <Syringe className="h-5 w-5 shrink-0 text-[#B5533F]" />
              Vaccinations
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`rounded-xl p-4 ${
              msg.role === "user"
                ? "bg-[#6B2545] text-[#FBF6F1] ml-12"
                : "bg-[#FFF3E9] text-[#2B2118] mr-12"
            }`}
          >
            <p className="mb-2 flex items-center gap-1.5 font-semibold">
              {msg.role === "assistant" && (
                <Stethoscope className="h-3.5 w-3.5 text-[#B5533F]" />
              )}
              {msg.role === "user" ? "You" : "MamaCare AI"}
            </p>

            <p className="whitespace-pre-wrap">{msg.text}</p>

            {msg.role === "assistant" && (
              <div className="mt-4 rounded-2xl border border-[#EED7C8] bg-white/70 p-3 text-sm text-[#4E4038]">
                <div className="flex items-center gap-2 font-semibold text-[#6B2545]">
                  <Stethoscope className="h-3.5 w-3.5" />
                  Coordinator snapshot
                </div>

                {msg.agentSummary ? (
                  <p className="mt-2 text-sm leading-6">{msg.agentSummary}</p>
                ) : null}

                {msg.routedAgents && msg.routedAgents.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A7A6D]">
                      Routed agents
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.routedAgents.map((agent) => (
                        <span
                          key={agent}
                          className="rounded-full border border-[#EFE4DC] bg-[#FFF9F4] px-2.5 py-1 text-xs font-medium text-[#2B2118]"
                        >
                          {agent.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {msg.recommendations && msg.recommendations.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A7A6D]">
                      Recommendations
                    </p>
                    <ul className="mt-2 space-y-2">
                      {msg.recommendations.map((item) => (
                        <li key={item.title} className="rounded-xl border border-[#EFE4DC] bg-white px-3 py-2">
                          <p className="text-sm font-semibold text-[#2B2118]">{item.title}</p>
                          {item.description ? (
                            <p className="mt-1 text-sm text-[#6F6258]">{item.description}</p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {msg.followUpQuestion ? (
                  <p className="mt-3 text-sm font-medium text-[#6B2545]">
                    Follow-up: {msg.followUpQuestion}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="mr-12 rounded-xl bg-[#FFF3E9] p-4">
            <p className="flex items-center gap-1.5 font-semibold text-[#2B2118]">
              <Stethoscope className="h-3.5 w-3.5 text-[#B5533F]" />
              MamaCare AI
            </p>
            <p className="text-[#8a7a6d]">Thinking...</p>
          </div>
        )}
      </div>
    </>
  );
}