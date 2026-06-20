import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      image: true,
      createdAt: true,
      _count: { select: { uploads: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your account information.</p>
      </div>

      <ProfileForm
        initialName={dbUser?.name ?? ""}
        email={dbUser?.email ?? ""}
        memberSince={dbUser?.createdAt?.toLocaleDateString() ?? ""}
        totalUploads={dbUser?._count.uploads ?? 0}
      />
    </div>
  );
}