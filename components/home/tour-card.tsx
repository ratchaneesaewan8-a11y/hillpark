"use client";

import Link from "next/link";
import { useState } from "react";
import { Star, Heart } from "lucide-react";
import type { Tour } from "@/lib/types";
import { formatTHB, cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

export function TourCard({ tour }: { tour: Tour }) {
  const [liked, setLiked] = useState(false);
  const { lang } = useLanguage();
  const t = (th: string, en: string) => (lang === "en" ? en : th);
  const title = lang === "en" && tour.title_en ? tour.title_en : tour.title_th;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-1">
      {/* Cover */}
      <div className="relative aspect-[16/11] overflow-hidden">
        <Link href={`/tours/${tour.slug}`} className="block h-full w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tour.cover_image}
            alt={title}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        </Link>
        {tour.badge && (
          <span className="absolute left-2 top-2 rounded-full bg-brand-orange px-2.5 py-1 text-[10px] font-bold text-white">
            {tour.badge}
          </span>
        )}
        <button
          onClick={() => setLiked((v) => !v)}
          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-brand-orange"
          aria-label={t("เพิ่มในรายการโปรด", "Add to wishlist")}
        >
          <Heart size={15} className={cn(liked && "fill-brand-orange")} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3">
        <Link href={`/tours/${tour.slug}`}>
          <h3 className="line-clamp-2 min-h-[2.6rem] text-[13px] font-bold leading-snug text-brand-text">
            {title}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-brand-text/55">
          <span className="flex items-center gap-0.5 font-semibold text-brand-text">
            <Star size={12} className="fill-[#FFC531] text-[#FFC531]" />
            {tour.rating.toFixed(1)}
          </span>
          <span>({tour.review_count > 0 ? tour.review_count.toLocaleString() : t("ใหม่", "new")})</span>
          {tour.duration && <span>· {tour.duration}</span>}
        </div>

        <div className="mt-2.5">
          <div className="text-[10px] text-brand-text/45">{t("เริ่มต้น", "From")}</div>
          <div className="text-lg font-bold text-brand-green">{formatTHB(tour.base_price)}</div>
        </div>

        <Link
          href={`/tours/${tour.slug}`}
          className="mt-2.5 block rounded-xl bg-brand-orange py-2.5 text-center text-[13px] font-bold text-white shadow-[0_4px_10px_rgba(255,106,0,0.3)] transition hover:brightness-95"
        >
          {t("จองเลย", "Book Now")}
        </Link>
      </div>
    </div>
  );
}
