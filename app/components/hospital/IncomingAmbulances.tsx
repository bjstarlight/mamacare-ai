"use client";

import { useEffect, useState } from "react";
import {
  Ambulance,
  Clock,
  MapPin,
  User,
  HeartPulse,
} from "lucide-react";

export default function IncomingAmbulances() {
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    const loadTrips = () => {
      const saved = JSON.parse(
        localStorage.getItem("ambulanceTrips") || "[]"
      );

      setTrips(saved);
    };

    loadTrips();

    const interval = setInterval(loadTrips, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Ambulance className="text-red-600" />
        Incoming Ambulances
      </h2>

      {trips.length === 0 ? (
        <p className="text-gray-500">
          No incoming ambulances.
        </p>
      ) : (
        <div className="space-y-5">

          {trips.map((trip) => (

            <div
              key={trip.id}
              className="border rounded-xl p-5"
            >

              <div className="flex justify-between">

                <div>

                  <h3 className="font-bold text-lg">
                    {trip.ambulance}
                  </h3>

                  <p className="text-gray-500">
                    Emergency Referral
                  </p>

                </div>

                <span
                  className={`px-3 py-1 rounded-full text-white ${
                    trip.status === "Arrived"
                      ? "bg-green-600"
                      : "bg-blue-600"
                  }`}
                >
                  {trip.status}
                </span>

              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-5">

                <div className="flex items-center gap-2">
                  <User className="text-blue-600" />
                  {trip.patient}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="text-red-600" />
                  {trip.location}
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="text-green-600" />
                  ETA: {trip.etaMinutes ?? trip.eta}
                </div>

                <div className="flex items-center gap-2">
                  <HeartPulse className="text-pink-600" />
                  Destination:
                  {trip.destination}
                </div>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}