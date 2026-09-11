import { HeroBanner } from "@/components/home/hero-banner";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { CategoryScroller } from "@/components/home/category-scroller";
import { PopularTours } from "@/components/home/popular-tours";
import { PromoStrip } from "@/components/home/promo-strip";
import { Benefits } from "@/components/home/benefits";
import { getFeaturedTours } from "@/lib/data/live-tours";

// อ่านข้อมูลสดจาก Supabase ทุกครั้ง (ทัวร์แนะนำที่แอดมินเพิ่ม/แก้ ขึ้นทันที)
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getFeaturedTours();

  return (
    <>
      <HeroBanner />
      <HeroCarousel tours={featured} />
      <CategoryScroller />
      <PopularTours />
      <PromoStrip />
      <div className="hidden lg:block">
        <Benefits />
      </div>
      <div className="h-4" />
    </>
  );
}
