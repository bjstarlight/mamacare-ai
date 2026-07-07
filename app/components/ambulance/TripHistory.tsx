"use client";

export default function TripHistory() {
  const history = JSON.parse(
    localStorage.getItem("ambulanceHistory") || "[]"
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow">

      <h2 className="text-xl font-bold mb-4">
        Completed Trips
      </h2>

      {history.length === 0 ? (
        <p className="text-gray-500">
          No completed trips.
        </p>
      ) : (
        history.map((h: any, i: number) => (
          <div key={i} className="border p-3 rounded-lg mb-3">

            <p className="font-bold">
              {h.patient}
            </p>

            <p className="text-sm text-gray-500">
              {h.destination}
            </p>

          </div>
        ))
      )}

    </div>
  );
}