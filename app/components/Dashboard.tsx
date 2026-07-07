"use client";

type DashboardProps = {
  openSection: (section: string) => void;
};

export default function Dashboard({ openSection }: DashboardProps) {
  return (
    <div className="space-y-5">

      <h1 className="text-3xl font-bold text-pink-600">
        🩺 MamaCare
      </h1>

      <p className="text-gray-600">
        Your Mother & Child Health Companion
      </p>

      <div className="grid md:grid-cols-2 gap-4">

        <button
          onClick={() => openSection("mother")}
          className="rounded-2xl bg-pink-100 p-6 text-left hover:bg-pink-200"
        >
          <div className="text-4xl">🤰</div>

          <h2 className="font-bold mt-3">
            Pregnancy
          </h2>

          <p className="text-sm text-gray-600">
            View pregnancy progress
          </p>
        </button>

        <button
          onClick={() => openSection("baby")}
          className="rounded-2xl bg-blue-100 p-6 text-left hover:bg-blue-200"
        >
          <div className="text-4xl">👶</div>

          <h2 className="font-bold mt-3">
            Baby
          </h2>

          <p className="text-sm text-gray-600">
            Baby profile & vaccines
          </p>
        </button>

        <button
          onClick={() => openSection("growth")}
          className="rounded-2xl bg-green-100 p-6 text-left hover:bg-green-200"
        >
          <div className="text-4xl">📈</div>

          <h2 className="font-bold mt-3">
            Growth Tracker
          </h2>

          <p className="text-sm text-gray-600">
            Monitor growth
          </p>
        </button>

        <button
          onClick={() => openSection("chat")}
          className="rounded-2xl bg-purple-100 p-6 text-left hover:bg-purple-200"
        >
          <div className="text-4xl">💬</div>

          <h2 className="font-bold mt-3">
            Ask MamaCare AI
          </h2>

          <p className="text-sm text-gray-600">
            Health Assistant
          </p>
        </button>

        <button
  onClick={() => openSection("doctor")}
  className="rounded-xl bg-blue-600 p-4 text-white hover:bg-blue-700"
>
  🩺 Doctor Mode
</button>

      </div>

    </div>
  );
}