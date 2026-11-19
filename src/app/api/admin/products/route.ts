import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0600-\u06ff]+/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "product"
  );
}

const str = (v: unknown) => (v == null ? null : String(v).trim() || null);
const num = (v: unknown) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n > 0 ? n : null;
};

function sanitize(b: Record<string, unknown>) {
  const extra =
    b.extra && typeof b.extra === "object" && !Array.isArray(b.extra)
      ? (Object.fromEntries(
              Object.entries(b.extra as Record<string, unknown>).map(([k, v]) => [
                String(k).trim(),
                String(v).trim(),
              ])
            ) as Record<string, string>)
      : null;
  return {
    name: str(b.name),
    nameEn: str(b.nameEn),
    subtitle: str(b.subtitle),
    subtitleEn: str(b.subtitleEn),
    category: (b.category === "makeup" ? "makeup" : "bags") as "bags" | "makeup",
    price: num(b.price),
    oldPrice: num(b.oldPrice),
    description: str(b.description),
    descriptionEn: str(b.descriptionEn),
    image: str(b.image),
    badge: str(b.badge),
    featured: Boolean(b.featured),
    stock: num(b.stock) ?? 0,
    extra,
  };
}

export async function GET(req: Request) {
  if (!isAdmin(req))
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  try {
    const rows = await db.select().from(products).orderBy(desc(products.id));
    return NextResponse.json({ ok: true, products: rows });
  } catch {
    return NextResponse.json(
      { ok: false, error: "قاعدة البيانات غير متصلة" },
      { status: 503 }
    );
  }
}

export async function POST(req: Request) {
  if (!isAdmin(req))
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  try {
    const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const d = sanitize(b);
    if (!d.name || !d.price || !d.image) {
      return NextResponse.json(
        { ok: false, error: "الاسم والسعر والصورة مطلوبة" },
        { status: 400 }
      );
    }
    const [row] = await db
      .insert(products)
      .values({
        slug: `${slugify(d.name)}-${Date.now()}`,
        name: d.name,
        nameEn: d.nameEn,
        subtitle: d.subtitle,
        subtitleEn: d.subtitleEn,
        category: d.category,
        price: d.price,
        oldPrice: d.oldPrice,
        description: d.description,
        descriptionEn: d.descriptionEn,
        image: d.image,
        badge: d.badge,
        featured: d.featured,
        stock: d.stock,
        extra: d.extra,
      })
      .returning();
    return NextResponse.json({ ok: true, product: row });
  } catch (e) {
    console.error("admin create:", e);
    return NextResponse.json(
      { ok: false, error: "قاعدة البيانات غير متصلة" },
      { status: 503 }
    );
  }
}

export async function PATCH(req: Request) {
  if (!isAdmin(req))
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  try {
    const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const id = Number(b.id);
    if (!id)
      return NextResponse.json({ ok: false, error: "id مفقود" }, { status: 400 });
    const d = sanitize(b);
    const updates: Partial<typeof products.$inferInsert> = {};
    if (b.name !== undefined) {
      const v = str(b.name);
      if (v) updates.name = v;
    }
    if (b.nameEn !== undefined) updates.nameEn = str(b.nameEn);
    if (b.subtitle !== undefined) updates.subtitle = str(b.subtitle);
    if (b.subtitleEn !== undefined) updates.subtitleEn = str(b.subtitleEn);
    if (b.category !== undefined)
      updates.category = b.category === "makeup" ? "makeup" : "bags";
    if (b.price !== undefined) {
      const v = num(b.price);
      if (v) updates.price = v;
    }
    if (b.oldPrice !== undefined) updates.oldPrice = num(b.oldPrice);
    if (b.description !== undefined) updates.description = str(b.description);
    if (b.descriptionEn !== undefined) updates.descriptionEn = str(b.descriptionEn);
    if (b.image !== undefined) {
      const v = str(b.image);
      if (v) updates.image = v;
    }
    if (b.badge !== undefined) updates.badge = str(b.badge);
    if (b.featured !== undefined) updates.featured = Boolean(b.featured);
    if (b.stock !== undefined)
      updates.stock = Math.max(0, Math.round(Number(b.stock) || 0));
    if (b.extra !== undefined) updates.extra = d.extra;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { ok: false, error: "لا يوجد شيء لتعديله" },
        { status: 400 }
      );
    }
    const [row] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    if (!row)
      return NextResponse.json(
        { ok: false, error: "المنتج غير موجود" },
        { status: 404 }
      );
    return NextResponse.json({ ok: true, product: row });
  } catch (e) {
    console.error("admin update:", e);
    return NextResponse.json(
      { ok: false, error: "قاعدة البيانات غير متصلة" },
      { status: 503 }
    );
  }
}

export async function DELETE(req: Request) {
  if (!isAdmin(req))
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  try {
    const b = (await req.json().catch(() => ({}))) as { id?: number };
    const id = Number(b.id);
    if (!id)
      return NextResponse.json({ ok: false, error: "id مفقود" }, { status: 400 });
    await db.delete(products).where(eq(products.id, id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin delete:", e);
    return NextResponse.json(
      { ok: false, error: "قاعدة البيانات غير متصلة" },
      { status: 503 }
    );
  }
}
