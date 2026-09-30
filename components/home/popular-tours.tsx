import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { getPopularTours, getZiplinePromotion } from "@/lib/data/live-tours";
import { TourCard } from "./tour-card";
import { T } from "@/lib/i18n/language-context";

export async function PopularTours() {
  const [tours, ziplinePromotion] = await Promise.all([getPopularTours(), getZiplinePromotion()]);

  return (
    <section className="mx-auto mt-6 w-full max-w-5xl px-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-brand-green sm:text-2xl">
          <Flame size={20} className="text-brand-orange" /> <T th="ทัวร์ยอดนิยม" en="Popular Tours" />
        </h2>
        <Link href="/tours" className="flex items-center gap-1 text-sm font-semibold text-brand-orange hover:underline">
          <T th="ดูทั้งหมด" en="See All" /> <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5">
        {tours.slice(0, 9).map((tour) => (
          <TourCard
            key={tour.id}
            tour={tour}
            promotion={tour.slug === "hillpark-zipline-adventure" ? ziplinePromotion : null}
          />
        ))}
      </div>
    </section>
  );
}
