import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";

// -----------------------------------------------------------------------------
// POST /api/webhooks/stripe
// รับ event จาก Stripe -> verify signature -> อัปเดตสถานะ Booking เป็น PAID
//
// สำคัญ: ต้องใช้ Webhook เป็นตัว confirm การชำระเงินเท่านั้น
// ห้ามเชื่อสถานะจาก frontend (ดู spec §11, §34)
//
// ตั้งค่า local test:  stripe listen --forward-to localhost:3000/api/webhooks/stripe
// -----------------------------------------------------------------------------

// Stripe ต้องการ raw body -> ปิด body parsing ด้วยการอ่านเป็น text
export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get("stripe-signature")!;

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const bookingId = session.metadata?.booking_id;
      if (bookingId) {
        await supabase
          .from("bookings")
          .update({
            booking_status: "PAID",
            payment_status: "paid",
            stripe_payment_intent_id: session.payment_intent,
          })
          .eq("id", bookingId);

        // TODO: เพิ่ม booked ใน availability, สร้าง Voucher, ส่งอีเมลยืนยัน (Resend)
      }
      break;
    }
    case "checkout.session.expired":
    case "payment_intent.payment_failed": {
      const obj = event.data.object as any;
      const bookingId = obj.metadata?.booking_id;
      if (bookingId) {
        await supabase
          .from("bookings")
          .update({ booking_status: "PAYMENT_FAILED", payment_status: "failed" })
          .eq("id", bookingId);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
