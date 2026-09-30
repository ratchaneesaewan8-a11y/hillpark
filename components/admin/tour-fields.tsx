"use client";

import { useRef, useState } from "react";
import { ImageUpload } from "./image-upload";
import { NewPackageRows } from "./new-package-rows";
import type { Category } from "@/lib/types";

type TourLike = Record<string, any> | null;

// แปลงข้อความเป็น slug (a-z, 0-9, ขีดกลาง) — ตัวอักษรไทยจะถูกตัดออก
// เพราะ URL slug ต้องเป็นภาษาอังกฤษ ให้พิมพ์ชื่อทัวร์ (อังกฤษ) ไว้ด้วยจะได้ slug ที่อ่านง่าย
function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ฟิลด์ของฟอร์มทัวร์ (ใช้ทั้งหน้า "เพิ่ม" และ "แก้ไข") — วางไว้ใน <form action={saveTour}>
export function TourFields({
  tour,
  categories,
}: {
  tour: TourLike;
  categories: Category[];
}) {
  const [titleEn, setTitleEn] = useState(tour?.title_en ?? "");
  const [slug, setSlug] = useState(tour?.slug ?? "");
  const [categoryId, setCategoryId] = useState(tour?.category_id ?? "");
  const isAtvActivity = categories.find((category) => category.id === categoryId)?.slug === "atv";
  // ทัวร์ที่มีอยู่แล้ว (แก้ไข) ถือว่า slug ถูกตั้งไว้แล้ว ไม่ auto-เขียนทับ
  // ทัวร์ใหม่ (เพิ่ม) จะ auto-กรอกให้จนกว่าผู้ใช้จะพิมพ์แก้ slug เอง
  const slugEdited = useRef(Boolean(tour?.id));

  function handleTitleChange(value: string, field: "th" | "en") {
    if (field === "en") setTitleEn(value);
    if (slugEdited.current) return;
    const base = field === "en" ? value : titleEn || value;
    setSlug(slugify(base));
  }

  function handleSlugChange(value: string) {
    slugEdited.current = true;
    setSlug(value);
  }

  return (
    <div className="grid gap-5">
      {tour?.id && <input type="hidden" name="id" value={tour.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">{isAtvActivity ? "ชื่อกิจกรรม ATV (ไทย)" : "ชื่อทัวร์ (ไทย)"} *</label>
          <input
            name="title_th"
            required
            defaultValue={tour?.title_th ?? ""}
            onChange={(e) => handleTitleChange(e.target.value, "th")}
            className="input"
          />
        </div>
        <div>
          <label className="label">{isAtvActivity ? "ชื่อกิจกรรม (อังกฤษ)" : "ชื่อทัวร์ (อังกฤษ)"}</label>
          <input
            name="title_en"
            value={titleEn}
            onChange={(e) => handleTitleChange(e.target.value, "en")}
            className="input"
          />
        </div>
        <div>
          <label className="label">Slug (URL) *</label>
          <input
            name="slug"
            required
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="full-day-hong-island"
            className="input"
          />
          <p className="mt-1 text-xs text-brand-text/50">
            ระบบกรอกให้อัตโนมัติจากชื่อทัวร์ (อังกฤษ) — แก้เองได้ตลอด
          </p>
        </div>
        <div>
          <label className="label">หมวดหมู่</label>
          <select name="category_id" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
            <option value="">— เลือกหมวดหมู่ —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name_th}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{isAtvActivity ? "พื้นที่ขับ / สถานที่" : "สถานที่"}</label>
          <input name="location" defaultValue={tour?.location ?? ""} placeholder={isAtvActivity ? "เช่น เส้นทาง ATV อ่าวนาง, กระบี่" : ""} className="input" />
        </div>
        <div>
          <label className="label">ราคาเริ่มต้น (บาท) *</label>
          <input name="base_price" type="number" required defaultValue={tour?.base_price ?? 0} className="input" />
        </div>
        <div>
          <label className="label">{isAtvActivity ? "ระยะเวลาของกิจกรรม" : "ระยะเวลา"}</label>
          <input name="duration" defaultValue={tour?.duration ?? ""} placeholder={isAtvActivity ? "เช่น 30 นาที, 1 ชั่วโมง" : "1 วัน / ครึ่งวัน"} className="input" />
        </div>
        <div>
          <label className="label">ป้าย (badge)</label>
          <input name="badge" defaultValue={tour?.badge ?? ""} placeholder="ยอดนิยม / แนะนำ / ใหม่" className="input" />
        </div>
        <div>
          <label className="label">{isAtvActivity ? "รอบเริ่มให้บริการ" : "เวลาเริ่ม"}</label>
          <input name="start_time" defaultValue={tour?.start_time ?? ""} placeholder={isAtvActivity ? "เช่น 09:00" : "08:30"} className="input" />
        </div>
        <div>
          <label className="label">{isAtvActivity ? "รอบสุดท้าย" : "เวลาสิ้นสุด"}</label>
          <input name="end_time" defaultValue={tour?.end_time ?? ""} placeholder={isAtvActivity ? "เช่น 17:00" : "16:30"} className="input" />
        </div>
        <div>
          <label className="label">{isAtvActivity ? "บริการรับส่ง (ถ้ามี)" : "จุดรับ"}</label>
          <input name="pickup_info" defaultValue={tour?.pickup_info ?? ""} placeholder={isAtvActivity ? "เช่น รับส่งจากโรงแรมอ่าวนางตามเงื่อนไข" : "รับที่โรงแรมในพื้นที่"} className="input" />
        </div>
        <div>
          <label className="label">{isAtvActivity ? "จุดลงทะเบียน / จุดเริ่มขับ" : "จุดนัดพบ"}</label>
          <input name="meeting_point" defaultValue={tour?.meeting_point ?? ""} placeholder={isAtvActivity ? "เช่น จุดลงทะเบียน ATV Hillpark" : ""} className="input" />
        </div>
      </div>

      {isAtvActivity && (
        <div className="rounded-2xl border border-brand-orange/25 bg-orange-50 p-5">
          <h2 className="font-bold text-brand-text">เทมเพลตกิจกรรม ATV</h2>
          <p className="mt-1 text-sm text-brand-text/65">หน้าเว็บจะแสดงรายละเอียดในรูปแบบกิจกรรม พร้อมเส้นทาง ความปลอดภัย สิ่งที่รวม และข้อควรรู้ก่อนจอง</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-brand-text/75">
            <li>ระบุระยะเวลารวมและรอบให้บริการด้านบน</li>
            <li>เขียนเส้นทาง จุดเด่น และข้อกำหนดการขับในช่องรายละเอียด</li>
            <li>หลังบันทึก ให้เพิ่มตัวเลือกเวลาและราคา เช่น ATV 30 นาที / 1 ชั่วโมง ในส่วน “แพ็กเกจและราคา”</li>
          </ol>
        </div>
      )}

      {isAtvActivity && !tour?.id && <NewPackageRows />}

      <div>
        <label className="label">{isAtvActivity ? "รายละเอียดเส้นทางและกิจกรรม (ไทย)" : "รายละเอียด (ไทย)"}</label>
        <textarea name="description_th" rows={isAtvActivity ? 6 : 4} defaultValue={tour?.description_th ?? ""} placeholder={isAtvActivity ? "อธิบายเส้นทาง ระดับความยาก อุปกรณ์ที่รวม และข้อกำหนดสำหรับผู้ขับ" : ""} className="input" />
      </div>
      <div>
        <label className="label">{isAtvActivity ? "รายละเอียดกิจกรรม (อังกฤษ)" : "รายละเอียด (อังกฤษ)"}</label>
        <textarea name="description_en" rows={4} defaultValue={tour?.description_en ?? ""} className="input" />
      </div>

      <ImageUpload name="cover_image" defaultValue={tour?.cover_image ?? ""} label="รูปหน้าปก (Cover)" />

      {!tour?.id && (
        <ImageUpload
          name="new_gallery_image"
          label={isAtvActivity ? "แกลเลอรีกิจกรรม ATV (เลือกได้หลายภาพ)" : "แกลเลอรีรูปภาพ (เลือกได้หลายภาพ)"}
          multiple
        />
      )}

      <div className="flex flex-wrap gap-6 text-sm text-brand-text/80">
        <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={tour ? tour.active : true} /> เปิดใช้งาน</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="popular" defaultChecked={tour?.popular ?? false} /> ทัวร์ยอดนิยม</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={tour?.featured ?? false} /> แนะนำ (featured)</label>
      </div>
    </div>
  );
}
