"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/data/tours";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

export function CategoryScroller() {
  const [active, setActive] = useState(CATEGORIES[0]?.id ?? "");
  const { lang } = useLanguage();

  return (
    <section className="mx-auto mt-5 w-full max-w-5xl px-4">
      <div className="no-scrollbar flex gap-5 overflow-x-auto sm:justify-center sm:gap-8">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className="flex shrink-0 flex-col items-center gap-2"
          >
            <span
              className={cn(
                "grid h-[58px] w-[58px] place-items-center overflow-hidden rounded-full ring-2 shadow-card transition sm:h-[68px] sm:w-[68px]",
                active === c.id ? "ring-brand-orange" : "ring-transparent"
              )}
            >
              {/* ใช้ img ธรรมดาเพื่อความง่ายในการแสดง demo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image} alt={lang === "en" ? c.name_en : c.name_th} className="h-full w-full object-cover" />
            </span>
            <span
              className={cn(
                "max-w-[70px] text-center text-[11px] font-semibold leading-tight",
                active === c.id ? "text-brand-orange" : "text-brand-text/60"
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
