"use client";

import { Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

// Hero banner สำหรับจอใหญ่ (desktop) — ภาพเต็มความกว้าง + หัวข้อ + ช่องค้นหาวางทับบนภาพ
// ซ่อนบนมือถือ (มือถือใช้ hero carousel แบบแอปแทน)
export function HeroBanner() {
  const { lang } = useLanguage();
  const t = (th: string, en: string) => (lang === "en" ? en : th);

  return (
    <section className="relative hidden w-full overflow-hidden lg:block">
      <div className="relative h-[440px] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-banner.jpg"
          alt="HILLPARK ADVENTURE"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        {/* ไล่เฉดมืดฝั่งซ้าย ให้ตัวหนังสืออ่านง่าย */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />

        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-8">
          <h1 className="max-w-2xl text-5xl font-extrabold leading-tight text-white drop-shadow">
            {t("ออกเดินทางสู่การผจญภัย", "Your world of adventure")}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/90 drop-shadow">
            {t(
              "ทัวร์ กิจกรรม และประสบการณ์สุดพิเศษในกระบี่ — จองง่าย ราคาคุ้ม ไปกับ HILLPARK",
              "Tours, activities and unforgettable experiences in Krabi — easy booking with HILLPARK",
            )}
          </p>

          {/* ช่องค้นหา วางทับบนภาพ */}
          <form action="/tours" className="mt-8 flex max-w-2xl items-center gap-2 rounded-2xl bg-white p-2 shadow-card">
            <span className="pl-3 text-brand-text/40">
              <Search size={20} />
            </span>
            <input
              name="q"
              placeholder={t("กระบี่ · ธรรมชาติและการผจญภัย", "Krabi · nature & adventure")}
              className="h-11 flex-1 bg-transparent px-1 text-[15px] text-brand-text outline-none placeholder:text-brand-text/45"
            />
            <button
              type="submit"
              className="h-11 rounded-xl bg-brand-orange px-8 text-[15px] font-bold text-white transition hover:brightness-95"
            >
              {t("ค้นหา", "Search")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
