"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Overview", icon: "📊", exact: true },
  { href: "/dashboard/history", label: "History", icon: "📁", exact: false },
  { href: "/dashboard/billing", label: "Billing", icon: "💳", exact: false },
  { href: "/dashboard/profile", label: "Profile", icon: "👤", exact: false },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-60 lg:flex-shrink-0">
      <nav className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-3 space-y-1">
        {links.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(link.href + "/");

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                active
                  ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}