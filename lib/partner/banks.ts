// รายชื่อธนาคารสำหรับบัญชีรับค่าคอมของพาร์ทเนอร์
export const THAI_BANKS = [
  "ธนาคารกสิกรไทย (KBANK)",
  "ธนาคารไทยพาณิชย์ (SCB)",
  "ธนาคารกรุงเทพ (BBL)",
  "ธนาคารกรุงไทย (KTB)",
  "ธนาคารกรุงศรีอยุธยา (BAY)",
  "ธนาคารทหารไทยธนชาต (ttb)",
  "ธนาคารออมสิน (GSB)",
  "ธนาคารเพื่อการเกษตรและสหกรณ์ (ธ.ก.ส.)",
  "ธนาคารอาคารสงเคราะห์ (ธอส.)",
  "ธนาคารยูโอบี (UOB)",
  "ธนาคารซีไอเอ็มบี ไทย (CIMB)",
  "ธนาคารเกียรตินาคินภัทร (KKP)",
  "ธนาคารแลนด์ แอนด์ เฮ้าส์ (LH Bank)",
  "ธนาคารทิสโก้ (TISCO)",
  "พร้อมเพย์ (PromptPay)",
];

// ประเภทพาร์ทเนอร์ (ตรงกับ enum partner_type ในฐานข้อมูล)
export const PARTNER_TYPES = [
  { value: "guide", label: "ไกด์ / ผู้นำเที่ยว" },
  { value: "hotel", label: "โรงแรม / ที่พัก" },
  { value: "driver", label: "คนขับรถ / รถรับส่ง" },
  { value: "agent", label: "เอเจนซี่ / ตัวแทนขายทัวร์" },
];
export const PARTNER_TYPE_VALUES = PARTNER_TYPES.map((t) => t.value);
export function partnerTypeLabel(v?: string | null) {
  return PARTNER_TYPES.find((t) => t.value === v)?.label ?? "-";
}
