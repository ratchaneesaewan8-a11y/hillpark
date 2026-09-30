"use client";

import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";

// ปุ่มบันทึก: แสดง "กำลังบันทึก..." ระหว่างส่งข้อมูล
export function SubmitButton({ label = "บันทึก" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
      <Save size={18} /> {pending ? "กำลังบันทึก..." : label}
    </button>
  );
}
