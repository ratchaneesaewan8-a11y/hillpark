"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, ClipboardList, User } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function MobileTabBar() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const t = (th: string, en: string) => (lang === "en" ? en : th);

  const TABS = [
    { href: "/", icon: Home, th: "หน้าแรก", en: "Home" },
    { href: "/tours", icon: Map, th: "ทริป", en: "Trips" },
    { href: "/bookings", icon: ClipboardList, th: "การจอง", en: "Bookings" },
    { href: "/account", icon: User, th: "โปรไฟล์", en: "Profile" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-black/5 bg-white pb-[calc(env(safe-area-inset-bottom)+6px)] pt-2 shadow-[0_-6px_20px_rgba(9,37,29,0.06)] lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around px-2">
        {TABS.map(({ href, icon: Icon, th, en }) => {
          const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 text-[10.5px] font-semibold ${
                active ? "text-brand-orange" : "text-brand-text/45"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              {t(th, en)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
