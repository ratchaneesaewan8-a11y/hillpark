import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";

// -----------------------------------------------------------------------------
// POST /api/checkout
// สร้าง Booking (PENDING_PAYMENT) + Stripe Checkout Session แล้วคืน URL
//
// สำคัญด้านความปลอดภัย: ราคาต้องคำนวณที่ฝั่ง server เท่านั้น
// ห้ามรับ total จาก frontend มาเชื่อโดยตรง (ดู spec §34)
// -----------------------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tourId, packageId, date, startTime, adults = 0, children = 0, infants = 0, contact } = body;

    const supabase = createAdminClient();

    // 1) ตรวจสอบ package + ดึงราคาจริงจาก DB
    const { data: pkg, error: pkgErr } = await supabase
      .from("packages")
      .select("id, tour_id, name_th, adult_price, child_price, infant_price, capacity")
      .eq("id", packageId)
      .single();
    if (pkgErr || !pkg) return NextResponse.json({ error: "package not found" }, { status: 404 });

    // 2) ตรวจสอบ availability (ที่นั่งเหลือพอ)
    const guests = adults + children + infants;
    const { data: avail } = await supabase
      .from("availability")
      .select("id, capacity, booked")
      .eq("package_id", packageId)
      .eq("date", date)
      .eq("start_time", startTime)
      .maybeSingle();
    if (avail && avail.capacity - avail.booked < guests) {
      return NextResponse.json({ error: "sold out" }, { status: 409 });
    }

    // 3) คำนวณราคาฝั่ง server
    const subtotal =
      adults * pkg.adult_price + children * pkg.child_price + infants * pkg.infant_price;
    const total = subtotal; // + fees - discount (ถ้ามี)

    // 4) สร้าง Booking (PENDING_PAYMENT)
    const { data: booking, error: bkErr } = await supabase
      .from("bookings")
      .insert({
        tour_id: pkg.tour_id,
        package_id: pkg.id,
        booking_date: date,
        start_time: startTime,
        adults,
        children,
        infants,
        subtotal,
        total,
        currency: "thb",
        booking_status: "PENDING_PAYMENT",
      })
      .select("id, booking_number")
      .single();
    if (bkErr || !booking) return NextResponse.json({ error: "cannot create booking" }, { status: 500 });

    // เก็บข้อมูลผู้จอง
    if (contact) {
      await supabase.from("booking_contacts").insert({ booking_id: booking.id, ...contact });
    }

    // 5) สร้าง Stripe Checkout Session
    const stripe = getStripe();
    const site = process.env.NEXT_PUBLIC_SITE_URL!;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "thb",
            unit_amount: total * 100, // สตางค์
            product_data: { name: pkg.name_th },
          },
        },
      ],
      metadata: { booking_id: booking.id },
      success_url: `${site}/booking/success?booking=${booking.booking_number}`,
      cancel_url: `${site}/tours`,
    });

    // เก็บ session id ไว้กับ booking
    await supabase
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);

    // 6) คืน URL ให้ frontend redirect ไป Stripe
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
