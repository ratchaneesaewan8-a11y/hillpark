import { notFound } from "next/navigation";
import { Star, Clock, MapPin } from "lucide-react";
import { getTourBySlug } from "@/lib/data/live-tours";
import { formatTHB } from "@/lib/utils";

// หน้า Tour Detail (เวอร์ชันเริ่มต้น)
// TODO (ดู README §Roadmap): Itinerary, Included/Excluded, Reviews,
// Booking Widget (sticky), Package selection, เชื่อม Booking Flow
export default async function TourDetailPage({ params }: { params: { slug: string } }) {
  const result = await getTourBySlug(params.slug);
  if (!result) return notFound();
  const { tour, gallery } = result;

  return (
    <div className="container-page py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tour.cover_image}
            alt={tour.title_th}
            className="aspect-[16/9] w-full rounded-2xl object-cover"
          />
          <h1 className="mt-5 text-3xl font-bold text-brand-text">{tour.title_th}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-brand-text/70">
            <span className="flex items-center gap-1">
              <Star size={16} className="fill-brand-orange text-brand-orange" />
              {tour.rating.toFixed(1)} ({tour.review_count.toLocaleString()} รีวิว)
            </span>
            <span className="flex items-center gap-1">
              <Clock size={16} /> {tour.duration}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={16} /> {tour.location}
            </span>
          </div>
          <p className="mt-5 leading-relaxed text-brand-text/80">{tour.description_th}</p>

          {gallery.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold text-brand-text">รูปภาพเพิ่มเติม</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url + i}
                    src={url}
                    alt={`${tour.title_th} ${i + 1}`}
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 rounded-xl border border-dashed border-black/10 bg-white p-5 text-sm text-brand-text/60">
            ส่วนนี้ยังเป็นโครงเริ่มต้น — ดูขั้นตอนเติม Itinerary / รายการที่รวม-ไม่รวม /
            รีวิว ได้ใน README (Roadmap ข้อ 3–4)
          </div>
        </div>

        {/* Booking widget (sticky) */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 rounded-2xl bg-white p-5 shadow-card">
            <div className="text-sm text-brand-text/50">เริ่มต้น</div>
            <div className="text-3xl font-bold text-brand-text">{formatTHB(tour.base_price)}</div>
            <button className="btn-primary mt-4 w-full">เลือกแพ็กเกจ</button>
            <p className="mt-3 text-center text-xs text-brand-text/50">
              ยืนยันทันที · ชำระเงินปลอดภัยผ่าน Stripe
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
