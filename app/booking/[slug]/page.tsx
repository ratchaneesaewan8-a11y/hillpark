import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getTourBySlug } from "@/lib/data/live-tours";
import { BookingForm } from "@/components/booking/booking-form";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BookingPage({ params, searchParams }: { params: { slug: string }; searchParams: { package?: string } }) {
  const result = await getTourBySlug(params.slug);
  if (!result || result.packages.length === 0) notFound();

  const requestedPackageId = searchParams.package;
  const requestedPackage = result.packages.find((pkg) => pkg.id === requestedPackageId);
  const refCode = cookies().get("hillpark_ref")?.value;
  let partnerBooking: { packageId: string; unitPrice: number } | undefined;

  // QR ระบุเฉพาะพาร์ทเนอร์และแพ็กเกจ ส่วนราคาจะอ่านล่าสุดจากฐานข้อมูลทุกครั้ง
  if (refCode && requestedPackage?.affiliate_min_price) {
    const db = createAdminClient();
    const { data: partner } = await db
      .from("partners")
      .select("id")
      .or(`ref_code.eq.${refCode},affiliate_code.eq.${refCode}`)
      .eq("status", "approved")
      .maybeSingle();
    if (partner) {
      const { data: savedPrice } = await db
        .from("partner_package_prices")
        .select("sale_price")
        .eq("partner_id", partner.id)
        .eq("package_id", requestedPackage.id)
        .maybeSingle();
      const unitPrice = Number(savedPrice?.sale_price ?? requestedPackage.affiliate_min_price);
      const maxPrice = Math.max(requestedPackage.affiliate_max_price ?? 0, requestedPackage.regular_price ?? 0);
      if (Number.isInteger(unitPrice) && unitPrice >= requestedPackage.affiliate_min_price && unitPrice <= maxPrice) {
        partnerBooking = { packageId: requestedPackage.id, unitPrice };
      }
    }
  }

  return <main className="container-page py-8 lg:py-12"><BookingForm tour={result.tour} packages={result.packages} partnerBooking={partnerBooking} /></main>;
}
