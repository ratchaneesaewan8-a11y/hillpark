"use client";

import Link from "next/link";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function SiteFooter() {
  const { lang } = useLanguage();
  const t = (th: string, en: string) => (lang === "en" ? en : th);

  return (
    <footer className="mt-16 bg-brand-green text-white/80">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-xl font-bold text-white">HILLPARK ADVENTURE</div>
          <p className="mt-3 text-sm leading-relaxed">
            {t(
              "ทัวร์ กิจกรรม และประสบการณ์สุดพิเศษ จองง่าย เที่ยวได้จริง ดูแลตลอดทริปโดยผู้เชี่ยวชาญในพื้นที่",
              "Tours, activities, and unforgettable experiences. Easy booking, real adventures, guided by local experts."
            )}
          </p>
        </div>

        <div>
          <div className="mb-3 font-semibold text-white">{t("กิจกรรม", "Activities")}</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/tours?cat=island-tours" className="hover:text-brand-orange">{t("ทัวร์เกาะ", "Island Tours")}</Link></li>
            <li><Link href="/tours?cat=diving" className="hover:text-brand-orange">{t("ดำน้ำ", "Snorkeling")}</Link></li>
            <li><Link href="/tours?cat=kayaking" className="hover:text-brand-orange">{t("พายเรือคายัค", "Kayaking")}</Link></li>
            <li><Link href="/tours?cat=atv" className="hover:text-brand-orange">ATV</Link></li>
            <li><Link href="/tours?cat=zipline" className="hover:text-brand-orange">Zipline</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 font-semibold text-white">{t("ช่วยเหลือ", "Help")}</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-brand-orange">{t("เกี่ยวกับเรา", "About Us")}</Link></li>
            <li><Link href="/contact" className="hover:text-brand-orange">{t("ติดต่อเรา", "Contact Us")}</Link></li>
            <li><Link href="/terms" className="hover:text-brand-orange">{t("เงื่อนไขการใช้บริการ", "Terms of Service")}</Link></li>
            <li><Link href="/privacy" className="hover:text-brand-orange">{t("นโยบายความเป็นส่วนตัว", "Privacy Policy")}</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 font-semibold text-white">{t("ติดต่อ", "Contact")}</div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Phone size={16} /> 000-000-0000</li>
            <li className="flex items-center gap-2"><Mail size={16} /> hello@hillpark.example</li>
            <li className="flex items-center gap-2"><MapPin size={16} /> {t("กระบี่, ประเทศไทย", "Krabi, Thailand")}</li>
          </ul>
          <div className="mt-4 flex gap-3">
            <Link href="#" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-brand-orange"><Facebook size={16} /></Link>
            <Link href="#" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-brand-orange"><Instagram size={16} /></Link>
          </div>
        </div>
      </div>
      <div className="container-page flex flex-col items-center justify-between gap-2 border-t border-white/10 py-4 text-xs text-white/50 sm:flex-row">
        <span>© {new Date().getFullYear()} HILLPARK ADVENTURE. All rights reserved.</span>
        <Link href="/admin/login" className="hover:text-brand-orange">
          {t("สำหรับผู้ดูแลระบบ (Admin)", "For Administrators")}
        </Link>
      </div>
    </footer>
  );
}
