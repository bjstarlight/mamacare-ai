"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";

export default function DispatchQueue() {
  const [emergencies, setEmergencies] = useState<any[]>([]);

  useEffect(() => {
    const data = JSON.parse(
      localStorage.getItem("EmergencySOS") || "[]"
    );

    setEmergencies(data);
  }, []);

  function dispatch(index: number) {
    const updated = [...emergencies];

    updated[index].status = "Dispatched";
    updated[index].ambulance = "Ambulance A1";
    updated[index].eta = "12 mins";

    localStorage.setItem(
      "EmergencySOS",
      JSON.stringify(updated)
    );

    const trips = JSON.parse(
      localStorage.getItem("ambulanceTrips") || "[]"
    );

    trips.push({
      id: `AMB-${Date.now()}`,
      ambulance: "Ambulance A1",
      patient: updated[index].mother || "Unknown",
      location: updated[index].location || "Unknown",
      destination: "Jos University Teaching Hospital",
      status: "En Route",
      eta: "12 mins",
      priority: "High",
      assignedDoctor: "Dr. Sarah",
      destinationUnit: "Obstetric Emergency Unit",
      createdAt: new Date().toISOString(),
    });

    localStorage.setItem(
      "ambulanceTrips",
      JSON.stringify(trips)
    );

    const blockchainLogs = JSON.parse(
      localStorage.getItem("blockchainLogs") || "[]"
    );

    blockchainLogs.push({
      id: crypto.randomUUID(),
      type: "AMBULANCE_DISPATCH",
      ambulance: "Ambulance A1",
      patient: updated[index].mother,
      hospital: "Jos University Teaching Hospital",
      timestamp: new Date().toISOString(),
    });

    localStorage.setItem(
      "blockchainLogs",
      JSON.stringify(blockchainLogs)
    );

    setEmergencies(updated);
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">
        Emergency Dispatch Queue
      </h2>

      {emergencies.map((e, index) => (
        <div key={index} className="border rounded-lg p-4 mb-4">
          <h3 className="font-bold">
            {e.mother || "Unknown Patient"}
          </h3>

          <p>{e.location}</p>

          <button
            onClick={() => dispatch(index)}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Phone size={16} />
            Dispatch Ambulance
          </button>
        </div>
      ))}
    </div>
  );
}