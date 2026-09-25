import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

const fields = ["full_name", "phone", "line_id", "bank_name", "bank_account_name", "bank_account_number", "partner_type"] as const;
const validTypes = new Set(["guide", "hotel", "driver", "agent"]);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!fields.every((key) => typeof body[key] === "string" && body[key].trim()) || !validTypes.has(body.partner_type)) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }
    const payload = Object.fromEntries(fields.map((key) => [key, body[key].trim()]));
    const { data: { user } } = await createClient().auth.getUser();
    if (user) Object.assign(payload, { user_id: user.id });
    const { error } = await createAdminClient().from("partners").insert(payload);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("partner application", error);
    return NextResponse.json({ error: "ไม่สามารถส่งใบสมัครได้ กรุณาลองใหม่" }, { status: 500 });
  }
}
