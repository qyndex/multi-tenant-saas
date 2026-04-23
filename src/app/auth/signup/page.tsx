import { redirect } from "next/navigation";

/**
 * Signup page — redirects to login with signup mode.
 * The login page handles both sign-in and sign-up flows.
 */
export default function SignUpPage() {
  redirect("/auth/login?mode=signup");
}
