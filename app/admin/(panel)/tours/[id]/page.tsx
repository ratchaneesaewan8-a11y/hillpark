import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TourFields } from "@/components/admin/tour-fields";
import { ImageUpload } from "@/components/admin/image-upload";
import { NewPackageRows } from "@/components/admin/new-package-rows";
import { DeleteGalleryImageButton } from "@/components/admin/delete-gallery-image-button";
import { PartnerSaleFields } from "@/components/admin/partner-sale-fields";
import { SaveToast } from "@/components/admin/save-toast";
import { SubmitButton } from "@/components/admin/submit-button";
import { saveTourPage, deletePackageFromPage } from "../actions";

export const dynamic = "force-dynamic";

// หน้าแก้ไขทัวร์ — ฟอร์มเดียว ปุ่มบันทึกจุดเดียว
// (บันทึกข้อมูลทัวร์ + แพ็กเกจทั้งหมด + แพ็กเกจใหม่ + รูปใหม่ ในครั้งเดียว)
export default async function EditTourPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { saved?: string };
}) {
  const supabase = createClient();
  const [{ data: tour }, { data: categories }, { data: packages }, { data: images }] = await Promise.all([
    supabase.from("tours").select("*").eq("id", params.id).single(),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("packages").select("*").eq("tour_id", params.id).order("adult_price"),
    supabase.from("tour_images").select("*").eq("tour_id", params.id).order("sort_order"),
  ]);

  if (!tour) return notFound();
  const isAtvActivity = tour.slug?.toLowerCase().includes("atv");

  return (
    <>
      <SaveToast status={searchParams.saved} />
      {/* key เปลี่ยนทุกครั้งที่โหลดหน้า -> หลังบันทึก ฟอร์มรีเซ็ต (ช่องแพ็กเกจใหม่/รูปใหม่ว่าง) กันเพิ่มซ้ำ */}
      <form key={Date.now()} action={saveTourPage} className="space-y-8">

      {/* แถบบนสุด: ปุ่มบันทึกจุดเดียว (ติดด้านบนตอนเลื่อน)
          ปุ่มนี้ต้องอยู่เป็นปุ่มแรกในฟอร์ม เพื่อให้กด Enter แล้ว "บันทึก" ไม่ใช่ไปโดนปุ่มลบ */}
      <div className="sticky top-0 z-20 -mx-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-bg/95 px-2 py-3 backdrop-blur">
        <div>
          <Link href="/admin/tours" className="mb-1 inline-flex items-center gap-1 text-sm text-brand-text/60 hover:text-brand-orange">
            <ArrowLeft size={16} /> กลับ
          </Link>
          <h1 className="text-2xl font-bold text-brand-text">แก้ไขทัวร์</h1>
        </div>
        <SubmitButton label="บันทึกทั้งหมด" />
      </div>

      {/* ข้อมูลทัวร์ */}
      <section className="rounded-2xl bg-white p-6 shadow-soft">
        <TourFields tour={tour} categories={categories ?? []} />
      </section>

      {/* แพ็กเกจ + ราคา */}
      <section className="rounded-2xl bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-bold text-brand-text">แพ็กเกจและราคา</h2>

        <div className="space-y-3">
          {(packages ?? []).map((p) => (
            <div key={p.id} className="rounded-xl border border-black/10 p-4">
              <input type="hidden" name="pkg_ids" value={p.id} />
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
                  ชื่อแพ็กเกจ
                  <input name={`pkg_${p.id}_name`} required defaultValue={p.name_th} className="input" />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
                  ราคาที่ใช้จอง (บาท/คน)
                  <input name={`pkg_${p.id}_price`} type="number" required defaultValue={p.adult_price} className="input" />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
                  จำนวนที่รับ (คน/รอบ)
                  <input name={`pkg_${p.id}_capacity`} type="number" defaultValue={p.capacity} className="input" />
                </label>
                <div className="sm:col-span-3 rounded-xl border border-brand-orange/20 bg-brand-orange/[0.04] p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><div className="font-semibold text-brand-text">ราคาโปรโมชั่น</div><p className="text-xs font-normal text-brand-text/55">เปิดใช้แล้ว หน้าเว็บจะแสดงราคาปกติแบบขีดทับ และราคาโปรโมชัน</p></div><label className="flex items-center gap-2 text-sm font-semibold text-brand-orange"><input type="checkbox" name={`pkg_${p.id}_promo_active`} defaultChecked={p.promo_active ?? false} /> เปิดใช้โปรโมชั่น</label></div>
                  <div className="grid gap-3 sm:grid-cols-2"><label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">ราคาปกติ (บาท/คน)<input name={`pkg_${p.id}_regular_price`} type="number" min={0} defaultValue={p.regular_price ?? ""} placeholder="เช่น 1700" className="input" /></label><label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">ราคาโปรโมชั่น (บาท/คน)<input name={`pkg_${p.id}_promo_price`} type="number" min={0} defaultValue={p.promo_price ?? ""} placeholder="เช่น 1500" className="input" /></label></div>
                </div>
{isAtvActivity && <PartnerSaleFields id={p.id} enabled={p.partner_enabled ?? Boolean(p.affiliate_min_price)} min={p.affiliate_min_price} max={p.affiliate_max_price} platform={p.platform_fee} operator={p.operator_amount} />}
                <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70 sm:col-span-3">
                  ลิงก์ชำระเงิน Stripe (Payment Link)
                  <input
                    name={`pkg_${p.id}_link`}
                    type="url"
                    defaultValue={p.payment_link ?? ""}
                    placeholder="https://buy.stripe.com/..."
                    className="input"
                  />
                  {!p.payment_link && (
                    <span className="text-[11px] font-normal text-red-500">ยังไม่ได้ใส่ลิงก์ชำระเงิน — ลูกค้าจะกดจองแพ็กเกจนี้ไม่ได้</span>
                  )}
                </label>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-4"><label className="flex items-center gap-2 text-sm text-brand-text/70"><input type="checkbox" name={`pkg_${p.id}_active`} defaultChecked={p.active} /> ใช้งาน</label></div>
                <button
                  type="submit"
                  formAction={deletePackageFromPage}
                  formNoValidate
                  name="delete_package"
                  value={p.id}
                  className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
                >
                  <Trash2 size={15} /> ลบแพ็กเกจนี้
                </button>
              </div>
            </div>
          ))}
          {(!packages || packages.length === 0) && (
            <p className="text-sm text-brand-text/50">ยังไม่มีแพ็กเกจ — เพิ่มด้านล่าง</p>
          )}
        </div>

        <NewPackageRows />
      </section>

      {/* แกลเลอรีรูป */}
      <section className="rounded-2xl bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-bold text-brand-text">แกลเลอรีรูปภาพ</h2>
        <div className="mb-5 flex flex-wrap gap-3">
          {(images ?? []).map((img) => (
            <div key={img.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.image_url} alt="" className="h-24 w-32 rounded-xl object-cover" />
              <DeleteGalleryImageButton tourId={tour.id} imageId={img.id} />
            </div>
          ))}
          {(!images || images.length === 0) && <p className="text-sm text-brand-text/50">ยังไม่มีรูปในแกลเลอรี</p>}
        </div>
        <ImageUpload name="new_gallery_image" label="เพิ่มรูปใหม่ (เลือกได้หลายภาพ แล้วกดบันทึกทั้งหมด)" multiple />
      </section>

      <div className="pb-6" />
      </form>
    </>
  );
}
