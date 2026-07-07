"use client";

import {
  Ambulance,
  AlertTriangle,
  Clock3,
  MapPin,
  PhoneCall,
  Siren,
} from "lucide-react";

export default function EmergencyOverview() {
  const emergencies = [
    {
      patient: "Amina Yusuf",
      location: "Jos North",
      status: "Critical",
      eta: "4 mins",
      color: "bg-red-100 text-red-700",
    },
    {
      patient: "Grace Peter",
      location: "Bukuru",
      status: "Ambulance En Route",
      eta: "9 mins",
      color: "bg-orange-100 text-orange-700",
    },
    {
      patient: "Mary Daniel",
      location: "Rayfield",
      status: "Stabilized",
      eta: "Completed",
      color: "bg-green-100 text-green-700",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Siren className="text-red-600" />
            Emergency Command Centre
          </h2>

          <p className="text-sm text-gray-500">
            Live Maternal Emergency Monitoring
          </p>

        </div>

      </div>

      {/* KPI Row */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        <div className="rounded-xl bg-red-50 p-4">

          <AlertTriangle className="text-red-600 mb-2" />

          <p className="text-sm text-gray-500">
            Active SOS
          </p>

          <h3 className="text-3xl font-bold text-red-700">
            6
          </h3>

        </div>

        <div className="rounded-xl bg-orange-50 p-4">

          <Ambulance className="text-orange-600 mb-2" />

          <p className="text-sm text-gray-500">
            Ambulances
          </p>

          <h3 className="text-3xl font-bold text-orange-700">
            4
          </h3>

        </div>

        <div className="rounded-xl bg-blue-50 p-4">

          <Clock3 className="text-blue-600 mb-2" />

          <p className="text-sm text-gray-500">
            Avg Response
          </p>

          <h3 className="text-3xl font-bold text-blue-700">
            7 min
          </h3>

        </div>

        <div className="rounded-xl bg-green-50 p-4">

          <PhoneCall className="text-green-600 mb-2" />

          <p className="text-sm text-gray-500">
            Resolved Today
          </p>

          <h3 className="text-3xl font-bold text-green-700">
            18
          </h3>

        </div>

      </div>

      {/* Emergency Feed */}

      <div className="space-y-4">

        {emergencies.map((item, index) => (

          <div
            key={index}
            className="rounded-xl border border-slate-200 p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
          >

            <div>

              <h3 className="font-semibold text-slate-800">
                {item.patient}
              </h3>

              <div className="flex items-center gap-2 text-gray-500 mt-1">

                <MapPin size={16} />

                {item.location}

              </div>

            </div>

            <div>

              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${item.color}`}
              >
                {item.status}
              </span>

            </div>

            <div className="text-right">

              <p className="text-xs text-gray-500">
                Response
              </p>

              <h4 className="font-bold">
                {item.eta}
              </h4>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}