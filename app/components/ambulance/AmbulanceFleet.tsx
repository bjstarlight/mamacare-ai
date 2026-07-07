"use client";

export default function AmbulanceFleet() {
  const fleet = [
    { id: "A1", status: "Available" },
    { id: "A2", status: "On Trip" },
    { id: "A3", status: "Maintenance" },
    { id: "A4", status: "Available" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow">

      <h2 className="text-xl font-bold mb-4">
        Ambulance Fleet
      </h2>

      <div className="grid md:grid-cols-2 gap-4">

        {fleet.map((a) => (
          <div
            key={a.id}
            className="border p-4 rounded-lg"
          >
            <h3 className="font-bold">
              Ambulance {a.id}
            </h3>

            <p className="text-sm text-gray-500">
              Status: {a.status}
            </p>
          </div>
        ))}

      </div>

    </div>
  );
}