// -----------------------------------------------------------------------------
// ผูกการจ่ายเงินผ่าน Stripe Payment Link กับ "แพ็กเกจ" และ "โค้ดพาร์ทเนอร์"
// ส่งผ่านพารามิเตอร์ client_reference_id ของ Stripe (รูปแบบ: <packageId>_<refCode>)
// webhook จะอ่านค่านี้กลับมาเพื่อบันทึกการจอง + สร้างค่าคอมให้พาร์ทเนอร์
// -----------------------------------------------------------------------------

export const REF_COOKIE = "hillpark_ref";

// Stripe อนุญาตเฉพาะ a-z A-Z 0-9 - _ และยาวไม่เกิน 200 ตัว
function clean(s: string) {
  return s.replace(/[^A-Za-z0-9-]/g, "").slice(0, 60);
}

// อ่านโค้ดพาร์ทเนอร์ในฝั่ง browser: จาก ?ref= ใน URL ก่อน แล้วค่อยดูคุกกี้
export function readRefCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("ref");
    if (fromUrl) return clean(fromUrl) || null;
    const m = document.cookie.match(new RegExp(`(?:^|; )${REF_COOKIE}=([^;]*)`));
    return m ? clean(decodeURIComponent(m[1])) || null : null;
  } catch {
    return null;
  }
}

// สร้างลิงก์จ่ายเงินที่แนบข้อมูลแพ็กเกจ + โค้ดพาร์ทเนอร์ไปด้วย
export function buildPaymentUrl(paymentLink: string, packageId: string, refCode: string | null) {
  try {
    const url = new URL(paymentLink);
    const pkg = clean(packageId);
    url.searchParams.set("client_reference_id", refCode ? `${pkg}_${refCode}` : pkg);
    return url.toString();
  } catch {
    return paymentLink;
  }
}

// ฝั่ง webhook: แยก client_reference_id กลับเป็น packageId + refCode
export function parseClientReference(value: string | null | undefined) {
  if (!value) return { packageId: null, refCode: null };
  const [packageId, refCode] = value.split("_");
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return {
    packageId: packageId && uuid.test(packageId) ? packageId : null,
    refCode: refCode ? clean(refCode) || null : null,
  };
}
