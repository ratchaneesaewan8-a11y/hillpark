import { ShieldCheck, MailCheck, Headphones, Users } from "lucide-react";

const ITEMS = [
  { icon: ShieldCheck, title: "จองง่าย ปลอดภัย", desc: "ชำระเงินผ่าน Stripe" },
  { icon: MailCheck, title: "ยืนยันการจองทันที", desc: "รับ e-Ticket ทางอีเมล" },
  { icon: Headphones, title: "ทีมงานดูแลตลอดทริป", desc: "พร้อมให้คำแนะนำ" },
  { icon: Users, title: "ทริปคุณภาพ", desc: "โดยผู้เชี่ยวชาญในพื้นที่" },
];

export function Benefits() {
  return (
    <section className="container-page mt-14">
      <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white p-6 shadow-card lg:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-teal/10 text-brand-teal">
              <Icon size={22} />
            </span>
            <div>
              <div className="text-sm font-semibold text-brand-text">{title}</div>
              <div className="text-xs text-brand-text/60">{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
