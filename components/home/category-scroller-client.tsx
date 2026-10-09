"use client";

import { useState } from "react";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

export function CategoryScrollerClient({ categories }: { categories: Category[] }) {
  const [active, setActive] = useState(categories[0]?.id ?? "");
  const { lang } = useLanguage();

  return <section className="mx-auto mt-5 w-full max-w-5xl px-4"><div className="no-scrollbar flex gap-5 overflow-x-auto sm:justify-center sm:gap-8">{categories.map((category) => <button key={category.id} onClick={() => setActive(category.id)} className="flex shrink-0 flex-col items-center gap-2"><span className={cn("grid h-[58px] w-[58px] place-items-center overflow-hidden rounded-full ring-2 shadow-card transition sm:h-[68px] sm:w-[68px]", active === category.id ? "ring-brand-orange" : "ring-transparent")}>{category.image && <img src={category.image} alt={lang === "en" ? category.name_en : category.name_th} className="h-full w-full object-cover" />}</span><span className={cn("max-w-[70px] text-center text-[11px] font-semibold leading-tight", active === category.id ? "text-brand-orange" : "text-brand-text/60")}>{lang === "en" ? category.name_en : category.name_th}</span></button>)}</div></section>;
}
