"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  initialName: string;
  email: string;
  memberSince: string;
  totalUploads: number;
}

export function ProfileForm({ initialName, email, memberSince, totalUploads }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setSavingName(true);
    setNameMsg(null);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNameMsg({ type: "error", text: data.error || "Failed to save" });
      } else {
        setNameMsg({ type: "success", text: "✓ Name updated" });
        router.refresh();
      }
    } catch {
      setNameMsg({ type: "error", text: "Network error" });
    } finally {
      setSavingName(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match" });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordMsg({ type: "error", text: data.error || "Failed to change password" });
      } else {
        setPasswordMsg({ type: "success", text: "✓ Password changed successfully" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordMsg({ type: "error", text: "Network error" });
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Account Info */}
      <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-zinc-500">Email</p>
            <p className="text-white font-medium mt-1">{email}</p>
          </div>
          <div>
            <p className="text-zinc-500">Member since</p>
            <p className="text-white font-medium mt-1">{memberSince}</p>
          </div>
          <div>
            <p className="text-zinc-500">Total uploads</p>
            <p className="text-white font-medium mt-1">{totalUploads}</p>
          </div>
          <div>
            <p className="text-zinc-500">Account type</p>
            <p className="text-white font-medium mt-1">Free</p>
          </div>
        </div>
      </div>

      {/* Edit Name */}
      <form onSubmit={saveName} className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Display Name</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="flex-1 px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={savingName}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
          >
            {savingName ? "Saving..." : "Save"}
          </button>
        </div>
        {nameMsg && (
          <p className={`text-sm mt-3 ${nameMsg.type === "success" ? "text-green-400" : "text-red-400"}`}>
            {nameMsg.text}
          </p>
        )}
      </form>

      {/* Change Password */}
      <form onSubmit={changePassword} className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
        <div className="space-y-3">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (min 8 chars)"
            className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={savingPassword}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
          >
            {savingPassword ? "Changing..." : "Change password"}
          </button>
        </div>
        {passwordMsg && (
          <p className={`text-sm mt-3 ${passwordMsg.type === "success" ? "text-green-400" : "text-red-400"}`}>
            {passwordMsg.text}
          </p>
        )}
      </form>
    </div>
  );
}