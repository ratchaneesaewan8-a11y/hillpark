"use client";

import { MapPin, Calendar, Users, Search } from "lucide-react";

export function HeroSearch() {
  return (
    <section className="relative">
      {/* แบนเนอร์แสดงเต็มภาพ ไม่ครอป — ลดขนาดลงเหลือ 50% (กว้าง-สูงลดตามสัดส่วนเท่ากัน ไม่ตัดภาพ) */}
      <div className="flex w-full justify-center bg-brand-green">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-banner.jpg"
          alt="HILLPARK ADVENTURE — Good Trips, Great Memories"
          className="block h-auto w-1/2"
          fetchPriority="high"
        />
      </div>

      {/* แถบค้นหา เหลื่อมขึ้นมาทับขอบล่างของแบนเนอร์ */}
      <div className="container-page relative z-10 -mt-8 sm:-mt-12">
        <div className="max-w-4xl rounded-2xl bg-white p-3 shadow-card">
          <form className="flex flex-col gap-3 md:flex-row md:items-center">
            <Field icon={<MapPin size={18} />} placeholder="เลือกจุดหมาย / พื้นที่" />
            <div className="hidden h-8 w-px bg-black/10 md:block" />
            <Field icon={<Calendar size={18} />} placeholder="เลือกวันที่" />
            <div className="hidden h-8 w-px bg-black/10 md:block" />
            <Field icon={<Users size={18} />} placeholder="จำนวนผู้เดินทาง" />
            <button type="submit" className="btn-primary shrink-0 md:w-auto">
              <Search size={18} /> ค้นหาทัวร์
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({ icon, placeholder }: { icon: React.ReactNode; placeholder: string }) {
  return (
    <label className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5 text-brand-text/70 ring-1 ring-black/5 focus-within:ring-brand-orange md:ring-0">
      <span className="text-brand-teal">{icon}</span>
      <input
        className="w-full bg-transparent text-sm outline-none placeholder:text-brand-text/50"
        placeholder={placeholder}
      />
    </label>
  );
}
