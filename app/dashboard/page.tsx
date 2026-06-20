import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Get full user data with credits
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      credits: true,
      createdAt: true,
    },
  });

  // Get recent uploads
  const recentUploads = await prisma.upload.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      filename: true,
      originalUrl: true,
      processedUrl: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950">
      <Navbar user={{ name: dbUser?.name ?? null, email: dbUser?.email ?? "", credits: dbUser?.credits ?? 0 }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {dbUser?.name || "there"} 👋
          </h1>
          <p className="text-zinc-400 mt-1">
            Upload an image and let AI remove watermarks in seconds.
          </p>
        </div>

        <DashboardClient
          userId={user.id}
          credits={dbUser?.credits ?? 0}
          initialUploads={recentUploads.map((u) => ({
            ...u,
            createdAt: u.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}