import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <h1 className="text-4xl font-bold mb-4">Multi-Tenant SaaS</h1>
      <p className="text-lg text-gray-600 mb-8">
        Built with Next.js, Supabase, and TypeScript
      </p>
      <div className="flex gap-4">
        <Link
          href="/auth/login"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
        >
          Sign In
        </Link>
        <Link
          href="/auth/signup"
          className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-white font-medium"
        >
          Sign Up
        </Link>
      </div>
    </main>
  );
}
