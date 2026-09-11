import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { getPopularTours } from "@/lib/data/live-tours";
import { TourCard } from "./tour-card";
import { T } from "@/lib/i18n/language-context";

export async function PopularTours() {
  const tours = await getPopularTours();

  return (
    <section className="container-page mt-12">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-brand-text">
          <Flame className="text-brand-orange" /> <T th="ทัวร์ยอดนิยม" en="Popular Tours" />
        </h2>
        <Link href="/tours" className="flex items-center gap-1 text-sm font-medium text-brand-orange hover:underline">
          <T th="ดูทั้งหมด" en="See All" /> <ArrowRight size={16} />
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
