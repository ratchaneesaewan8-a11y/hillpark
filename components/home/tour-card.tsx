"use client";

import Link from "next/link";
import { useState } from "react";
import { Star, Clock, MapPin, Heart } from "lucide-react";
import type { Tour } from "@/lib/types";
import { formatTHB, cn } from "@/lib/utils";

export function TourCard({ tour }: { tour: Tour }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-1">
      {/* Cover */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tour.cover_image}
          alt={tour.title_th}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {tour.badge && (
          <span className="absolute left-3 top-3 rounded-md bg-brand-orange px-2.5 py-1 text-xs font-semibold text-white">
            {tour.badge}
          </span>
        )}
        <button
          onClick={() => setLiked((v) => !v)}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-brand-text/70 hover:text-brand-orange"
          aria-label="เพิ่มในรายการโปรด"
        >
          <Heart size={18} className={cn(liked && "fill-brand-orange text-brand-orange")} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="line-clamp-2 min-h-[2.75rem] font-semibold leading-snug text-brand-text">
          {tour.title_th}
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-sm">
          <Star size={15} className="fill-brand-orange text-brand-orange" />
          <span className="font-semibold text-brand-text">{tour.rating.toFixed(1)}</span>
          <span className="text-brand-text/50">({tour.review_count.toLocaleString()} รีวิว)</span>
        </div>

        <div className="mt-2 space-y-1 text-sm text-brand-text/60">
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>
              {tour.duration}
              {tour.start_time && ` (${tour.start_time} - ${tour.end_time})`}
            </span>
          </div>
          {tour.pickup_info && (
            <div className="flex items-center gap-1.5">
              <MapPin size={14} /> {tour.pickup_info}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="text-xs text-brand-text/50">เริ่มต้น</div>
            <div className="text-xl font-bold text-brand-text">{formatTHB(tour.base_price)}</div>
          </div>
          <Link href={`/tours/${tour.slug}`} className="btn-primary px-4 py-2 text-sm">
            จองเลย
          </Link>
        </div>
      </div>
    </div>
  );
}
