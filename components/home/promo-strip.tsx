"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";

export function PromoStrip({ promotion }: { promotion: { regularPrice: number; promoPrice: number } | null }) {
  const { lang } = useLanguage();
  const t = (th: string, en: string) => (lang === "en" ? en : th);

  if (!promotion) return null;
  return (
    <section className="mx-auto mt-6 w-full max-w-5xl px-4">
      <div className="relative flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-brand-green to-[#124a3a] px-5 py-4 text-white">
        <div className="relative z-10">
          <b className="block text-[15px] font-bold">{t("Zipline Adventure ราคาพิเศษ", "Zipline Adventure Special")}</b>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[12px] text-white/65 line-through">฿{promotion.regularPrice.toLocaleString()}</span>
            <span className="text-xl font-extrabold text-[#FFC531]">฿{promotion.promoPrice.toLocaleString()}</span>
            <span className="text-[11.5px] text-white/85">{t("/ คน", "/ person")}</span>
          </div>
        </div>
        <Link
          href="/booking/hillpark-zipline-adventure"
          className="relative z-10 shrink-0 rounded-xl bg-brand-orange px-4 py-2 text-xs font-bold text-white"
        >
          {t("จองเลย", "Book now")}
        </Link>
        <span className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/[0.06]" />
      </div>
    </section>
  );
}
