"use client";

import PopulationKPICards from "./PopulationKPICards";
import RiskDistributionChart from "./RiskDistributionChart";
import AdmissionsTrendChart from "./AdmissionsTrendChart"
import EmergencyOverview from "./EmergencyOverview";
import BlockchainOverview from "./BlockchainOverview";
import ReferralOverview from "./ReferralOverview";
import HospitalPredictions from "./HospitalPredictions";
import HospitalBedOccupancy from "./HospitalBedOccupancy";
import PopulationActivityFeed from "./PopulationActivityFeed";

import {
  Building2,
  Activity,
  ShieldCheck,
} from "lucide-react";

export default function HospitalPopulationDashboard() {
  return (
    <div className="space-y-6">

      {/* =======================================
          HEADER
      ======================================== */}

      <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-600 text-white p-6 shadow-xl">

        <div className="flex items-center justify-between">

          <div>

            <div className="flex items-center gap-3">

              <Building2 className="w-7 h-7" />

              <h1 className="text-3xl font-bold">
                AI Population Health Dashboard
              </h1>

            </div>

            <p className="mt-2 text-blue-100">
              Hospital Command Centre • Maternal & Child Healthcare
            </p>

          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2">

            <ShieldCheck className="w-5 h-5" />

            <span className="font-semibold">
              BOT Chain Active
            </span>

          </div>

        </div>

      </div>

      {/* =======================================
            KPI ROW
      ======================================== */}

      <PopulationKPICards />

      {/* =======================================
           ANALYTICS ROW
      ======================================== */}

      <div className="grid xl:grid-cols-2 gap-6">

        <RiskDistributionChart />

        <AdmissionsTrendChart />

      </div>

      {/* =======================================
            SECOND ROW
      ======================================== */}

      <div className="grid xl:grid-cols-2 gap-6">

        <EmergencyOverview />

        <ReferralOverview />

      </div>

      {/* =======================================
            THIRD ROW
      ======================================== */}

      <div className="grid xl:grid-cols-2 gap-6">

        <BlockchainOverview />

        <HospitalPredictions />

      </div>

      {/* =======================================
            BED OCCUPANCY
      ======================================== */}

      <HospitalBedOccupancy />

      {/* =======================================
            LIVE FEED
      ======================================== */}

      <PopulationActivityFeed />

      {/* =======================================
            FOOTER
      ======================================== */}

      <div className="rounded-xl border bg-white p-5">

        <div className="flex items-center gap-3">

          <Activity className="text-blue-600" />

          <div>

            <h3 className="font-semibold">
              AI Population Surveillance
            </h3>

            <p className="text-sm text-gray-500">

              This dashboard aggregates maternal health indicators,
              emergency referrals, blockchain verified medical records,
              AI predictions and hospital operational metrics in real time.

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}