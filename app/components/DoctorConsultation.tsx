"use client";

export default function DoctorConsultation() {
  return (
    <div className="rounded-2xl border-2 border-blue-500 bg-white p-6 mt-6">
      <h2 className="text-2xl font-bold text-blue-700">
        Doctor Consultation
      </h2>

      <label className="block mt-6 font-semibold">
        Diagnosis
      </label>

      <input
        className="w-full border rounded-lg p-3 mt-2"
        placeholder="Diagnosis"
      />

      <label className="block mt-6 font-semibold">
        Clinical Notes
      </label>

      <textarea
        rows={6}
        className="w-full border rounded-lg p-3 mt-2"
        placeholder="Type clinical notes here..."
      />

      <label className="block mt-6 font-semibold">
        Prescription
      </label>

      <textarea
        rows={4}
        className="w-full border rounded-lg p-3 mt-2"
        placeholder="Prescription..."
      />

      <button className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg">
        Save Consultation
      </button>
    </div>
  );
}