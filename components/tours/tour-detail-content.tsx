"use client";

import { useEffect, useState } from "react";
import { Star, Clock, MapPin, ShieldCheck, Route, UsersRound, CheckCircle2 } from "lucide-react";
import Link from "next/link";
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
  const isAtvActivity = tour.slug.toLowerCase().includes("atv");

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
        {description && <div className="mt-5 whitespace-pre-wrap leading-relaxed text-brand-text/80">{description}</div>}

        {isAtvActivity && <AtvPackageSelector packages={packages} tourSlug={tour.slug} refCode={refCode} t={t} lang={lang} />}
        {isAtvActivity ? <AtvActivityTemplate t={t} /> : <TourInformationTemplate t={t} tour={tour} />}

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

      </div>

      {/* Booking widget (sticky) */}
      <aside className="lg:col-span-1">
        <div className="sticky top-20 rounded-2xl bg-white p-5 shadow-card">
          <div className="text-sm text-brand-text/50">{t("เริ่มต้น", "From")}</div>
          <div className="text-3xl font-bold text-brand-text">{formatTHB(tour.base_price)}</div>

          {isAtvActivity && <div className="mt-4 rounded-xl bg-brand-green px-3 py-3 text-sm font-semibold text-white"><Route size={16} className="mr-1.5 inline text-brand-orange" />{t("เลือกเวลา ราคา และจองได้จากกล่องด้านซ้าย", "Choose your duration, price and book from the panel on the left")}</div>}

          {!isAtvActivity && packages.length > 0 ? (
            <div className="mt-4 space-y-3">
              {packages.map((pkg) => {
                const name = lang === "en" && pkg.name_en ? pkg.name_en : pkg.name_th;
                return (
                  <div key={pkg.id} className={`rounded-xl border p-3 ${isAtvActivity ? "border-brand-orange/25 bg-orange-50/40" : "border-black/10"}`}>
                    <div className="text-sm font-semibold text-brand-text">{name}</div>
                    {pkg.promo_active && pkg.regular_price && pkg.promo_price ? (
                      <div className="mt-2 rounded-lg bg-orange-50 px-3 py-2">
                        <div className="text-xs text-brand-text/50 line-through">
                          {t("ราคาปกติ ", "Regular price ")}{formatTHB(pkg.regular_price)} {t("/ คน", "/ person")}
                        </div>
                        <div className="mt-0.5 text-base font-bold text-brand-orange">
                          {t("โปรโมชั่น ", "Promotion ")}{formatTHB(pkg.promo_price ?? pkg.adult_price)} {t("/ คน", "/ person")}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-brand-text/60">
                        {formatTHB(pkg.adult_price)} {t("/ คน", "/ person")}
                      </div>
                    )}
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
                      <Link href={`/booking/${tour.slug}?package=${pkg.id}`} className="btn-primary mt-3 block w-full text-center">{t("จองเลย", "Book Now")}</Link>
                    )}
                  </div>
                );
              })}
            </div>
          ) : !isAtvActivity ? (
            <p className="mt-4 text-sm text-brand-text/50">
              {t("ยังไม่มีแพ็กเกจให้จองในขณะนี้", "No packages available to book yet")}
            </p>
          ) : null}

          <p className="mt-3 text-center text-xs text-brand-text/50">
            {t("ชำระเงินปลอดภัยผ่าน Stripe", "Secure payment via Stripe")}
          </p>
        </div>
      </aside>
    </div>
  );
}

function AtvPackageSelector({ packages, tourSlug, refCode, t, lang }: { packages: Package[]; tourSlug: string; refCode: string | null; t: (th: string, en: string) => string; lang: string }) {
  const [selectedId, setSelectedId] = useState(packages[0]?.id ?? "");
  const selected = packages.find((pkg) => pkg.id === selectedId) ?? packages[0];
  if (!selected) return <p className="mt-8 rounded-2xl bg-brand-bg p-5 text-sm text-brand-text/55">{t("ยังไม่มีตัวเลือกกิจกรรมในขณะนี้", "No activity options are available yet")}</p>;
  const packageName = lang === "en" && selected.name_en ? selected.name_en : selected.name_th;
  const bookingUrl = `/booking/${tourSlug}?package=${selected.id}`;

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-card">
      <div className="border-b border-black/5 px-5 py-4 sm:px-6">
        <h2 className="text-xl font-bold text-brand-text">{t("เลือกแพ็กเกจกิจกรรม", "Choose an activity package")}</h2>
        <p className="mt-1 text-sm text-brand-text/55">{t("เลือกช่วงเวลาที่ต้องการ แล้วราคาจะแสดงด้านล่าง", "Select a duration to see the price below")}</p>
      </div>
      <div className="px-5 py-5 sm:px-6">
        <div className="text-sm font-medium text-brand-text/70">{t("ระยะเวลาขับ ATV", "ATV ride duration")}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {packages.map((pkg) => {
            const name = lang === "en" && pkg.name_en ? pkg.name_en : pkg.name_th;
            const active = pkg.id === selected.id;
            return <button key={pkg.id} type="button" onClick={() => setSelectedId(pkg.id)} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${active ? "border-brand-orange bg-orange-50 text-brand-orange shadow-sm" : "border-black/15 bg-white text-brand-text hover:border-brand-orange/60"}`}>{name}</button>;
          })}
        </div>
      </div>
      <div className="flex flex-col gap-4 border-t border-black/5 bg-brand-bg px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="text-sm text-brand-text/55">{t("แพ็กเกจที่เลือก", "Selected package")}: <span className="font-semibold text-brand-text">{packageName}</span></div>
          <div className="mt-1 text-3xl font-bold text-brand-text">{formatTHB(selected.adult_price)} <span className="text-sm font-medium text-brand-text/55">{t("/ คน", "/ person")}</span></div>
        </div>
        {selected.payment_link ? (
          <a href={buildPaymentUrl(selected.payment_link, selected.id, refCode)} target="_blank" rel="noopener noreferrer" className="btn-primary min-w-40 justify-center">{t("จองตอนนี้", "Book now")}</a>
        ) : (
          <Link href={bookingUrl} className="btn-primary min-w-40 justify-center">{t("จองตอนนี้", "Book now")}</Link>
        )}
      </div>
    </section>
  );
}

function AtvActivityTemplate({ t }: { t: (th: string, en: string) => string }) {
  return (
    <section className="mt-8 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-brand-text">{t("ประสบการณ์ขับ ATV", "Your ATV experience")}</h2>
        <p className="mt-1 text-sm text-brand-text/60">{t("เลือกช่วงเวลาที่เหมาะกับคุณ แล้วออกไปลุยเส้นทางธรรมชาติพร้อมทีมดูแล", "Pick the duration that suits you and ride through nature with our team.")}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <InfoCard icon={<Route size={20} />} title={t("เส้นทาง", "Route")} text={t("ทางธรรมชาติ ทางลูกรัง และจุดชมวิว", "Nature trails, dirt tracks and viewpoints")} />
        <InfoCard icon={<ShieldCheck size={20} />} title={t("ความปลอดภัย", "Safety")} text={t("หมวกกันน็อกและคำแนะนำก่อนเริ่มทุกครั้ง", "Helmet and safety briefing before every ride")} />
        <InfoCard icon={<UsersRound size={20} />} title={t("เหมาะสำหรับ", "Suitable for")} text={t("มือใหม่ กลุ่มเพื่อน และครอบครัว", "Beginners, friends and families")} />
      </div>
      <div className="rounded-2xl border border-brand-teal/15 bg-teal-50/60 p-5">
        <h3 className="font-semibold text-brand-text">{t("สิ่งที่รวมในกิจกรรม", "What is included")}</h3>
        <div className="mt-3 grid gap-2 text-sm text-brand-text/75 sm:grid-cols-2">
          <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-teal" />{t("รถ ATV ตามระยะเวลาที่เลือก", "ATV ride for your selected duration")}</span>
          <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-teal" />{t("อุปกรณ์เซฟตี้", "Safety equipment")}</span>
          <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-teal" />{t("เจ้าหน้าที่แนะนำก่อนออกขับ", "Pre-ride staff briefing")}</span>
          <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-brand-teal" />{t("เส้นทางกิจกรรมที่กำหนด", "Designated activity route")}</span>
        </div>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950/80">
        <strong>{t("ก่อนจอง:", "Before booking:")}</strong> {t("ผู้ขับควรทำตามคำแนะนำของเจ้าหน้าที่และข้อกำหนดหน้างาน หากต้องการบริการรับส่ง โปรดตรวจสอบกับทีมงานก่อนเดินทาง", "Riders must follow staff guidance and on-site requirements. Please confirm transfers with the team before travelling.")}
      </div>
    </section>
  );
}

function TourInformationTemplate({ t, tour }: { t: (th: string, en: string) => string; tour: Tour }) {
  return (
    <section className="mt-8 rounded-2xl bg-brand-bg p-5 text-sm text-brand-text/75">
      <h2 className="font-semibold text-brand-text">{t("ข้อมูลกิจกรรม", "Activity information")}</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {tour.duration && <span><strong>{t("ระยะเวลา:", "Duration:")}</strong> {tour.duration}</span>}
        {tour.meeting_point && <span><strong>{t("จุดนัดพบ:", "Meeting point:")}</strong> {tour.meeting_point}</span>}
        {tour.pickup_info && <span className="sm:col-span-2"><strong>{t("การรับส่ง:", "Pickup:")}</strong> {tour.pickup_info}</span>}
      </div>
    </section>
  );
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-soft"><div className="text-brand-orange">{icon}</div><div className="mt-2 font-semibold text-brand-text">{title}</div><p className="mt-1 text-xs leading-relaxed text-brand-text/60">{text}</p></div>;
}
