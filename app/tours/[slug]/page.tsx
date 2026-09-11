import { notFound } from "next/navigation";
import { getTourBySlug } from "@/lib/data/live-tours";
import { TourDetailContent } from "@/components/tours/tour-detail-content";

// หน้า Tour Detail (เวอร์ชันเริ่มต้น)
// TODO (ดู README §Roadmap): Itinerary, Included/Excluded, Reviews,
// Booking Widget (sticky), Package selection, เชื่อม Booking Flow
export default async function TourDetailPage({ params }: { params: { slug: string } }) {
  const result = await getTourBySlug(params.slug);
  if (!result) return notFound();
  const { tour, gallery, packages } = result;

  return (
    <div className="container-page py-8">
      <TourDetailContent tour={tour} gallery={gallery} packages={packages} />
    </div>
  );
}
