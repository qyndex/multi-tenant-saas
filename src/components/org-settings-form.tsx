"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface OrgSettingsFormProps {
  org: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    role: string;
  };
}

/**
 * Inline editable form for an organization. Only owners/admins see this.
 */
export function OrgSettingsForm({ org }: OrgSettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(org.name);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("organizations")
      .update({ name })
      .eq("id", org.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Organization updated.");
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{org.name}</h3>
        <span className="text-xs text-gray-500 capitalize">
          {org.role} &middot; {org.plan} plan
        </span>
      </div>

      <div>
        <label htmlFor={`org-name-${org.id}`} className="block text-sm font-medium text-gray-700 mb-1">
          Organization Name
        </label>
        <input
          id={`org-name-${org.id}`}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Organization name for ${org.name}`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
        <input
          type="text"
          value={org.slug}
          disabled
          className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          aria-label="Organization slug (read-only)"
        />
      </div>

      {message && (
        <p
          role="status"
          className={`text-sm ${message.startsWith("Error") ? "text-red-600" : "text-green-600"}`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || org.role === "admin"}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        aria-label={`Save changes for ${org.name}`}
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
