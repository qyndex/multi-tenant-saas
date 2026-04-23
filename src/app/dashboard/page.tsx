import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) return <p>Not authenticated</p>;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Organization Dashboard</h1>
      <p>Welcome back, {session.user?.name ?? "User"}</p>
    </main>
  );
}
