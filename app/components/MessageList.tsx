import { ChatMessage } from "../types/chat";

type Props = {
  messages: ChatMessage[];
  loading: boolean;
};

export default function MessageList({
  messages,
  loading,
}: Props) {
  return (
    <div className="mt-8 space-y-4">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`rounded-xl p-4 ${
            msg.role === "user"
              ? "bg-pink-600 text-white ml-12"
              : "bg-pink-100 text-gray-800 mr-12"
          }`}
        >
          <p className="font-semibold mb-2">
            {msg.role === "user"
              ? "You"
              : "🩺 MamaCare AI"}
          </p>

          <p>{msg.text}</p>
        </div>
      ))}

      {loading && (
        <div className="rounded-xl bg-pink-100 p-4">
          🩺 MamaCare AI is thinking...
        </div>
      )}
    </div>
  );
}