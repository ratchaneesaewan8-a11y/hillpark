import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { parseClientReference } from "@/lib/partner/ref";

// -----------------------------------------------------------------------------
// POST /api/webhooks/stripe
// รับ event จาก Stripe -> verify signature -> บันทึกการจอง / ค่าคอมพาร์ทเนอร์
//
// รองรับ 2 แบบ:
//  A) Checkout API (/api/checkout)  -> มี metadata.booking_id -> อัปเดตการจองเดิมเป็น PAID
//  B) Stripe Payment Link           -> มี client_reference_id "<packageId>_<refCode>"
//       -> สร้างการจองใหม่ (ยอดขายขึ้นในแดชบอร์ด) + ค่าคอม Pending ให้พาร์ทเนอร์
//
// Event ที่ต้องเลือกใน Stripe:
//   checkout.session.completed
//   checkout.session.async_payment_succeeded
//   checkout.session.async_payment_failed
//   checkout.session.expired
//   charge.refunded
// -----------------------------------------------------------------------------

export const dynamic = "force-dynamic";

type Db = ReturnType<typeof createAdminClient>;

// วันที่ปัจจุบันตามเวลาไทย (YYYY-MM-DD)
function todayBangkok() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
}

// สร้างค่าคอมให้พาร์ทเนอร์ (ถ้ามีโค้ดและพาร์ทเนอร์อนุมัติแล้ว) — กันสร้างซ้ำด้วย booking_ref
async function createCommission(db: Db, refCode: string | null, bookingNumber: string, total: number) {
  if (!refCode || !bookingNumber || total <= 0) return;

  const { data: partner } = await db
    .from("partners")
    .select("id, status, commission_rate")
    .eq("ref_code", refCode)
    .maybeSingle();
  if (!partner || partner.status !== "approved") return;

  const { data: exists } = await db
    .from("partner_commissions")
    .select("id")
    .eq("partner_id", partner.id)
    .eq("booking_ref", bookingNumber)
    .maybeSingle();
  if (exists) return;

  const rate = partner.commission_rate ?? 0;
  await db.from("partner_commissions").insert({
    partner_id: partner.id,
    booking_ref: bookingNumber,
    order_amount: total,
    rate_at_booking: rate, // ล็อกอัตรา ณ วันจอง
    amount: Math.round((total * rate) / 100),
    status: "pending", // ชำระแล้ว รอลูกค้าใช้บริการ
  });
}

// การจ่ายเงินผ่าน Payment Link: สร้างการจอง (ครั้งเดียวต่อ session)
async function recordPaymentLinkSale(db: Db, session: Stripe.Checkout.Session) {
  const { packageId, refCode } = parseClientReference(session.client_reference_id);
  const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
  const total = Math.round((session.amount_total ?? 0) / 100); // สตางค์ -> บาท

  // มีการจองจาก session นี้แล้ว (Stripe ส่ง event ซ้ำได้)
  const { data: existing } = await db
    .from("bookings")
    .select("id, booking_number, booking_status")
    .eq("stripe_session_id", session.id)
    .maybeSingle();
  if (existing) {
    if (paid && existing.booking_status !== "PAID") {
      await db
        .from("bookings")
        .update({ booking_status: "PAID", payment_status: "paid" })
        .eq("id", existing.id);
    }
    if (paid) await createCommission(db, refCode, existing.booking_number, total);
    return;
  }

  // หาแพ็กเกจ -> ทัวร์
  let tourId: string | null = null;
  if (packageId) {
    const { data: pkg } = await db.from("packages").select("id, tour_id").eq("id", packageId).maybeSingle();
    tourId = pkg?.tour_id ?? null;
  }

  // จำนวนคน (ตามจำนวนที่ลูกค้าเลือกในหน้า Stripe)
  let qty = 1;
  try {
    const items = await getStripe().checkout.sessions.listLineItems(session.id, { limit: 10 });
    qty = items.data.reduce((s, li) => s + (li.quantity ?? 0), 0) || 1;
  } catch {
    // ไม่เป็นไร ใช้ 1
  }

  const paymentIntent =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  const { data: booking, error } = await db
    .from("bookings")
    .insert({
      tour_id: tourId,
      package_id: packageId,
      booking_date: todayBangkok(), // Payment Link ไม่มีการเลือกวัน -> ใช้วันที่ชำระ
      adults: qty,
      subtotal: total,
      total,
      currency: session.currency ?? "thb",
      payment_status: paid ? "paid" : "unpaid",
      booking_status: paid ? "PAID" : "PENDING_PAYMENT",
      stripe_session_id: session.id,
      stripe_payment_intent_id: paymentIntent,
    })
    .select("id, booking_number")
    .single();
  if (error || !booking) {
    console.error("create booking from payment link failed", error);
    throw new Error("cannot create booking");
  }

  // ข้อมูลผู้จอง (จากหน้า Stripe)
  const c = session.customer_details;
  if (c) {
    const [first, ...rest] = (c.name ?? "").trim().split(/\s+/);
    await db.from("booking_contacts").insert({
      booking_id: booking.id,
      first_name: first || null,
      last_name: rest.join(" ") || null,
      email: c.email ?? null,
      phone: c.phone ?? null,
    });
  }

  if (paid) await createCommission(db, refCode, booking.booking_number, total);
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const db = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.booking_id;

        if (bookingId) {
          // แบบ A: Checkout API
          if (session.payment_status === "paid") {
            await db
              .from("bookings")
              .update({
                booking_status: "PAID",
                payment_status: "paid",
                stripe_payment_intent_id: session.payment_intent as string,
              })
              .eq("id", bookingId);
          }
        } else if (session.client_reference_id) {
          // แบบ B: Payment Link
          await recordPaymentLinkSale(db, session);
        }
        break;
      }

      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.booking_id;
        const q = db.from("bookings").update({ booking_status: "PAYMENT_FAILED", payment_status: "failed" });
        if (bookingId) await q.eq("id", bookingId);
        else await q.eq("stripe_session_id", session.id).eq("booking_status", "PENDING_PAYMENT");
        break;
      }

      case "charge.refunded": {
        // คืนเงินเต็มจำนวน -> การจองเป็น REFUNDED และค่าคอมที่ยังไม่จ่ายเป็น void
        const charge = event.data.object as Stripe.Charge;
        if (!charge.refunded) break; // คืนบางส่วน: ให้แอดมินปรับค่าคอมเองในหลังบ้าน
        const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (!pi) break;

        const { data: booking } = await db
          .from("bookings")
          .select("id, booking_number")
          .eq("stripe_payment_intent_id", pi)
          .maybeSingle();
        if (!booking) break;

        await db.from("bookings").update({ booking_status: "REFUNDED", payment_status: "refunded" }).eq("id", booking.id);
        await db
          .from("partner_commissions")
          .update({ status: "void", void_reason: "คืนเงินแล้ว" })
          .eq("booking_ref", booking.booking_number)
          .in("status", ["pending", "available"]);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("Webhook handler error", err);
    // ส่ง 500 ให้ Stripe ลองส่งใหม่อัตโนมัติ
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
