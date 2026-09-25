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
    let userId = user?.id;
    if (!userId) {
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const password = typeof body.password === "string" ? body.password : "";
      if (!email || password.length < 6) {
        return NextResponse.json({ error: "กรุณาระบุอีเมลและรหัสผ่านอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
      }
      const { data: created, error: createError } = await createAdminClient().auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { name: payload.full_name },
      });
      if (createError || !created.user) {
        return NextResponse.json({ error: "อีเมลนี้อาจถูกใช้งานแล้ว กรุณาเข้าสู่ระบบก่อนสมัคร" }, { status: 409 });
      }
      userId = created.user.id;
    }
    Object.assign(payload, { user_id: userId });
    const { error } = await createAdminClient().from("partners").insert(payload);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("partner application", error);
    return NextResponse.json({ error: "ไม่สามารถส่งใบสมัครได้ กรุณาลองใหม่" }, { status: 500 });
  }
}
