import Stripe from "stripe";

// สร้าง Stripe instance แบบ lazy — จะไม่ error ตอน build ถ้ายังไม่ใส่ key
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, { apiVersion: "2024-06-20", typescript: true });
  }
  return _stripe;
}
