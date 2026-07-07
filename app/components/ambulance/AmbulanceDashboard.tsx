"use client";

import { useState, useEffect } from "react";
import {
  Ambulance,
  Activity,
  MapPin,
  AlertTriangle,
} from "lucide-react";

import DispatchQueue from "./DispatchQueue"
import LiveTrackingMap from "./LiveTrackingMap"
import AmbulanceFleet from "./AmbulanceFleet";
import TripHistory from "./TripHistory";
import EmergencySOSFeed from "./EmergencySOSFeed";

export default function AmbulanceDashboard() {
  const [activeTab, setActiveTab] = useState("dispatch");
  const [sosCount, setSosCount] = useState(0);

  useEffect(() => {
    const sos = JSON.parse(
      localStorage.getItem("EmergencySOS") || "[]"
    );
    setSosCount(sos.length);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-red-600 text-white px-8 py-6">
        <div className="flex items-center gap-3">
          <Ambulance size={34} />
          <div>
            <h1 className="text-3xl font-bold">
              Ambulance Dispatch Center
            </h1>
            <p className="text-red-100">
              Real-time emergency response system
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 p-8">

        <div className="bg-white p-5 rounded-xl shadow">
          <AlertTriangle className="text-red-600 mb-2" />
          <h2 className="text-2xl font-bold">{sosCount}</h2>
          <p>Active Emergencies</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <Ambulance className="text-blue-600 mb-2" />
          <h2 className="text-2xl font-bold">8</h2>
          <p>Available Ambulances</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <Activity className="text-green-600 mb-2" />
          <h2 className="text-2xl font-bold">3</h2>
          <p>Active Trips</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <MapPin className="text-purple-600 mb-2" />
          <h2 className="text-2xl font-bold">12 min</h2>
          <p>Avg Response Time</p>
        </div>

      </div>

      {/* Tabs */}
      <div className="px-8 flex gap-3 mb-6">

        <button onClick={() => setActiveTab("dispatch")}
          className="px-4 py-2 bg-red-600 text-white rounded-lg">
          Dispatch Queue
        </button>

        <button onClick={() => setActiveTab("tracking")}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg">
          Live Tracking
        </button>

        <button onClick={() => setActiveTab("fleet")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Fleet
        </button>

        <button onClick={() => setActiveTab("history")}
          className="px-4 py-2 bg-green-600 text-white rounded-lg">
          History
        </button>

        <button onClick={() => setActiveTab("sos")}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg">
          SOS Feed
        </button>

      </div>

      {/* Content */}
      <div className="px-8 pb-10">

        {activeTab === "dispatch" && <DispatchQueue />}

        {activeTab === "tracking" && <LiveTrackingMap />}

        {activeTab === "fleet" && <AmbulanceFleet />}

        {activeTab === "history" && <TripHistory />}

        {activeTab === "sos" && <EmergencySOSFeed />}

      </div>

    </div>
  );
}