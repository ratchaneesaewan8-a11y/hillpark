import Link from "next/link";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-brand-green text-white/80">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-xl font-bold text-white">HILLPARK ADVENTURE</div>
          <p className="mt-3 text-sm leading-relaxed">
            ทัวร์ กิจกรรม และประสบการณ์สุดพิเศษ จองง่าย เที่ยวได้จริง
            ดูแลตลอดทริปโดยผู้เชี่ยวชาญในพื้นที่
          </p>
        </div>

        <div>
          <div className="mb-3 font-semibold text-white">กิจกรรม</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/tours?cat=island-tours" className="hover:text-brand-orange">ทัวร์เกาะ</Link></li>
            <li><Link href="/tours?cat=diving" className="hover:text-brand-orange">ดำน้ำ</Link></li>
            <li><Link href="/tours?cat=kayaking" className="hover:text-brand-orange">พายเรือคายัค</Link></li>
            <li><Link href="/tours?cat=atv" className="hover:text-brand-orange">ATV</Link></li>
            <li><Link href="/tours?cat=zipline" className="hover:text-brand-orange">Zipline</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 font-semibold text-white">ช่วยเหลือ</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-brand-orange">เกี่ยวกับเรา</Link></li>
            <li><Link href="/contact" className="hover:text-brand-orange">ติดต่อเรา</Link></li>
            <li><Link href="/terms" className="hover:text-brand-orange">เงื่อนไขการใช้บริการ</Link></li>
            <li><Link href="/privacy" className="hover:text-brand-orange">นโยบายความเป็นส่วนตัว</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 font-semibold text-white">ติดต่อ</div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Phone size={16} /> 000-000-0000</li>
            <li className="flex items-center gap-2"><Mail size={16} /> hello@hillpark.example</li>
            <li className="flex items-center gap-2"><MapPin size={16} /> กระบี่, ประเทศไทย</li>
          </ul>
          <div className="mt-4 flex gap-3">
            <Link href="#" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-brand-orange"><Facebook size={16} /></Link>
            <Link href="#" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-brand-orange"><Instagram size={16} /></Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} HILLPARK ADVENTURE. All rights reserved.
      </div>
    </footer>
  );
}
