"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type DraftPackage = { id: number; name: string; price: string; capacity: string; link: string };

export function NewPackageRows() {
  const [rows, setRows] = useState<DraftPackage[]>([{ id: 1, name: "", price: "", capacity: "0", link: "" }]);
  const addRow = () => setRows((current) => [...current, { id: Date.now(), name: "", price: "", capacity: "0", link: "" }]);
  const updateRow = (id: number, field: keyof Omit<DraftPackage, "id">, value: string) => {
    setRows((current) => current.map((row) => row.id === id ? { ...row, [field]: value } : row));
  };

  return (
    <div className="mt-5 rounded-xl border border-dashed border-brand-orange/40 bg-brand-orange/[0.03] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-brand-orange"><Plus size={16} /> เพิ่มตัวเลือกแพ็กเกจ</div>
          <p className="mt-1 text-xs text-brand-text/55">เพิ่มได้หลายตัวเลือกในครั้งเดียว เช่น ATV 30 นาที และ ATV 1 ชั่วโมง</p>
        </div>
        <button type="button" onClick={addRow} className="rounded-lg border border-brand-orange/40 px-3 py-1.5 text-sm font-semibold text-brand-orange hover:bg-brand-orange/10">
          <Plus size={15} className="mr-1 inline" /> เพิ่มตัวเลือก
        </button>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={row.id} className="relative grid gap-3 rounded-xl bg-white p-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
              ชื่อแพ็กเกจ
              <input name="new_pkg_name" value={row.name} onChange={(e) => updateRow(row.id, "name", e.target.value)} placeholder={index === 0 ? "เช่น ATV 30 นาที" : "เช่น ATV 1 ชั่วโมง"} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
              ราคา (บาท/คน)
              <input name="new_pkg_price" type="number" min={0} value={row.price} onChange={(e) => updateRow(row.id, "price", e.target.value)} placeholder={index === 0 ? "1100" : "1600"} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70">
              จำนวนที่รับ (คน/รอบ)
              <input name="new_pkg_capacity" type="number" min={0} value={row.capacity} onChange={(e) => updateRow(row.id, "capacity", e.target.value)} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-brand-text/70 sm:col-span-3">
              ลิงก์ชำระเงิน Stripe (ไม่บังคับ)
              <input name="new_pkg_link" type="url" value={row.link} onChange={(e) => updateRow(row.id, "link", e.target.value)} placeholder="https://buy.stripe.com/..." className="input" />
            </label>
            {rows.length > 1 && <button type="button" onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))} className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-red-500 text-white" aria-label="ลบตัวเลือก"><Trash2 size={14} /></button>}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-brand-text/45">กรอกเฉพาะตัวเลือกที่ต้องการ แล้วกด “บันทึกทั้งหมด” ด้านบน แพ็กเกจเดิมลบได้ด้วยปุ่มลบในแต่ละรายการ</p>
    </div>
  );
}
