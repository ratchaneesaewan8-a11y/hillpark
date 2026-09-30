"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, CreditCard, ShieldCheck } from "lucide-react";
import type { Package, Tour } from "@/lib/types";
import { formatTHB } from "@/lib/utils";

export function BookingForm({ tour, packages, partnerBooking }: { tour: Tour; packages: Package[]; partnerBooking?: { packageId: string; unitPrice: number } }) {
  const [packageId, setPackageId] = useState(partnerBooking?.packageId ?? packages[0].id);
  // เก็บเป็นข้อความเพื่อให้ผู้ใช้ลบ "1" เดิมแล้วพิมพ์จำนวนใหม่ได้
  const [adults, setAdults] = useState("1"); const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedPackage = params.get("package");
    if (!partnerBooking && selectedPackage && packages.some((pkg) => pkg.id === selectedPackage)) setPackageId(selectedPackage);
  }, []);
  const selected = packages.find(p => p.id === packageId) ?? packages[0];
  const hasAffiliatePricing = partnerBooking?.packageId === selected.id;
  const unitPrice = hasAffiliatePricing ? partnerBooking!.unitPrice : selected.adult_price;
  const adultCount = Math.max(0, Number(adults) || 0);
  const total = Number.isFinite(unitPrice) ? unitPrice * adultCount : 0;
  const minDate = new Date().toISOString().slice(0, 10);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    if (adultCount < 1) { setError("กรุณาระบุจำนวนผู้ใหญ่อย่างน้อย 1 คน"); return; }
    setLoading(true);
    const contactForm = new FormData(event.currentTarget as HTMLFormElement);
    const payload: Record<string, unknown> = { packageId: selected.id, tourId: tour.id, date, startTime: tour.start_time ?? "09:00", adults: adultCount, children: 0, infants: 0, contact: { first_name: contactForm.get("name"), email: contactForm.get("email"), phone: contactForm.get("phone") } };
    const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json(); setLoading(false);
    if (!response.ok || !data.url) { setError(data.error ?? "ไม่สามารถสร้างรายการชำระเงินได้"); return; }
    window.location.assign(data.url);
  }
  return <div className="mx-auto max-w-5xl"><Link href={`/tours/${tour.slug}`} className="inline-flex items-center gap-1 text-sm text-brand-text/60 hover:text-brand-teal"><ChevronLeft size={17}/>กลับหน้ารายละเอียด</Link><div className="mt-5 grid gap-6 lg:grid-cols-[1fr_.8fr]"><form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-card sm:p-8"><p className="text-sm font-semibold text-brand-teal">SECURE BOOKING</p><h1 className="mt-1 text-2xl font-bold">จอง {tour.title_th}</h1><div className="mt-7 space-y-5">{hasAffiliatePricing ? <div><span className="label">แพ็กเกจที่เลือก</span><div className="input bg-brand-bg font-semibold">{selected.name_th}</div></div> : <label><span className="label">เลือกแพ็กเกจ</span><select value={packageId} onChange={e => setPackageId(e.target.value)} className="input">{packages.map(p => <option key={p.id} value={p.id}>{p.name_th} — {formatTHB(p.adult_price)}/คน</option>)}</select></label>}<div className="grid gap-4 sm:grid-cols-2"><label><span className="label">วันใช้บริการ</span><input required min={minDate} value={date} onChange={e => setDate(e.target.value)} type="date" className="input"/></label><label><span className="label">จำนวนผู้ใหญ่</span><input required min="1" value={adults} onChange={e => setAdults(e.target.value)} type="number" inputMode="numeric" className="input"/></label></div>{hasAffiliatePricing && <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4"><p className="text-sm font-semibold text-teal-900">ราคาพิเศษสำหรับแพ็กเกจนี้</p><div className="mt-2 text-2xl font-bold text-teal-950">{formatTHB(unitPrice)} <span className="text-sm font-medium">/ คน</span></div><p className="mt-1 text-xs text-teal-900/65">ราคานี้ถูกกำหนดโดยระบบและไม่สามารถแก้ไขได้</p></div>}<div className="border-t pt-5"><p className="mb-3 text-sm font-semibold">ข้อมูลผู้จอง</p><div className="grid gap-4 sm:grid-cols-2"><label><span className="label">ชื่อผู้จอง</span><input required name="name" className="input"/></label><label><span className="label">เบอร์โทรศัพท์</span><input required name="phone" type="tel" className="input"/></label><label className="sm:col-span-2"><span className="label">อีเมล</span><input required name="email" type="email" className="input"/></label></div></div>{error && <p className="text-sm text-red-600">{error}</p>}<button disabled={loading || !date || adultCount < 1} className="btn-primary w-full disabled:opacity-60"><CreditCard size={18}/>{loading ? "กำลังสร้างหน้าชำระเงิน..." : `ชำระ ${formatTHB(total)} ผ่าน Stripe`}</button></div></form><aside><div className="sticky top-20 rounded-3xl bg-brand-green p-6 text-white shadow-card"><p className="text-sm text-white/65">สรุปการจอง</p><h2 className="mt-2 text-xl font-bold">{selected.name_th}</h2><div className="mt-6 space-y-3 border-y border-white/15 py-4 text-sm"><div className="flex justify-between"><span>ราคา/คน</span><span>{formatTHB(unitPrice)}</span></div><div className="flex justify-between"><span>ผู้ใหญ่</span><span>{adultCount} คน</span></div></div><div className="mt-5 flex items-end justify-between"><span className="text-sm">ยอดชำระ</span><strong className="text-3xl">{formatTHB(total)}</strong></div><div className="mt-6 flex gap-2 rounded-xl bg-white/10 p-3 text-xs text-white/75"><ShieldCheck className="shrink-0 text-teal-200" size={18}/>ชำระเงินอย่างปลอดภัยผ่าน Stripe ราคาจะถูกตรวจสอบอีกครั้งโดยระบบก่อนสร้างรายการชำระเงิน</div></div></aside></div></div>;
}
