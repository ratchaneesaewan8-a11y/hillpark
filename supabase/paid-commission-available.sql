-- กติกาใหม่: ชำระเงินสำเร็จ = เครดิตพาร์ทเนอร์พร้อมถอนทันที
-- ใช้ครั้งเดียวกับข้อมูลเดิมที่ยังค้างสถานะ pending

update public.partner_commissions as commission
set status = 'available'
from public.bookings as booking
where commission.booking_ref = booking.booking_number
  and commission.status = 'pending'
  and booking.payment_status = 'paid'
  and booking.booking_status in ('PAID', 'CONFIRMED', 'COMPLETED');

update public.booking_revenue_splits as split
set status = 'available', updated_at = now()
from public.bookings as booking
where split.booking_id = booking.id
  and split.status = 'pending'
  and booking.payment_status = 'paid'
  and booking.booking_status in ('PAID', 'CONFIRMED', 'COMPLETED');
