"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/data/tours";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

export function CategoryScroller() {
  const [active, setActive] = useState(CATEGORIES[0]?.id ?? "");
  const { lang } = useLanguage();

  return (
    <section className="container-page mt-8">
      <div className="no-scrollbar flex gap-4 overflow-x-auto rounded-2xl bg-white p-4 shadow-card sm:gap-6 sm:p-6">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className="flex shrink-0 flex-col items-center gap-2"
          >
            <span
              className={cn(
                "grid h-16 w-16 place-items-center overflow-hidden rounded-full ring-2 transition sm:h-[72px] sm:w-[72px]",
                active === c.id ? "ring-brand-orange" : "ring-transparent"
              )}
            >
              {/* ใช้ img ธรรมดาเพื่อความง่ายในการแสดง demo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image} alt={lang === "en" ? c.name_en : c.name_th} className="h-full w-full object-cover" />
            </span>
            <span
              className={cn(
                "max-w-[80px] text-center text-xs font-medium leading-tight",
                active === c.id ? "text-brand-orange" : "text-brand-text/70"
              )}
            >
              {lang === "en" ? c.name_en : c.name_th}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
