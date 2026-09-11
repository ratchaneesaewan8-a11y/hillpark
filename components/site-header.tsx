"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Search, Heart, ShoppingCart, User, Menu, X, Globe } from "lucide-react";

const NAV = [
  { label: "หน้าแรก", href: "/" },
  { label: "ทัวร์ & กิจกรรม", href: "/tours" },
  { label: "เที่ยวกับเรา", href: "/about" },
  { label: "รีวิวจากลูกค้า", href: "/reviews" },
  { label: "บทความ", href: "/blog" },
  { label: "ติดต่อเรา", href: "/contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 shadow-soft backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/logo.jpg"
            alt="HILLPARK ADVENTURE"
            width={52}
            height={52}
            className="rounded-full"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-brand-text/80 transition hover:text-brand-orange"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button className="hidden text-brand-text/70 hover:text-brand-orange sm:block" aria-label="ค้นหา">
            <Search size={20} />
          </button>
          <button className="hidden items-center gap-1 text-sm text-brand-text/70 hover:text-brand-orange sm:flex">
            <Globe size={18} /> TH
          </button>
          <Link href="/wishlist" className="relative text-brand-text/70 hover:text-brand-orange" aria-label="รายการโปรด">
            <Heart size={20} />
            <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-brand-orange text-[10px] font-bold text-white">0</span>
          </Link>
          <Link href="/cart" className="relative text-brand-text/70 hover:text-brand-orange" aria-label="ตะกร้า">
            <ShoppingCart size={20} />
            <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-brand-orange text-[10px] font-bold text-white">0</span>
          </Link>
          <Link href="/login" className="hidden items-center gap-2 rounded-xl bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:brightness-95 sm:flex">
            <User size={16} /> เข้าสู่ระบบ
          </Link>
          <button className="lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="เมนู">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-black/5 bg-white lg:hidden">
          <div className="container-page flex flex-col py-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium text-brand-text/80"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/login" className="btn-primary mt-2 w-full">
              <User size={16} /> เข้าสู่ระบบ
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
