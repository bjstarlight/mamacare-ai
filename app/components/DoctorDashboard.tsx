"use client";

type Props = {
  motherName: string;
  babyName: string;
  bloodGroup: string;
  pregnancyWeek: string;
  risk: string;
  protectedRecords: number;
  lastVerified: string;
};

export default function DoctorDashboard({
  motherName,
  babyName,
  bloodGroup,
  pregnancyWeek,
  risk,
  protectedRecords,
  lastVerified,
}: Props) {
  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-600 p-8 text-white shadow-xl">

        <h1 className="text-3xl font-bold">
          Doctor Dashboard
        </h1>

        <p className="opacity-90 mt-2">
          Verified Clinical Record
        </p>

      </div>

      {/* Status */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="rounded-2xl bg-green-50 border border-green-200 p-5">

          <p className="text-gray-500 text-sm">
            Verification
          </p>

          <h2 className="text-xl font-bold text-green-700">
            VERIFIED
          </h2>

        </div>

        <div className="rounded-2xl bg-white shadow p-5">

          <p className="text-gray-500 text-sm">
            Protected Records
          </p>

          <h2 className="text-2xl font-bold">
            {protectedRecords}
          </h2>

        </div>

        <div className="rounded-2xl bg-white shadow p-5">

          <p className="text-gray-500 text-sm">
            Pregnancy
          </p>

          <h2 className="text-2xl font-bold">
            {pregnancyWeek} Weeks
          </h2>

        </div>

        <div className="rounded-2xl bg-white shadow p-5">

          <p className="text-gray-500 text-sm">
            AI Risk
          </p>

          <h2 className="text-xl font-bold text-green-700">
            {risk}
          </h2>

        </div>

      </div>

      {/* Patient Card */}

      <div className="rounded-3xl bg-white shadow-lg p-6">

        <h2 className="text-xl font-bold mb-6">
          Patient Information
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div>

            <p className="text-gray-500">
              Mother
            </p>

            <h3 className="text-xl font-semibold">
              {motherName}
            </h3>

          </div>

          <div>

            <p className="text-gray-500">
              Baby
            </p>

            <h3 className="text-xl font-semibold">
              {babyName}
            </h3>

          </div>

          <div>

            <p className="text-gray-500">
              Blood Group
            </p>

            <h3 className="text-xl font-semibold">
              {bloodGroup}
            </h3>

          </div>

          <div>

            <p className="text-gray-500">
              Last Verification
            </p>

            <h3 className="text-xl font-semibold">
              {lastVerified}
            </h3>

          </div>

        </div>

      </div>

    </div>
  );
}