"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Client-side sign-out button. Clears the Supabase session and redirects to home.
 */
export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-gray-500 hover:text-red-600"
      aria-label="Sign out"
    >
      Sign Out
    </button>
  );
}
