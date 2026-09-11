import { HeroSearch } from "@/components/home/hero-search";
import { CategoryScroller } from "@/components/home/category-scroller";
import { PopularTours } from "@/components/home/popular-tours";
import { Benefits } from "@/components/home/benefits";

export default function HomePage() {
  return (
    <>
      <HeroSearch />
      <CategoryScroller />
      <PopularTours />
      <Benefits />
      <div className="h-4" />
    </>
  );
}
