"use client";

import { useEffect, useState } from "react";
import { Star, Clock, MapPin } from "lucide-react";
import type { Tour, Package } from "@/lib/types";
import { formatTHB } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { readRefCode, buildPaymentUrl } from "@/lib/partner/ref";

export function TourDetailContent({
  tour,
  gallery,
  packages,
}: {
  tour: Tour;
  gallery: string[];
  packages: Package[];
}) {
  const { lang } = useLanguage();
  const t = (th: string, en: string) => (lang === "en" ? en : th);
  const title = lang === "en" && tour.title_en ? tour.title_en : tour.title_th;
  const description = lang === "en" && tour.description_en ? tour.description_en : tour.description_th;
  const reviewLabel = lang === "en" ? "reviews" : "รีวิว";

  // โค้ดพาร์ทเนอร์ (ถ้าลูกค้าเข้ามาผ่านลิงก์แนะนำ) -> แนบไปกับลิงก์จ่ายเงิน Stripe
  const [refCode, setRefCode] = useState<string | null>(null);
  useEffect(() => {
    setRefCode(readRefCode());
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tour.cover_image}
          alt={title}
          className="aspect-[16/9] w-full rounded-2xl object-cover"
        />
        <h1 className="mt-5 text-3xl font-bold text-brand-text">{title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-brand-text/70">
          <span className="flex items-center gap-1">
            <Star size={16} className="fill-brand-orange text-brand-orange" />
            {tour.rating.toFixed(1)} ({tour.review_count.toLocaleString()} {reviewLabel})
          </span>
          <span className="flex items-center gap-1">
            <Clock size={16} /> {tour.duration}
          </span>
          {tour.location && (
            <span className="flex items-center gap-1">
              <MapPin size={16} /> {tour.location}
            </span>
          )}
        </div>
        <p className="mt-5 leading-relaxed text-brand-text/80">{description}</p>

        {gallery.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-brand-text">
              {t("รูปภาพเพิ่มเติม", "More Photos")}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gallery.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url + i}
                  src={url}
                  alt={`${title} ${i + 1}`}
                  className="aspect-square w-full rounded-xl object-cover"
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 rounded-xl border border-dashed border-black/10 bg-white p-5 text-sm text-brand-text/60">
          {t(
            "ส่วนนี้ยังเป็นโครงเริ่มต้น — ดูขั้นตอนเติม Itinerary / รายการที่รวม-ไม่รวม / รีวิว ได้ใน README (Roadmap ข้อ 3–4)",
            "This section is still a starting scaffold — see the README (Roadmap items 3–4) for how to add Itinerary / Included-Excluded / Reviews"
          )}
        </div>
      </div>

      {/* Booking widget (sticky) */}
      <aside className="lg:col-span-1">
        <div className="sticky top-20 rounded-2xl bg-white p-5 shadow-card">
          <div className="text-sm text-brand-text/50">{t("เริ่มต้น", "From")}</div>
          <div className="text-3xl font-bold text-brand-text">{formatTHB(tour.base_price)}</div>

          {packages.length > 0 ? (
            <div className="mt-4 space-y-3">
              {packages.map((pkg) => {
                const name = lang === "en" && pkg.name_en ? pkg.name_en : pkg.name_th;
                return (
                  <div key={pkg.id} className="rounded-xl border border-black/10 p-3">
                    <div className="text-sm font-semibold text-brand-text">{name}</div>
                    <div className="mt-1 text-xs text-brand-text/60">
                      {formatTHB(pkg.adult_price)} {t("/ คน", "/ person")}
                    </div>
                    {pkg.payment_link ? (
                      <a
                        href={buildPaymentUrl(pkg.payment_link, pkg.id, refCode)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary mt-3 block w-full text-center"
                      >
                        {t("จองเลย", "Book Now")}
                      </a>
                    ) : (
                      <button disabled className="mt-3 w-full cursor-not-allowed rounded-xl bg-black/5 py-2.5 text-sm text-brand-text/40">
                        {t("เร็วๆ นี้", "Coming soon")}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-brand-text/50">
              {t("ยังไม่มีแพ็กเกจให้จองในขณะนี้", "No packages available to book yet")}
            </p>
          )}

          <p className="mt-3 text-center text-xs text-brand-text/50">
            {t("ชำระเงินปลอดภัยผ่าน Stripe", "Secure payment via Stripe")}
          </p>
        </div>
      </aside>
    </div>
  );
}
