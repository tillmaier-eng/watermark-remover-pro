import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const uploads = await prisma.upload.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      filename: true,
      originalUrl: true,
      status: true,
      fileSize: true,
      processingMs: true,
      createdAt: true,
    },
  });

  const totalSize = uploads.reduce((sum, u) => sum + u.fileSize, 0);
  const completed = uploads.filter((u) => u.status === "COMPLETED").length;

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Upload History</h1>
        <p className="text-zinc-400 mt-1">All images you have processed.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase">Total</p>
          <p className="text-2xl font-bold text-white mt-1">{uploads.length}</p>
        </div>
        <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase">Completed</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{completed}</p>
        </div>
        <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase">Total size</p>
          <p className="text-2xl font-bold text-white mt-1">{formatBytes(totalSize)}</p>
        </div>
      </div>

      {/* List */}
      <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl overflow-hidden">
        {uploads.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📁</div>
            <p className="text-white font-medium mb-2">No uploads yet</p>
            <p className="text-sm text-zinc-500 mb-4">Upload your first image to get started.</p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-sm font-medium rounded-lg transition"
            >
              Upload now
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {uploads.map((u) => (
              <div key={u.id} className="flex items-center gap-4 p-4 hover:bg-zinc-800/30 transition">
                <img
                  src={u.originalUrl}
                  alt={u.filename}
                  className="w-14 h-14 object-cover rounded-lg bg-zinc-800 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{u.filename}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {new Date(u.createdAt).toLocaleString()} · {formatBytes(u.fileSize)}
                    {u.processingMs && ` · ${u.processingMs}ms`}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    u.status === "COMPLETED"
                      ? "bg-green-500/10 text-green-400 border border-green-500/30"
                      : u.status === "FAILED"
                      ? "bg-red-500/10 text-red-400 border border-red-500/30"
                      : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                  }`}
                >
                  {(u.status ?? "pending").toLowerCase()}
                </span>
                <a
                  href={u.originalUrl}
                  download={u.filename}
                  className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition flex-shrink-0"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}