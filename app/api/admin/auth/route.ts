import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** PIN لوحة التحكم — غيّريه عبر متغير البيئة ADMIN_PIN على Vercel */
const PIN = process.env.ADMIN_PIN || "1234";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { pin?: string };
    if (String(body.pin ?? "") === PIN) {
      return NextResponse.json({ ok: true, token: PIN });
    }
    return NextResponse.json(
      { ok: false, error: "PIN غير صحيح" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json({ ok: false, error: "طلب غير صالح" }, { status: 400 });
  }
}
