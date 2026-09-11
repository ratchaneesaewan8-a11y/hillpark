"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MapPinned, Tags, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "./signout";

const LINKS = [
  { href: "/admin", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/admin/tours", label: "จัดการทัวร์", icon: MapPinned },
  { href: "/admin/categories", label: "หมวดหมู่", icon: Tags },
  { href: "/admin/bookings", label: "การจอง", icon: CalendarCheck },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-60 shrink-0 flex-col bg-brand-green p-4 text-white">
      <div className="mb-6 px-2 py-2 text-lg font-bold">HILLPARK<span className="text-brand-orange"> Admin</span></div>
      <nav className="flex-1 space-y-1">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                active ? "bg-brand-orange font-semibold text-white" : "text-white/70 hover:bg-white/10"
              )}
            >
              <Icon size={18} /> {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 pt-2">
        <SignOutButton />
      </div>
    </aside>
  );
}
