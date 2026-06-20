"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface NavbarProps {
  user?: { name: string | null; email: string; credits: number } | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/30 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-white font-semibold hidden sm:inline">
              Watermark Remover Pro
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/#features"
              className={`text-sm ${pathname === "/" ? "text-white" : "text-zinc-400 hover:text-white"} transition`}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className={`text-sm ${pathname === "/pricing" ? "text-white" : "text-zinc-400 hover:text-white"} transition`}
            >
              Pricing
            </Link>
            <Link
              href="/api-docs"
              className={`text-sm ${pathname === "/api-docs" ? "text-white" : "text-zinc-400 hover:text-white"} transition`}
            >
              API
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-lg">
                  <span className="text-xs text-zinc-400">Credits:</span>
                  <span className="text-sm font-medium text-white">{user.credits}</span>
                </div>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm text-zinc-300 hover:text-white transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-zinc-300 hover:text-white transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition"
                >
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}