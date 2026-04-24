"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") ? "Authentication failed. Please try again." : null
  );

  const supabase = createClient();

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = isSignUp
      ? await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (isSignUp) {
      setError(null);
      router.push(redirectTo);
      router.refresh();
    } else {
      router.push(redirectTo);
      router.refresh();
    }
  }

  async function handleGitHubLogin() {
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6 p-8 bg-white border rounded-xl shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-center">
          {isSignUp ? "Create Account" : "Sign In"}
        </h1>
        <p className="text-gray-500 text-center text-sm mt-1">
          {isSignUp
            ? "Sign up to create your organization"
            : "Sign in to access your dashboard"}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="you@example.com"
            aria-label="Email address"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Min. 6 characters"
            aria-label="Password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          aria-label={isSignUp ? "Create account" : "Sign in with email"}
        >
          {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-400">or</span>
        </div>
      </div>

      <button
        onClick={handleGitHubLogin}
        disabled={loading}
        className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        aria-label="Continue with GitHub"
      >
        Continue with GitHub
      </button>

      <p className="text-center text-sm text-gray-500">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
          }}
          className="text-blue-600 hover:underline font-medium"
          aria-label={isSignUp ? "Switch to sign in" : "Switch to sign up"}
        >
          {isSignUp ? "Sign In" : "Sign Up"}
        </button>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <Suspense fallback={<div className="text-center text-gray-400">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
