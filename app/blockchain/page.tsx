"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Search,
  Copy,
  Database,
  Clock,
  FileText,
  Activity,
} from "lucide-react";
import PortalLayout from "../components/layout/PortalLayout";

type BlockchainRecord = {
  hash: string;
  type: string;
  patient: string;
  timestamp: string;
  status: string;
};

export default function BlockchainExplorer() {
  const [records, setRecords] = useState<BlockchainRecord[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("blockchainRecords") || "[]");

    setRecords(stored);
  }, []);

  const filtered = records.filter((record) =>
    record.patient.toLowerCase().includes(search.toLowerCase()) ||
    record.hash.toLowerCase().includes(search.toLowerCase()) ||
    record.type.toLowerCase().includes(search.toLowerCase())
  );

  function copyHash(hash: string) {
    navigator.clipboard.writeText(hash);
    alert("Hash copied.");
  }

  return (
    <PortalLayout
      title="BOT Chain Explorer"
      eyebrow="Blockchain"
      description="View all verified medical records stored on BOT Chain."
    >
    <div className="rounded-2xl border border-[#EFE4DC] bg-white shadow-sm">

      <div className="max-w-7xl mx-auto p-8 space-y-8">

        {/* Statistics */}

        <div className="grid md:grid-cols-4 gap-5">

          <div className="bg-white rounded-xl p-5 shadow">
            <Database className="text-blue-600 mb-2" />
            <p className="text-sm text-gray-500">Total Records</p>
            <h2 className="text-3xl font-bold">
              {records.length}
            </h2>
          </div>

          <div className="bg-white rounded-xl p-5 shadow">
            <ShieldCheck className="text-green-600 mb-2" />
            <p className="text-sm text-gray-500">Verified</p>
            <h2 className="text-3xl font-bold text-green-600">
              {records.filter(r => r.status === "Verified").length}
            </h2>
          </div>

          <div className="bg-white rounded-xl p-5 shadow">
            <Activity className="text-purple-600 mb-2" />
            <p className="text-sm text-gray-500">
              Network Status
            </p>

            <h2 className="text-xl font-bold text-green-600">
              Online
            </h2>

          </div>

          <div className="bg-white rounded-xl p-5 shadow">
            <Clock className="text-orange-600 mb-2" />
            <p className="text-sm text-gray-500">
              Latest Block
            </p>

            <h2 className="text-xl font-bold">
              #{records.length}
            </h2>

          </div>

        </div>

        {/* Search */}

        <div className="bg-white rounded-xl shadow p-5">

          <div className="relative">

            <Search
              className="absolute left-3 top-3 text-gray-400"
              size={18}
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient, record type or hash..."
              className="w-full border rounded-lg pl-10 pr-4 py-3"
            />

          </div>

        </div>

        {/* Records */}

        <div className="bg-white rounded-xl shadow">

          <table className="w-full">

            <thead className="bg-slate-900 text-white">

              <tr>

                <th className="p-4 text-left">
                  Patient
                </th>

                <th className="p-4 text-left">
                  Record
                </th>

                <th className="p-4 text-left">
                  Hash
                </th>

                <th className="p-4 text-left">
                  Time
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

                <th className="p-4">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {filtered.length === 0 && (

                <tr>

                  <td
                    colSpan={6}
                    className="text-center p-8 text-gray-500"
                  >
                    No blockchain records found.
                  </td>

                </tr>

              )}

              {filtered.map((record, index) => (

                <tr
                  key={index}
                  className="border-b hover:bg-slate-50"
                >

                  <td className="p-4">
                    {record.patient}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">

                      <FileText size={16} />

                      {record.type}

                    </div>
                  </td>

                  <td className="p-4 font-mono text-xs">

                    {record.hash.substring(0,20)}...

                  </td>

                  <td className="p-4">
                    {record.timestamp}
                  </td>

                  <td className="p-4">

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">

                      {record.status}

                    </span>

                  </td>

                  <td className="p-4">

                    <button
                      onClick={() => copyHash(record.hash)}
                      className="bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center gap-2"
                    >

                      <Copy size={15} />

                      Copy

                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
    </PortalLayout>
  );
}