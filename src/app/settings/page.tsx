import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile-form";
import { OrgSettingsForm } from "@/components/org-settings-form";
import { CreateOrgForm } from "@/components/create-org-form";
import { SignOutButton } from "@/components/sign-out-button";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch orgs where user is owner or admin
  const { data: memberships } = await supabase
    .from("org_members")
    .select("role, organizations(*)")
    .eq("user_id", user.id)
    .in("role", ["owner", "admin"]);

  const managedOrgs = (memberships ?? []).map((m) => ({
    ...(m.organizations as unknown as { id: string; name: string; slug: string; plan: string }),
    role: m.role,
  }));

  const params = await searchParams;
  const tab = params.tab ?? "profile";

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="text-lg font-bold hover:text-blue-600">
            SaaS Platform
          </a>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">Settings</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {profile?.full_name ?? user.email}
          </span>
          <SignOutButton />
        </div>
      </nav>

      <div className="max-w-2xl mx-auto p-8 space-y-8">
        {/* Tab navigation */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg" role="tablist">
          {[
            { id: "profile", label: "Profile" },
            { id: "organizations", label: "Organizations" },
            { id: "create-org", label: "Create Org" },
          ].map((t) => (
            <a
              key={t.id}
              href={`/settings?tab=${t.id}`}
              role="tab"
              aria-selected={tab === t.id}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </a>
          ))}
        </div>

        {/* Tab content */}
        {tab === "profile" && profile && (
          <ProfileForm profile={profile} />
        )}

        {tab === "organizations" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Your Organizations</h2>
            {managedOrgs.length === 0 ? (
              <p className="text-gray-500 text-sm">
                You are not an owner or admin of any organization.
              </p>
            ) : (
              <div className="space-y-4">
                {managedOrgs.map((org) => (
                  <OrgSettingsForm key={org.id} org={org} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "create-org" && <CreateOrgForm />}
      </div>
    </main>
  );
}
