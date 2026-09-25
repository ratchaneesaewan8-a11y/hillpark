"use client";

import { useEffect } from "react";

// เก็บโค้ดแนะนำจาก ?ref=CODE ลงคุกกี้ 30 วัน
// เพื่อผูกกับการจองในอนาคต (ใช้คิดค่าคอมให้พาร์ทเนอร์)
export function RefCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) {
        const maxAge = 60 * 60 * 24 * 30; // 30 วัน
        document.cookie = `hillpark_ref=${encodeURIComponent(ref)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }
    } catch {
      // ignore
    }
  }, []);

  return null;
}
