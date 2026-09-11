"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Search, Star, Heart, MapPin } from "lucide-react";
import type { Tour } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/language-context";

export function HeroCarousel({ tours }: { tours: Tour[] }) {
  const { lang } = useLanguage();
  const t = (th: string, en: string) => (lang === "en" ? en : th);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function onScroll() {
    const el = trackRef.current;
    if (!el || tours.length === 0) return;
    const idx = Math.round((el.scrollLeft / el.scrollWidth) * tours.length);
    setActive(Math.min(idx, tours.length - 1));
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pt-4">
      {/* ช่องค้นหา (เฉพาะมือถือ — จอใหญ่ใช้ช่องค้นหาบนแบนเนอร์แทน) */}
      <Link
        href="/tours"
        className="flex items-center gap-2.5 rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-card lg:hidden"
      >
        <Search size={18} className="text-brand-text/40" />
        <span className="flex-1 text-sm text-brand-text/50">
          {t("ค้นหาทัวร์ / กิจกรรมในกระบี่...", "Search tours / activities in Krabi...")}
        </span>
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-orange text-white">
          <Search size={15} />
        </span>
      </Link>

      {/* หัวข้อ */}
      <div className="mt-5 flex items-center justify-between lg:mt-2">
        <h2 className="text-lg font-bold text-brand-green">{t("โปรแกรมแนะนำ", "Featured Trips")}</h2>
        <Link href="/tours" className="text-sm font-semibold text-brand-orange">
          {t("ดูทั้งหมด", "See All")} ›
        </Link>
      </div>

      {/* สไลด์ */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="no-scrollbar mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1"
      >
        {tours.map((tour) => {
          const title = lang === "en" && tour.title_en ? tour.title_en : tour.title_th;
          return (
            <Link
              key={tour.id}
              href={`/tours/${tour.slug}`}
              className="relative h-52 w-[86%] shrink-0 snap-center overflow-hidden rounded-3xl shadow-card sm:w-[70%] lg:w-[48%]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tour.cover_image} alt={title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              {tour.badge && (
                <span className="absolute left-3 top-3 rounded-full bg-brand-orange px-3 py-1 text-xs font-bold text-white">
                  {tour.badge}
                </span>
              )}
              <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-brand-orange">
                <Heart size={17} />
              </span>
              <div className="absolute inset-x-4 bottom-4 text-white">
                <h3 className="mb-1.5 text-base font-bold leading-snug drop-shadow">{title}</h3>
                <div className="flex items-center gap-3 text-[12.5px] font-medium">
                  <span className="flex items-center gap-1 text-[#FFC531]">
                    <Star size={13} className="fill-current" /> {tour.rating.toFixed(1)}
                  </span>
                  {tour.duration && <span>{tour.duration}</span>}
                  {tour.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {tour.location}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* จุดบอกหน้า */}
      <div className="flex justify-center gap-1.5 pt-3">
        {tours.map((_, i) => (
          <i
            key={i}
            className={`h-[7px] rounded-full transition-all ${
              i === active ? "w-5 bg-brand-orange" : "w-[7px] bg-black/15"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
