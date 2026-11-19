import { NextResponse } from "next/server";
import { adminLogin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const b = (await req.json().catch(() => ({}))) as {
      username?: string;
      password?: string;
    };
    const res = adminLogin(String(b.username ?? "").trim(), String(b.password ?? ""));
    if (!res.ok) return NextResponse.json(res, { status: 401 });
    return NextResponse.json(res);
  } catch {
    return NextResponse.json({ ok: false, error: "طلب غير صالح" }, { status: 400 });
  }
}
