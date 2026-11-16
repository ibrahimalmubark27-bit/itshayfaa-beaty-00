import { desc } from "drizzle-orm";
import { db, isDbConfigured } from "@/db";
import { products as productsTable } from "@/db/schema";
import type { Product } from "@/lib/types";
import { FALLBACK_PRODUCTS } from "@/lib/products-fallback";
import Storefront from "@/components/Storefront";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  // ?noDb=1 → تخطي قاعدة البيانات (للاختبار أو النشر بدون DB)
  const skipDb = sp.noDb === "1";

  let products: Product[] = [];
  try {
    if (!skipDb && isDbConfigured()) {
      const rows = await db
        .select()
        .from(productsTable)
        .orderBy(desc(productsTable.featured), desc(productsTable.id));

      if (rows.length > 0) {
        products = rows.map((r) => ({
          id: r.id,
          slug: r.slug,
          name: r.name,
          subtitle: r.subtitle,
          category: r.category as Product["category"],
          price: r.price,
          oldPrice: r.oldPrice,
          description: r.description,
          nameEn: r.nameEn,
          subtitleEn: r.subtitleEn,
          descriptionEn: r.descriptionEn,
          image: r.image,
          badge: r.badge,
          featured: r.featured,
          stock: r.stock,
        }));
      }
    }
  } catch (e) {
    console.error(
      "[home] database unavailable, using local catalog:",
      e
    );
  }

  // بدون قاعدة بيانات (أو قاعدة فارغة) → الكتالوج المحلي بالصور المحلية
  if (products.length === 0) {
    products = FALLBACK_PRODUCTS;
  }

  return <Storefront products={products} />;
}
