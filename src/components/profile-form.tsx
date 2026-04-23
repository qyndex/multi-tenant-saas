"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

interface ProfileFormProps {
  profile: Profile;
}

/**
 * Editable profile form. Updates the profiles table in Supabase.
 */
export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, avatar_url: avatarUrl })
      .eq("id", profile.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Profile updated successfully.");
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4">
      <h2 className="text-xl font-bold">Profile</h2>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={profile.email}
          disabled
          className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          aria-label="Email (read-only)"
        />
      </div>

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Full name"
        />
      </div>

      <div>
        <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Avatar URL
        </label>
        <input
          id="avatarUrl"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/avatar.jpg"
          aria-label="Avatar URL"
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
        disabled={saving}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        aria-label="Save profile"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
