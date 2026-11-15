import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db, isDbConfigured } from "@/db";
import { products } from "@/db/schema";

export const dynamic = "force-dynamic";

const PIN = process.env.ADMIN_PIN || "1234";

function guard(req: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { ok: false, error: "قاعدة البيانات غير موصولة" },
      { status: 503 }
    );
  }
  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${PIN}`) {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }
  return null;
}

type Body = {
  id?: number;
  name?: string;
  nameEn?: string;
  subtitle?: string | null;
  subtitleEn?: string | null;
  category?: string;
  price?: number;
  oldPrice?: number | null;
  badge?: string | null;
  featured?: boolean;
  stock?: number;
  description?: string | null;
  descriptionEn?: string | null;
  image?: string;
};

function parse(b: Body) {
  return {
    name: String(b.name ?? "").trim(),
    nameEn: String(b.nameEn ?? "").trim(),
    subtitle: String(b.subtitle ?? "").trim() || null,
    subtitleEn: String(b.subtitleEn ?? "").trim() || null,
    category: b.category === "makeup" ? "makeup" : "bags",
    price: Math.max(0, Math.round(Number(b.price) || 0)),
    oldPrice: b.oldPrice ? Math.round(Number(b.oldPrice)) : null,
    badge: String(b.badge ?? "").trim() || null,
    featured: Boolean(b.featured),
    stock: Math.max(0, Math.round(Number(b.stock) || 0)),
    description: String(b.description ?? "").trim() || null,
    descriptionEn: String(b.descriptionEn ?? "").trim() || null,
    image: String(b.image ?? "").trim(),
  };
}

function validate(d: ReturnType<typeof parse>) {
  if (!d.name) return "اسم المنتج بالعربي مطلوب";
  if (!d.nameEn) return "اسم المنتج بالإنجليزي مطلوب";
  if (d.price <= 0) return "السعر يجب أن يكون أكبر من صفر";
  if (!d.image) return "صورة المنتج مطلوبة";
  return null;
}

export async function GET(req: Request) {
  const g = guard(req);
  if (g) return g;
  try {
    const rows = await db.select().from(products).orderBy(desc(products.id));
    return NextResponse.json({ ok: true, products: rows });
  } catch (e) {
    console.error("[admin] list error:", e);
    return NextResponse.json({ ok: false, error: "خطأ في القراءة" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const g = guard(req);
  if (g) return g;
  try {
    const b = (await req.json()) as Body;
    const d = parse(b);
    const err = validate(d);
    if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 });
    const [row] = await db
      .insert(products)
      .values({
        ...d,
        slug: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      })
      .returning();
    return NextResponse.json({ ok: true, product: row });
  } catch (e) {
    console.error("[admin] create error:", e);
    return NextResponse.json({ ok: false, error: "خطأ في الحفظ" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const g = guard(req);
  if (g) return g;
  try {
    const b = (await req.json()) as Body;
    const id = Number(b.id);
    if (!id) return NextResponse.json({ ok: false, error: "id مفقود" }, { status: 400 });
    const d = parse(b);
    const err = validate(d);
    if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 });
    const [row] = await db
      .update(products)
      .set(d)
      .where(eq(products.id, id))
      .returning();
    if (!row) return NextResponse.json({ ok: false, error: "المنتج غير موجود" }, { status: 404 });
    return NextResponse.json({ ok: true, product: row });
  } catch (e) {
    console.error("[admin] update error:", e);
    return NextResponse.json({ ok: false, error: "خطأ في التحديث" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const g = guard(req);
  if (g) return g;
  try {
    const b = (await req.json()) as { id?: number };
    const id = Number(b.id);
    if (!id) return NextResponse.json({ ok: false, error: "id مفقود" }, { status: 400 });
    await db.delete(products).where(eq(products.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin] delete error:", e);
    return NextResponse.json({ ok: false, error: "خطأ في الحذف" }, { status: 500 });
  }
}
