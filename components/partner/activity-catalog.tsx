"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ShareBox } from "./share-box";
import { PackagePriceForm } from "./package-price-form";

export type PartnerActivity = { id: string; tourTitle: string; category: string; packageName: string; link: string; code: string; pricing?: { min: number; max: number; current: number } };

export function ActivityCatalog({ activities, savePrice }: { activities: PartnerActivity[]; savePrice: (formData: FormData) => void | Promise<void> }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ทั้งหมด");
  const categories = ["ทั้งหมด", ...Array.from(new Set(activities.map((item) => item.category).filter(Boolean)))];
  const filtered = useMemo(() => activities.filter((item) => (category === "ทั้งหมด" || item.category === category) && `${item.tourTitle} ${item.packageName}`.toLowerCase().includes(query.toLowerCase())), [activities, category, query]);
  const grouped = filtered.reduce<Record<string, PartnerActivity[]>>((all, item) => { const key = `${item.tourTitle}__${item.category}`; (all[key] ??= []).push(item); return all; }, {});
  return <div className="space-y-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><label className="relative block max-w-md flex-1"><Search size={17} className="absolute left-3 top-3 text-brand-text/40"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหากิจกรรมหรือแพ็กเกจ" className="input pl-9"/></label><div className="flex flex-wrap gap-2">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-full px-3 py-1.5 text-sm font-medium ${category === item ? "bg-brand-orange text-white" : "bg-brand-bg text-brand-text/65"}`}>{item}</button>)}</div></div>{Object.entries(grouped).map(([key, items]) => <section key={key} className="rounded-2xl border border-black/5 bg-white p-5"><div className="mb-4"><div className="text-xs font-semibold text-brand-orange">{items[0].category}</div><h3 className="font-bold text-brand-text">{items[0].tourTitle}</h3></div><div className="space-y-5">{items.map((item) => <div key={item.id} className="rounded-2xl border border-black/5 bg-brand-bg/50 p-4"><div className="mb-4 font-semibold text-brand-text">{item.packageName}</div>{item.pricing && <PackagePriceForm packageId={item.id} packageName={item.packageName} minPrice={item.pricing.min} maxPrice={item.pricing.max} defaultPrice={item.pricing.current} action={savePrice}/>}<div className={item.pricing ? "mt-5 border-t border-black/5 pt-5" : ""}><div className="mb-3 text-sm font-medium text-brand-text">ลิงก์และ QR Code ของแพ็กเกจนี้</div><ShareBox link={item.link} code={item.code}/></div></div>)}</div></section>)}{!filtered.length && <p className="rounded-2xl bg-brand-bg p-8 text-center text-sm text-brand-text/55">ไม่พบกิจกรรมที่ค้นหา</p>}</div>;
}
