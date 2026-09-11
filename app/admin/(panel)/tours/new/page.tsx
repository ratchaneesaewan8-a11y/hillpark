import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TourFields } from "@/components/admin/tour-fields";
import { saveTour } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewTourPage() {
  const supabase = createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");

  return (
    <div>
      <Link href="/admin/tours" className="mb-4 inline-flex items-center gap-1 text-sm text-brand-text/60 hover:text-brand-orange">
        <ArrowLeft size={16} /> กลับ
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-brand-text">เพิ่มทัวร์ใหม่</h1>
      <form action={saveTour} className="rounded-2xl bg-white p-6 shadow-soft">
        <TourFields tour={null} categories={categories ?? []} />
        <div className="mt-6 flex justify-end">
          <button className="btn-primary">บันทึกและไปตั้งค่าแพ็กเกจ</button>
        </div>
      </form>
    </div>
  );
}
