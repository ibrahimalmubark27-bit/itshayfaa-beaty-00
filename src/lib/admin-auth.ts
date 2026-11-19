import crypto from "crypto";

/**
 * دخول لوحة التحكم — اسم مستخدم وكلمة مرور.
 * الافتراضي: admin / hayfaa2026
 * لتغييرهما على Vercel: اضبطي ADMIN_USER و ADMIN_PASS في Environment Variables.
 */
export const ADMIN_USER = process.env.ADMIN_USER || "admin";
export const ADMIN_PASS = process.env.ADMIN_PASS || "hayfaa2026";

function sha(input: string) {
  return crypto.createHash("sha256").update("hb-admin:" + input).digest("hex");
}

/** توكن بدون حالة — يشتغل على Serverless بدون قاعدة جلسات */
export function adminToken(pass: string = ADMIN_PASS) {
  return sha("token:" + pass);
}

export function isValidAdminToken(token: string | null | undefined) {
  return !!token && token === adminToken();
}

export function isAdmin(req: Request) {
  const h = req.headers.get("authorization") || "";
  return isValidAdminToken(h.replace(/^Bearer\s+/i, ""));
}

export function adminLogin(username: string, password: string) {
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return { ok: true as const, token: adminToken() };
  }
  return { ok: false as const, error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
}
