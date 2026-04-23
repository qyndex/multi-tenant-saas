"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [orgName, setOrgName] = useState("");

  return (
    <main className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Organization Settings</h1>
      <label className="block mb-2 font-medium">Org Name</label>
      <input
        className="border rounded px-3 py-2 w-full"
        value={orgName}
        onChange={(e) => setOrgName(e.target.value)}
      />
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Billing</h2>
        <p className="text-gray-600">Manage subscription via Stripe portal.</p>
      </section>
    </main>
  );
}
