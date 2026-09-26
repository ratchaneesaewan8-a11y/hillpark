"use client";

import { useState, useTransition } from "react";
import { setTourActive } from "@/app/admin/(panel)/tours/actions";

// สวิตช์แบบเลื่อน เปิด/ปิดการแสดงทัวร์บนหน้าเว็บ
export function TourActiveToggle({ id, initial }: { id: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  function toggle() {
    const next = !on;
    setOn(next); // เปลี่ยนทันที (optimistic)
    setError(false);
    startTransition(async () => {
      try {
        await setTourActive(id, next);
      } catch {
        setOn(!next); // บันทึกไม่สำเร็จ -> คืนค่าเดิม
        setError(true);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={on ? "ปิดทัวร์นี้" : "เปิดทัวร์นี้"}
        onClick={toggle}
        disabled={pending}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 disabled:opacity-60 ${
          on ? "bg-brand-teal" : "bg-black/20"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
            on ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
      <span className={`w-8 text-xs font-medium ${on ? "text-brand-teal" : "text-brand-text/40"}`}>
        {on ? "เปิด" : "ปิด"}
      </span>
      {error && <span className="text-xs text-red-500">บันทึกไม่สำเร็จ</span>}
    </div>
  );
}
