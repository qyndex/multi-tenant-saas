"use client";

import { useRouter } from "next/navigation";
import type { OrgWithRole } from "@/types/database";

interface OrgSwitcherProps {
  orgs: OrgWithRole[];
  activeSlug: string;
}

/**
 * Dropdown to switch between organizations the user belongs to.
 * Changes the ?org= query param to reload the dashboard with the selected org.
 */
export function OrgSwitcher({ orgs, activeSlug }: OrgSwitcherProps) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(`/dashboard?org=${encodeURIComponent(e.target.value)}`);
  }

  if (orgs.length <= 1) {
    return (
      <span className="text-sm text-gray-500 font-medium">
        {orgs[0]?.name ?? "No organization"}
      </span>
    );
  }

  return (
    <select
      value={activeSlug}
      onChange={handleChange}
      className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Switch organization"
    >
      {orgs.map((org) => (
        <option key={org.id} value={org.slug}>
          {org.name}
        </option>
      ))}
    </select>
  );
}
