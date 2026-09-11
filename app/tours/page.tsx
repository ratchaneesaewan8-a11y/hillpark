import { getAllTours } from "@/lib/data/live-tours";
import { TourCard } from "@/components/home/tour-card";
import { T } from "@/lib/i18n/language-context";

// หน้า Tour Listing (เวอร์ชันเริ่มต้น) — ยังไม่มี Filter/Sort จริง
// TODO (ดู README §Roadmap): เพิ่ม Sidebar Filter + Sort
export default async function ToursPage() {
  const tours = await getAllTours();

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-brand-text">
        <T th="ทัวร์ & กิจกรรมทั้งหมด" en="All Tours & Activities" />
      </h1>
      <p className="mt-1 text-sm text-brand-text/60">
        {tours.length} <T th="รายการ — (เวอร์ชันเริ่มต้น ยังไม่เปิด Filter/Sort)" en="items — (initial version, filter/sort not yet available)" />
      </p>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tours.map((t) => (
          <TourCard key={t.id} tour={t} />
        ))}
      </div>
    </div>
  );
}
