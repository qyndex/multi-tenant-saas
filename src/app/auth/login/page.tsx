"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-8 border rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        <p className="text-gray-600 text-center text-sm">
          Sign in to access your dashboard
        </p>
        <button
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="w-full bg-gray-900 text-white py-2 px-4 rounded hover:bg-gray-800"
        >
          Continue with GitHub
        </button>
      </div>
    </main>
  );
}
