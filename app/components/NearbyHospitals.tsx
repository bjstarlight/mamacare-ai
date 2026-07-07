"use client";

export default function NearbyHospitals() {

  function findHospitals() {

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        window.open(
          `https://www.google.com/maps/search/hospitals/@${latitude},${longitude},15z`,
          "_blank"
        );

      },
      () => {
        alert("Unable to retrieve your location.");
      }
    );
  }

  return (
    <div className="mt-6 rounded-xl border bg-white p-5">

      <h2 className="text-xl font-bold text-red-700">
        🏥 Nearby Hospitals
      </h2>

      <p className="mt-2 text-gray-600">
        Find hospitals closest to your current location.
      </p>

      <button
        onClick={findHospitals}
        className="mt-4 rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700"
      >
        📍 Find Nearby Hospitals
      </button>

    </div>
  );
}