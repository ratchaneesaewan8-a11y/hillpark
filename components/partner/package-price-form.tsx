"use client";

import { useState } from "react";
import { Check, PencilLine } from "lucide-react";
import { formatTHB } from "@/lib/utils";

export function PackagePriceForm({
  packageId, packageName, minPrice, maxPrice, defaultPrice, action,
}: { packageId: string; packageName: string; minPrice: number; maxPrice: number; defaultPrice: number; action: (formData: FormData) => void | Promise<void> }) {
  const [price, setPrice] = useState(defaultPrice);
  const [editing, setEditing] = useState(false);
  return <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-teal-950">{packageName}</p></div><span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-brand-teal">ราคาของคุณ {formatTHB(price)}</span></div><form action={action} className="mt-4 flex flex-wrap items-end gap-2"><input type="hidden" name="package_id" value={packageId}/><label className="flex-1"><span className="label text-teal-950">ราคาขายต่อคน</span><input type="number" required min={minPrice} max={maxPrice} value={price} onChange={e => { setPrice(Number(e.target.value)); setEditing(true); }} name="sale_price" className="input bg-white"/></label><button className="btn-primary px-4" type="submit"><Check size={17}/>{editing ? "บันทึกราคา" : <><PencilLine size={17}/>แก้ไขราคา</>}</button></form><p className="mt-3 text-xs text-teal-900/70">หลังบันทึก ลิงก์และ QR Code ของคุณจะใช้ราคานี้อัตโนมัติ</p></div>;
}
