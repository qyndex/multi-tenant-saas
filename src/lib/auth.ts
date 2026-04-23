import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Get the authenticated user or redirect to login.
 * Use in Server Components and Route Handlers.
 */
export async function requireAuth() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return { supabase, user };
}

/**
 * Get the authenticated user without redirecting.
 * Returns null if not authenticated.
 */
export async function getOptionalUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
