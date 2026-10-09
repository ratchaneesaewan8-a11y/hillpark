import { getActiveCategories } from "@/lib/data/live-tours";
import { CategoryScrollerClient } from "./category-scroller-client";

export async function CategoryScroller() {
  const categories = await getActiveCategories();
  return <CategoryScrollerClient categories={categories} />;
}
