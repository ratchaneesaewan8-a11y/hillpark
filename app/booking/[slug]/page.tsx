import { notFound } from "next/navigation";
import { getTourBySlug } from "@/lib/data/live-tours";
import { BookingForm } from "@/components/booking/booking-form";

export const dynamic = "force-dynamic";

export default async function BookingPage({ params }: { params: { slug: string } }) {
  const result = await getTourBySlug(params.slug);
  if (!result || result.packages.length === 0) notFound();
  return <main className="container-page py-8 lg:py-12"><BookingForm tour={result.tour} packages={result.packages} /></main>;
}
