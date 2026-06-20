import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      credits: true,
      createdAt: true,
      _count: {
        select: { uploads: true, transactions: true },
      },
    },
  });

  const totalUploads = dbUser?._count.uploads ?? 0;
  const memberSince = dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Billing & Plan</h1>
        <p className="text-zinc-400 mt-1">Manage your subscription and credits.</p>
      </div>

      {/* Current Plan */}
      <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-xs font-medium text-zinc-300">
                Current plan
              </span>
              <span className="px-2.5 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-xs font-medium text-green-400">
                Active
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white">Free</h2>
            <p className="text-sm text-zinc-400 mt-1">Member since {memberSince}</p>
          </div>
          <Link
            href="/pricing"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium rounded-xl transition"
          >
            Upgrade plan
          </Link>
        </div>
      </div>

      {/* Credits */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-6">
          <p className="text-sm text-zinc-400">Credits remaining</p>
          <p className="text-5xl font-bold text-white mt-2">{dbUser?.credits ?? 0}</p>
          <p className="text-xs text-zinc-500 mt-2">1 credit = 1 watermark removal</p>
        </div>
        <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-6">
          <p className="text-sm text-zinc-400">Images processed</p>
          <p className="text-5xl font-bold text-white mt-2">{totalUploads}</p>
          <p className="text-xs text-zinc-500 mt-2">All-time usage</p>
        </div>
      </div>

      {/* Free plan features */}
      <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Your plan includes</h3>
        <ul className="space-y-3">
          {[
            { label: "3 free credits on signup", included: true },
            { label: "Up to 5MB per image", included: true },
            { label: "PNG output format", included: true },
            { label: "AI watermark removal (browser-based)", included: true },
            { label: "Batch processing", included: false },
            { label: "API access", included: false },
            { label: "Priority processing", included: false },
          ].map((item) => (
            <li key={item.label} className="flex items-center gap-3 text-sm">
              <span className={item.included ? "text-green-400" : "text-zinc-600"}>
                {item.included ? "✓" : "✗"}
              </span>
              <span className={item.included ? "text-zinc-200" : "text-zinc-500"}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Upgrade CTA */}
      <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Need more power?</h3>
        <p className="text-sm text-zinc-300 mb-4">
          Upgrade to Pro for 100 credits/month, larger files, and API access.
        </p>
        <Link
          href="/pricing"
          className="inline-block px-6 py-2.5 bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-100 transition"
        >
          View plans →
        </Link>
      </div>

      <p className="text-xs text-zinc-500 text-center">
        💡 Stripe payments are coming soon. The plan system is ready — just needs the payment gateway.
      </p>
    </div>
  );
}