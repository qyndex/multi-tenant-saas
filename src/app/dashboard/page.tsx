import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { OrgWithRole, MemberWithProfile } from "@/types/database";
import { OrgSwitcher } from "@/components/org-switcher";
import { MemberList } from "@/components/member-list";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch all orgs the user belongs to, with their role
  const { data: memberships } = await supabase
    .from("org_members")
    .select("role, organizations(*)")
    .eq("user_id", user.id);

  const orgs: OrgWithRole[] = (memberships ?? []).map((m) => ({
    ...(m.organizations as unknown as OrgWithRole),
    role: m.role,
  }));

  // Determine active org (from query param or first org)
  const params = await searchParams;
  const activeOrgSlug = params.org ?? orgs[0]?.slug;
  const activeOrg = orgs.find((o) => o.slug === activeOrgSlug) ?? orgs[0];

  // Fetch members of the active org
  let members: MemberWithProfile[] = [];
  if (activeOrg) {
    const { data: orgMembers } = await supabase
      .from("org_members")
      .select("*, profiles(*)")
      .eq("org_id", activeOrg.id)
      .order("role", { ascending: true });

    members = (orgMembers ?? []) as MemberWithProfile[];
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top navigation */}
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold">SaaS Platform</h1>
          {orgs.length > 0 && (
            <OrgSwitcher orgs={orgs} activeSlug={activeOrg?.slug ?? ""} />
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {profile?.full_name ?? user.email}
          </span>
          <a
            href="/settings"
            className="text-sm text-gray-500 hover:text-gray-700"
            aria-label="Settings"
          >
            Settings
          </a>
          <SignOutButton />
        </div>
      </nav>

      {/* Dashboard content */}
      <div className="max-w-5xl mx-auto p-8">
        {activeOrg ? (
          <>
            {/* Org overview */}
            <div className="bg-white rounded-xl border p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{activeOrg.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    /{activeOrg.slug} &middot;{" "}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {activeOrg.plan}
                    </span>{" "}
                    plan
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Your role</p>
                  <p className="text-sm font-medium capitalize">{activeOrg.role}</p>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl border p-6">
                <p className="text-sm text-gray-500">Members</p>
                <p className="text-3xl font-bold mt-1">{members.length}</p>
              </div>
              <div className="bg-white rounded-xl border p-6">
                <p className="text-sm text-gray-500">Plan</p>
                <p className="text-3xl font-bold mt-1 capitalize">{activeOrg.plan}</p>
              </div>
              <div className="bg-white rounded-xl border p-6">
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-3xl font-bold mt-1">
                  {new Date(activeOrg.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Member list */}
            <div className="bg-white rounded-xl border">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold">Team Members</h3>
              </div>
              <MemberList members={members} />
            </div>
          </>
        ) : (
          /* No orgs — prompt to create one */
          <div className="bg-white rounded-xl border p-12 text-center">
            <h2 className="text-xl font-bold mb-2">Welcome to SaaS Platform</h2>
            <p className="text-gray-500 mb-6">
              You are not a member of any organization yet.
            </p>
            <a
              href="/settings?tab=create-org"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              aria-label="Create your first organization"
            >
              Create Organization
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
