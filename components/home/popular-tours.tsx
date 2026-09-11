import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { getPopularTours } from "@/lib/data/live-tours";
import { TourCard } from "./tour-card";

export async function PopularTours() {
  const tours = await getPopularTours();

  return (
    <section className="container-page mt-12">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-brand-text">
          <Flame className="text-brand-orange" /> ทัวร์ยอดนิยม
        </h2>
        <Link href="/tours" className="flex items-center gap-1 text-sm font-medium text-brand-orange hover:underline">
          ดูทั้งหมด <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tours.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
    </section>
  );
}
