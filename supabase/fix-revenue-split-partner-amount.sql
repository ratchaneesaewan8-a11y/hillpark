-- แก้ยอดในรายงานแบ่งรายได้: ใช้ส่วนต่างจริงที่บันทึกไว้กับแต่ละการจอง
-- ไม่ใช้ partner_reward ของแพ็กเกจ เพราะพาร์ทเนอร์ตั้งราคาขายต่างกันได้

update public.booking_revenue_splits as split
set
  partner_amount = case
    when booking.affiliate_partner_id is not null then coalesce(booking.affiliate_commission, 0)
    else 0
  end,
  web_amount = case
    when booking.affiliate_partner_id is not null then 0
    else coalesce(split.web_amount, 0)
  end,
  operator_amount = greatest(
    0,
    coalesce(booking.total, 0)
      - coalesce(split.platform_amount, 0)
      - case when booking.affiliate_partner_id is not null then coalesce(booking.affiliate_commission, 0) else 0 end
      - case when booking.affiliate_partner_id is not null then 0 else coalesce(split.web_amount, 0) end
  ),
  updated_at = now()
from public.bookings as booking
where split.booking_id = booking.id;
