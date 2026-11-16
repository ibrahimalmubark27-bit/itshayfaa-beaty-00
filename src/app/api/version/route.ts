import { isDbConfigured } from "@/db";

export const dynamic = "force-dynamic";

/** نقطة تشخيص — تبيّن أي نسخة شغالة على الموقع */
export async function GET() {
  return Response.json({
    app: "its-hayfaa-beauty",
    build: "v3-products-fallback",
    productsFallback: true,
    dbConfigured: isDbConfigured(),
    time: new Date().toISOString(),
  });
}
