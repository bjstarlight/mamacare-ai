"use client";

export default function EmergencyActions() {
  return (
    <div className="bg-red-50 rounded-xl border border-red-300 p-5">

      <h2 className="font-bold text-red-700 mb-4">

        Emergency Actions

      </h2>

      <div className="space-y-3">

        <button className="w-full bg-red-600 text-white py-2 rounded-lg">
          Trigger SOS
        </button>

        <button className="w-full bg-orange-600 text-white py-2 rounded-lg">
          Contact Community Health Worker
        </button>

        <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
          Find Nearest Hospital
        </button>

      </div>

    </div>
  );
}