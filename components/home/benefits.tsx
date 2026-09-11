"use client";

import { ShieldCheck, MailCheck, Headphones, Users } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

const ITEMS = [
  { icon: ShieldCheck, title_th: "จองง่าย ปลอดภัย", title_en: "Easy & Secure Booking", desc_th: "ชำระเงินผ่าน Stripe", desc_en: "Pay securely via Stripe" },
  { icon: MailCheck, title_th: "ยืนยันการจองทันที", title_en: "Instant Confirmation", desc_th: "รับ e-Ticket ทางอีเมล", desc_en: "e-Ticket sent by email" },
  { icon: Headphones, title_th: "ทีมงานดูแลตลอดทริป", title_en: "Support Throughout Your Trip", desc_th: "พร้อมให้คำแนะนำ", desc_en: "We're here to help" },
  { icon: Users, title_th: "ทริปคุณภาพ", title_en: "Quality Trips", desc_th: "โดยผู้เชี่ยวชาญในพื้นที่", desc_en: "By local experts" },
];

export function Benefits() {
  const { lang } = useLanguage();

  return (
    <section className="container-page mt-14">
      <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white p-6 shadow-card lg:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title_th, title_en, desc_th, desc_en }) => (
          <div key={title_th} className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-teal/10 text-brand-teal">
              <Icon size={22} />
            </span>
            <div>
              <div className="text-sm font-semibold text-brand-text">{lang === "en" ? title_en : title_th}</div>
              <div className="text-xs text-brand-text/60">{lang === "en" ? desc_en : desc_th}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
