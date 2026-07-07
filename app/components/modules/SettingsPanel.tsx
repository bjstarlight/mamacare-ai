"use client";

import { useEffect, useState } from "react";
import { Bell, Heart, User } from "lucide-react";
import {
  readJSON,
  readString,
  STORAGE_KEYS,
  writeJSON,
  writeString,
} from "../../lib/storage/storageService";
import ModuleSection from "../layout/ModuleSection";

export default function SettingsPanel() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [careType, setCareType] = useState("both");
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const user = readJSON<{ name?: string; contact?: string }>(STORAGE_KEYS.authUser, {});
    const mother = readJSON<{ name?: string }>(STORAGE_KEYS.motherProfile, {});
    setName(user.name ?? mother.name ?? "");
    setContact(user.contact ?? "");
    setCareType(readString(STORAGE_KEYS.careType, "both"));
    setNotifications(readString(STORAGE_KEYS.notificationsEnabled) === "true");
  }, []);

  function save() {
    writeJSON(STORAGE_KEYS.authUser, { name, contact });
    writeJSON(STORAGE_KEYS.motherProfile, {
      ...readJSON(STORAGE_KEYS.motherProfile, {}),
      name,
    });
    writeString(STORAGE_KEYS.careType, careType);
    writeString(STORAGE_KEYS.notificationsEnabled, notifications ? "true" : "false");
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <ModuleSection title="Account" eyebrow="Settings" icon={User}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#8A7A6D]">
              Name
            </span>
            <input
              className="mt-2 w-full rounded-xl border border-[#EFE4DC] bg-white px-4 py-3 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#8A7A6D]">
              Contact
            </span>
            <input
              className="mt-2 w-full rounded-xl border border-[#EFE4DC] bg-white px-4 py-3 text-sm"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </label>
        </div>
      </ModuleSection>

      <ModuleSection title="Care focus" eyebrow="Personalization" icon={Heart}>
        <div className="flex flex-wrap gap-2">
          {(["pregnancy", "baby", "both"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setCareType(type)}
              className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
                careType === type
                  ? "bg-[#6B2545] text-white"
                  : "border border-[#EFE4DC] bg-white text-[#5C4C40]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </ModuleSection>

      <ModuleSection title="Notifications" eyebrow="Alerts" icon={Bell}>
        <label className="flex items-center justify-between rounded-xl border border-[#EFE4DC] bg-white p-4">
          <div>
            <p className="text-sm font-semibold text-[#2B2118]">Care reminders</p>
            <p className="text-xs text-[#8A7A6D]">AI alerts, appointments, and vaccines</p>
          </div>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="h-5 w-5 rounded accent-[#6B2545]"
          />
        </label>
      </ModuleSection>

      <button
        type="button"
        onClick={save}
        className="rounded-xl bg-[#6B2545] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#7D2B4F]"
      >
        {saved ? "Saved ✓" : "Save settings"}
      </button>
    </div>
  );
}
