"use client";

import { useEffect, useState } from "react";
import {
  User,
  MapPin,
  HeartPulse,
  Save,
  WifiOff,
  ShieldAlert,
  Ambulance,
  Hospital,
} from "lucide-react";
import { runAIOrchestrator } from "../lib/AIOrchestrator";
import PortalLayout from "../components/layout/PortalLayout";

export default function CommunityHealthWorkerPage() {
  const [motherName, setMotherName] = useState("");
  const [phone, setPhone] = useState("");
  const [village, setVillage] = useState("");
  const [pregnancyWeek, setPregnancyWeek] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  const [bp, setBp] = useState("");
  const [weight, setWeight] = useState("");
  const [temperature, setTemperature] = useState("");

  const [dangerSigns, setDangerSigns] = useState<string[]>([]);

  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    const saved = JSON.parse(
      window.localStorage.getItem("chwPatients") || "[]"
    );

    setPatients(saved);
    runAIOrchestrator();
  }, []);

  function toggleDanger(sign: string) {
    if (dangerSigns.includes(sign)) {
      setDangerSigns(
        dangerSigns.filter((x) => x !== sign)
      );
    } else {
      setDangerSigns([...dangerSigns, sign]);
    }
  }

  function saveOffline() {
    const patient = {
      name: motherName,
      phone,
      village,
      pregnancyWeek,
      bloodGroup,
      bp,
      weight,
      temperature,
      dangerSigns,
      createdAt: new Date().toLocaleString(),
      synced: false,
    };

    const updated = [...patients, patient];

    window.localStorage.setItem(
      "chwPatients",
      JSON.stringify(updated)
    );

    setPatients(updated);

    alert("Saved Offline Successfully");
  }

  function triggerSOS() {
    window.localStorage.setItem(
      "EmergencySOS",
      JSON.stringify({
        patient: motherName,
        village,
        dangerSigns,
        time: new Date().toISOString(),
      })
    );

    alert("Emergency SOS Sent");
  }

  function createReferral() {
    const referrals = JSON.parse(
      window.localStorage.getItem("referrals") || "[]"
    );

    referrals.push({
      patient: motherName,
      village,
      reason: dangerSigns.join(", "),
      status: "Pending",
      createdAt: new Date().toISOString(),
    });

    window.localStorage.setItem(
      "referrals",
      JSON.stringify(referrals)
    );

    alert("Referral Created");
  }

  return (
    <PortalLayout
      title="Community Health Worker"
      eyebrow="CHW Portal"
      description="Offline patient registration, vitals, danger signs, and referrals."
    >
    <div className="space-y-8">

      {/* Dashboard */}

      <div className="grid md:grid-cols-4 gap-4 mb-8">

        <div className="bg-white rounded-xl p-5 shadow">

          <User />

          <h2 className="text-xl font-bold">
            {patients.length}
          </h2>

          <p>Registered Mothers</p>

        </div>

        <div className="bg-white rounded-xl p-5 shadow">

          <HeartPulse />

          <h2 className="text-xl font-bold">
            {
              patients.filter(
                (x) =>
                  x.dangerSigns &&
                  x.dangerSigns.length > 0
              ).length
            }
          </h2>

          <p>High Risk</p>

        </div>

        <div className="bg-white rounded-xl p-5 shadow">

          <MapPin />

          <h2 className="text-xl font-bold">
            Plateau
          </h2>

          <p>Assigned Community</p>

        </div>

        <div className="bg-white rounded-xl p-5 shadow">

          <WifiOff />

          <h2 className="text-xl font-bold">
            Offline
          </h2>

          <p>Sync Pending</p>

        </div>

      </div>

      {/* Registration */}

      <div className="bg-white rounded-xl p-6 shadow mb-8">

        <h2 className="font-bold text-xl mb-4">
          Register Pregnant Woman
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          <input
            placeholder="Mother Name"
            className="border p-3 rounded"
            value={motherName}
            onChange={(e) =>
              setMotherName(e.target.value)
            }
          />

          <input
            placeholder="Phone"
            className="border p-3 rounded"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
          />

          <input
            placeholder="Village"
            className="border p-3 rounded"
            value={village}
            onChange={(e) =>
              setVillage(e.target.value)
            }
          />

          <input
            placeholder="Pregnancy Week"
            className="border p-3 rounded"
            value={pregnancyWeek}
            onChange={(e) =>
              setPregnancyWeek(e.target.value)
            }
          />

          <input
            placeholder="Blood Group"
            className="border p-3 rounded"
            value={bloodGroup}
            onChange={(e) =>
              setBloodGroup(e.target.value)
            }
          />

        </div>

      </div>

      {/* Home Visit */}

      <div className="bg-white rounded-xl p-6 shadow mb-8">

        <h2 className="font-bold text-xl mb-4">
          Home Visit Assessment
        </h2>

        <div className="grid md:grid-cols-3 gap-4">

          <input
            placeholder="Blood Pressure"
            className="border p-3 rounded"
            value={bp}
            onChange={(e) => setBp(e.target.value)}
          />

          <input
            placeholder="Weight"
            className="border p-3 rounded"
            value={weight}
            onChange={(e) =>
              setWeight(e.target.value)
            }
          />

          <input
            placeholder="Temperature"
            className="border p-3 rounded"
            value={temperature}
            onChange={(e) =>
              setTemperature(e.target.value)
            }
          />

        </div>

        <h3 className="font-semibold mt-6 mb-2">
          Danger Signs
        </h3>

        <div className="grid md:grid-cols-2 gap-2">

          {[
            "Bleeding",
            "Convulsions",
            "Severe Headache",
            "Swollen Feet",
            "Fever",
            "Labour Pain",
          ].map((item) => (

            <label
              key={item}
              className="flex gap-2 items-center"
            >

              <input
                type="checkbox"
                onChange={() => toggleDanger(item)}
              />

              {item}

            </label>

          ))}

        </div>

      </div>

      {/* Actions */}

      <div className="flex gap-4 flex-wrap">

        <button
          onClick={saveOffline}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg flex gap-2"
        >
          <Save size={18} />
          Save Offline
        </button>

        <button
          onClick={triggerSOS}
          className="bg-red-600 text-white px-5 py-3 rounded-lg flex gap-2"
        >
          <Ambulance size={18} />
          Trigger SOS
        </button>

        <button
          onClick={createReferral}
          className="bg-orange-600 text-white px-5 py-3 rounded-lg flex gap-2"
        >
          <Hospital size={18} />
          Create Referral
        </button>

      </div>

      {dangerSigns.length > 0 && (

        <div className="mt-8 bg-red-100 border border-red-300 rounded-xl p-5">

          <div className="flex gap-3 items-center">

            <ShieldAlert className="text-red-700" />

            <div>

              <h2 className="font-bold text-red-700">

                High Risk Pregnancy Detected

              </h2>

              <p className="text-red-700">

                Immediate referral is recommended.

              </p>

            </div>

          </div>

        </div>

      )}

    </div>
    </PortalLayout>
  );
}
