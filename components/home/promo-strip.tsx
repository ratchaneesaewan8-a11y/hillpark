"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";

export function PromoStrip() {
  const { lang } = useLanguage();
  const t = (th: string, en: string) => (lang === "en" ? en : th);

  return (
    <section className="mx-auto mt-6 w-full max-w-5xl px-4">
      <div className="relative flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-brand-green to-[#124a3a] px-5 py-4 text-white">
        <div>
          <b className="block text-[15px] font-bold">{t("รับส่งฟรีจากโรงแรม", "Free hotel pickup")}</b>
          <span className="text-[11.5px] opacity-85">
            {t("สำหรับทัวร์ที่ร่วมรายการ", "On participating tours")}
          </span>
        </div>
        <Link
          href="/tours"
          className="relative z-10 shrink-0 rounded-xl bg-brand-orange px-4 py-2 text-xs font-bold text-white"
        >
          {t("ดูเงื่อนไข", "Details")}
        </Link>
        <span className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/[0.06]" />
      </div>
    </section>
  );
}
