"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ImageEditor } from "@/components/image-editor";

interface Upload {
  id: string;
  filename: string;
  originalUrl: string;
  processedUrl: string | null;
  status: string;
  createdAt: string;
}

interface Props {
  userId: string;
  credits: number;
  initialUploads: Upload[];
}

export function DashboardClient({ userId, credits: initialCredits, initialUploads }: Props) {
  const [uploads, setUploads] = useState<Upload[]>(initialUploads);
  const [credits, setCredits] = useState(initialCredits);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUpload, setCurrentUpload] = useState<Upload | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    if (credits < 1) {
      setError("No credits remaining. Please upgrade your plan.");
      return;
    }

    setUploading(true);
    setError(null);
    setCurrentUpload(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        setUploading(false);
        return;
      }

      setUploads((prev) => [data.upload, ...prev]);
      setCurrentUpload({
        ...data.upload,
        createdAt: data.upload.createdAt,
      });
      setUploading(false);
    } catch (e) {
      setError("Network error. Please try again.");
      setUploading(false);
    }
  }, [credits]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main: Upload + Editor */}
      <div className="lg:col-span-2 space-y-6">
        {/* Credits Banner */}
        <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Credits remaining</p>
              <p className="text-4xl font-bold text-white mt-1">{credits}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-400 mb-2">Need more?</p>
              <a
                href="/pricing"
                className="inline-block px-4 py-2 bg-white text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-100 transition"
              >
                Upgrade
              </a>
            </div>
          </div>
        </div>

        {/* Dropzone OR Editor */}
        {!currentUpload ? (
          <div
            {...getRootProps()}
            className={`bg-zinc-900/50 backdrop-blur border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${
              isDragActive
                ? "border-purple-500 bg-purple-500/10"
                : "border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div>
                <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-white font-medium">Uploading...</p>
              </div>
            ) : (
              <div>
                <div className="text-5xl mb-4">📤</div>
                <p className="text-white font-medium text-lg mb-2">
                  {isDragActive ? "Drop your image here" : "Drop image or click to upload"}
                </p>
                <p className="text-sm text-zinc-500">
                  JPEG, PNG, or WebP · Max 25MB
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Processing: {currentUpload.filename}
              </h2>
              <button
                onClick={() => setCurrentUpload(null)}
                className="text-sm text-zinc-400 hover:text-white"
              >
                ← Upload another
              </button>
            </div>
            <ImageEditor
              uploadId={currentUpload.id}
              imageUrl={currentUpload.originalUrl}
              onComplete={(remaining) => setCredits(remaining)}
            />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Sidebar: Recent uploads */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Recent uploads
        </h3>
        {uploads.length === 0 ? (
          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-6 text-center">
            <p className="text-sm text-zinc-500">No uploads yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {uploads.slice(0, 10).map((u) => (
              <button
                key={u.id}
                onClick={() => u.status !== "FAILED" && setCurrentUpload(u)}
                className="w-full flex items-center gap-3 bg-zinc-900/50 backdrop-blur border border-zinc-800 hover:border-zinc-700 rounded-xl p-3 text-left transition"
              >
                <img
                  src={u.originalUrl}
                  alt={u.filename}
                  className="w-12 h-12 object-cover rounded-lg bg-zinc-800"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{u.filename}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(u.createdAt).toLocaleDateString()} ·{" "}
                    <span
                      className={
                        u.status === "COMPLETED"
                          ? "text-green-400"
                          : u.status === "FAILED"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }
                    >
                      {(u.status ?? "pending").toLowerCase()}
                    </span>
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}