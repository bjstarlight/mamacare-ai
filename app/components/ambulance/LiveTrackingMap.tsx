"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation, Clock, Ambulance } from "lucide-react";

export default function LiveTrackingMap() {
  const [trips, setTrips] = useState<any[]>([]);

  const route = [
    "Village",
    "Primary Health Centre",
    "Highway",
    "City Centre",
    "Hospital Gate",
    "Emergency Unit",
  ];

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("ambulanceTrips") || "[]"
    );

    const initialized = saved.map((trip: any) => ({
      ...trip,
      routeIndex: trip.routeIndex ?? 0,
      etaMinutes: trip.etaMinutes ?? 12,
    }));

    setTrips(initialized);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrips((prev) => {
        const updated = prev.map((trip: any) => {
          if (trip.routeIndex < route.length - 1) {
            return {
              ...trip,
              routeIndex: trip.routeIndex + 1,
              etaMinutes: Math.max(trip.etaMinutes - 2, 0),
              location: route[trip.routeIndex + 1],
              status:
                trip.routeIndex + 1 === route.length - 1
                  ? "Arrived"
                  : "En Route",
            };
          }

          return trip;
        });

        localStorage.setItem(
          "ambulanceTrips",
          JSON.stringify(updated)
        );

        return updated;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-2xl font-bold mb-6">
        Live Ambulance Tracking
      </h2>

      {trips.length === 0 ? (
        <p className="text-gray-500">
          No active ambulance trips.
        </p>
      ) : (
        <div className="space-y-6">

          {trips.map((trip: any) => (

            <div
              key={trip.id}
              className="border rounded-xl p-5"
            >

              <div className="flex justify-between">

                <div>

                  <h3 className="font-bold text-lg">
                    {trip.ambulance}
                  </h3>

                  <p>{trip.patient}</p>

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

              <div className="grid md:grid-cols-3 gap-4 mt-5">

                <div className="flex items-center gap-2">
                  <MapPin className="text-red-600" />
                  <span>{trip.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="text-blue-600" />
                  <span>{trip.etaMinutes} mins</span>
                </div>

                <div className="flex items-center gap-2">
                  <Navigation className="text-green-600" />
                  <span>{trip.destination}</span>
                </div>

              </div>

              <div className="mt-6">

                <div className="w-full bg-gray-200 h-3 rounded-full">

                  <div
                    className="bg-red-600 h-3 rounded-full"
                    style={{
                      width: `${
                        ((trip.routeIndex + 1) / route.length) * 100
                      }%`,
                    }}
                  />

                </div>

                <div className="flex justify-between mt-3 text-sm">

                  {route.map((stop, index) => (

                    <div
                      key={stop}
                      className={`text-center ${
                        index <= trip.routeIndex
                          ? "text-red-600 font-semibold"
                          : "text-gray-400"
                      }`}
                    >
                      <Ambulance size={16} className="mx-auto" />
                      {stop}
                    </div>

                  ))}

                </div>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}