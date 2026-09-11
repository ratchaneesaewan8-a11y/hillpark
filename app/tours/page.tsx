import { TOURS } from "@/lib/data/tours";
import { TourCard } from "@/components/home/tour-card";

// หน้า Tour Listing (เวอร์ชันเริ่มต้น) — ยังไม่มี Filter/Sort จริง
// TODO (ดู README §Roadmap): เพิ่ม Sidebar Filter + Sort + ดึงข้อมูลจาก Supabase
export default function ToursPage() {
  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-brand-text">ทัวร์ & กิจกรรมทั้งหมด</h1>
      <p className="mt-1 text-sm text-brand-text/60">
        {TOURS.length} รายการ — (เวอร์ชันเริ่มต้น ยังไม่เปิด Filter/Sort)
      </p>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {TOURS.map((t) => (
          <TourCard key={t.id} tour={t} />
        ))}
      </div>
    </div>
  );
}
