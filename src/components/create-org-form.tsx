"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Form to create a new organization. Auto-generates a slug from the name.
 * After creation, adds the current user as the owner in org_members.
 */
export function CreateOrgForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    // Auto-generate slug from name
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setCreating(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in to create an organization.");
      setCreating(false);
      return;
    }

    // Create the organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({ name: name.trim(), slug: slug.trim(), owner_id: user.id })
      .select()
      .single();

    if (orgError) {
      if (orgError.message.includes("duplicate")) {
        setError("An organization with this slug already exists. Choose a different name.");
      } else {
        setError(orgError.message);
      }
      setCreating(false);
      return;
    }

    // Add the creator as owner in org_members
    const { error: memberError } = await supabase
      .from("org_members")
      .insert({
        org_id: org.id,
        user_id: user.id,
        role: "owner",
        joined_at: new Date().toISOString(),
      });

    if (memberError) {
      setError(memberError.message);
      setCreating(false);
      return;
    }

    // Redirect to the new org's dashboard
    router.push(`/dashboard?org=${encodeURIComponent(org.slug)}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4">
      <h2 className="text-xl font-bold">Create Organization</h2>
      <p className="text-sm text-gray-500">
        Create a new organization and invite your team.
      </p>

      <div>
        <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 mb-1">
          Organization Name
        </label>
        <input
          id="org-name"
          type="text"
          required
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Acme Corp"
          aria-label="Organization name"
        />
      </div>

      <div>
        <label htmlFor="org-slug" className="block text-sm font-medium text-gray-700 mb-1">
          Slug
        </label>
        <input
          id="org-slug"
          type="text"
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          placeholder="acme-corp"
          pattern="[a-z0-9-]+"
          aria-label="Organization slug"
        />
        <p className="text-xs text-gray-400 mt-1">
          URL-safe identifier. Lowercase letters, numbers, and hyphens only.
        </p>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={creating || !name.trim() || !slug.trim()}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        aria-label="Create organization"
      >
        {creating ? "Creating..." : "Create Organization"}
      </button>
    </form>
  );
}
