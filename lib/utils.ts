import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** จัดรูปแบบราคาเป็นบาท เช่น 1390 -> ฿1,390 */
export function formatTHB(amount: number) {
  return "฿" + amount.toLocaleString("th-TH");
}

/** สร้างเลข booking เช่น HP-2026-000001 */
export function makeBookingNumber(seq: number) {
  const year = new Date().getFullYear();
  return `HP-${year}-${String(seq).padStart(6, "0")}`;
}
