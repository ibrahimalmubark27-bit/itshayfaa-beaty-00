"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ADMIN_PASS, ADMIN_USER } from "@/lib/admin-auth";
import { formatPrice } from "@/lib/types";
import type { Product } from "@/lib/types";
import {
  CheckIcon,
  CloseIcon,
  EditIcon,
  Logo,
  PlusIcon,
  StarIcon,
  TrashIcon,
  UploadIcon,
  BagIcon,
  BrushIcon,
  CloseIcon as XIcon,
} from "@/components/ui";

const TOKEN_KEY = "hb-admin-token";

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 1000;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("canvas"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("read"));
    };
    img.src = url;
  });
}

type ExtraField = { key: string; value: string };

type FormState = {
  name: string;
  nameEn: string;
  category: "bags" | "makeup";
  price: string;
  oldPrice: string;
  badge: string;
  stock: string;
  featured: boolean;
  subtitle: string;
  subtitleEn: string;
  description: string;
  descriptionEn: string;
  image: string;
  extra: ExtraField[];
};

const emptyForm: FormState = {
  name: "",
  nameEn: "",
  category: "bags",
  price: "",
  oldPrice: "",
  badge: "",
  stock: "10",
  featured: false,
  subtitle: "",
  subtitleEn: "",
  description: "",
  descriptionEn: "",
  image: "",
  extra: [],
};

const BADGES = ["", "جديد", "وصل حديثاُ", "الأكثر مبيعاً"];

const inputCls =
  "w-full rounded-xl border border-ink/15 bg-cream/60 px-4 py-3 text-sm outline-none transition-colors focus:border-mauve placeholder:text-ink/30";

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // login
  const [username, setUsername] = useState(ADMIN_USER);
  const [password, setPassword] = useState(ADMIN_PASS);
  const [loginErr, setLoginErr] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  // product form
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [authed, setAuthed] = useState(false);

  const api = useCallback(
    async (path: string, init?: RequestInit) => {
      const res = await fetch(path, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(init?.headers || {}),
        },
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        [k: string]: unknown;
      };
      if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setAuthed(false);
        throw new Error("انتهت الجلسة");
      }
      return { res, data } as const;
    },
    [token]
  );

  // check saved token on load
  useEffect(() => {
    (async () => {
      const t = localStorage.getItem(TOKEN_KEY);
      if (!t) {
        setChecking(false);
        return;
      }
      try {
        const res = await fetch("/api/admin/products", {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (res.ok) {
          setToken(t);
          setAuthed(true);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      } catch {
        /* offline */
      }
      setChecking(false);
    })();
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setDbError(false);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        products?: Product[];
      };
      if (res.status === 503) setDbError(true);
      else if (res.ok) setProducts(data.products ?? []);
      else setLoadError(data.error || "خطأ في التحميل");
    } catch {
      setLoadError("خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  async function login(e: FormEvent) {
    e.preventDefault();
    setLoginBusy(true);
    setLoginErr("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        token?: string;
        error?: string;
      };
      if (data.ok && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setAuthed(true);
      } else {
        setLoginErr(data.error || "خطأ");
      }
    } catch {
      setLoginErr("خطأ في الاتصال");
    } finally {
      setLoginBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setAuthed(false);
    setProducts([]);
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setSaveErr("");
    setFormOpen(true);
  }

  function openEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name ?? "",
      nameEn: p.nameEn ?? "",
      category: p.category,
      price: String(p.price ?? ""),
      oldPrice: p.oldPrice != null ? String(p.oldPrice) : "",
      badge: p.badge ?? "",
      stock: String(p.stock ?? 0),
      featured: !!p.featured,
      subtitle: p.subtitle ?? "",
      subtitleEn: p.subtitleEn ?? "",
      description: p.description ?? "",
      descriptionEn: p.descriptionEn ?? "",
      image: p.image ?? "",
      extra: Object.entries(p.extra ?? {}).map(([k, v]) => ({
          key: k,
          value: String(v ?? ""),
        })),
    });
    setSaveErr("");
    setFormOpen(true);
  }

  async function onFile(f?: File | null) {
    if (!f) return;
    try {
      const url = await fileToDataUrl(f);
      setForm((f2) => ({ ...f2, image: url }));
    } catch {
      setSaveErr("تعذر قراءة الصورة");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveErr("");
    const payload = {
      ...(editingId ? { id: editingId } : {}),
      name: form.name,
      nameEn: form.nameEn,
      category: form.category,
      price: form.price,
      oldPrice: form.oldPrice || null,
      badge: form.badge || null,
      stock: form.stock,
      featured: form.featured,
      subtitle: form.subtitle || null,
      subtitleEn: form.subtitleEn || null,
      description: form.description || null,
      descriptionEn: form.descriptionEn || null,
      image: form.image || null,
      extra: Object.fromEntries(
        form.extra.filter((f) => f.key.trim()).map((f) => [f.key.trim(), f.value])
      ),
    };
    try {
      const { res, data } = await api("/api/admin/products", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setFormOpen(false);
        load();
      } else {
        setSaveErr(data.error || "خطأ في الحفظ");
      }
    } catch {
      setSaveErr("خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  }

  async function del(id: number) {
    if (!confirm("متأكدة من حذف هذا المنتج؟ لا يمكن التراجع.")) return;
    try {
      const { res } = await api("/api/admin/products", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      if (res.ok) setProducts((p) => p.filter((x) => x.id !== id));
    } catch {
      /* handled in api */
    }
  }

  async function toggleFeatured(p: Product) {
    try {
      const { res } = await api("/api/admin/products", {
        method: "PATCH",
        body: JSON.stringify({ id: p.id, featured: !p.featured }),
      });
      if (res.ok)
        setProducts((ps) =>
          ps.map((x) => (x.id === p.id ? { ...x, featured: !p.featured } : x))
        );
    } catch {
      /* handled in api */
    }
  }

  /* ─────────── login screen ─────────── */
  if (checking) return null;
  if (!authed) {
    return (
      <main className="grid min-h-screen place-items-center bg-cream px-5">
        <div className="w-full max-w-sm rounded-3xl border border-sand bg-linen p-8 shadow-xl shadow-mauve-deep/10">
          <div className="flex justify-center">
            <Logo size="md" />
          </div>
          <h1 className="mt-5 text-center font-display text-2xl font-bold text-ink">
            لوحة التحكم
          </h1>
          <p className="mt-1 text-center text-xs text-ink/50">
            للدخول ادخلي اسم المستخدم وكلمة المرور
          </p>
          <form onSubmit={login} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink/70">
                اسم المستخدم
              </label>
              <input
                dir="ltr"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputCls}
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink/70">
                كلمة المرور
              </label>
              <input
                dir="ltr"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
              />
            </div>
            {loginErr && (
              <p className="rounded-xl bg-mauve/10 px-4 py-2.5 text-xs font-bold text-mauve-deep">
                  {loginErr}
                </p>
            )}
            <button
              type="submit"
              disabled={loginBusy}
              className="w-full rounded-full bg-ink py-3.5 text-sm font-bold text-linen transition-colors hover:bg-mauve-deep disabled:opacity-60"
            >
              {loginBusy ? "… جاري الدخول" : "دخول"}
            </button>
          </form>
          <a
            href="/"
            className="mt-5 block text-center text-xs font-bold text-ink/50 hover:text-mauve-deep"
          >
            ← العودة إلى الموقع
          </a>
        </div>
      </main>
    );
  }

  /* ─────────── dashboard ─────────── */
  return (
    <main className="min-h-screen bg-cream pb-24">
      <header className="sticky top-0 z-40 border-b border-sand bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="hidden rounded-full bg-ink/5 px-3 py-1 text-[11px] font-bold text-ink/60 sm:block">
              لوحة التحكم
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openAdd}
              className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs font-bold text-linen transition-colors hover:bg-mauve-deep"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              منتج جديد
            </button>
            <button
              onClick={logout}
              className="rounded-full border border-ink/15 px-4 py-2.5 text-xs font-bold text-ink/60 transition-colors hover:border-mauve hover:text-mauve-deep"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pt-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold text-ink">
            المنتجات{" "}
            <span className="text-lg text-ink/40">({products.length})</span>
          </h1>
        </div>

        {loading && (
          <p className="mt-8 text-center text-sm font-bold text-ink/40">
            … جاري التحميل
          </p>
        )}

        {dbError && (
          <div className="mt-8 rounded-3xl border border-mauve/30 bg-mauve/5 p-8 text-center">
            <p className="font-display text-xl font-bold text-mauve-deep">
              قاعدة البيانات غير متصلة
            </p>
            <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-ink/55">
              اضبطي متغير <span dir="ltr">DATABASE_URL</span> في Vercel
              (Environment Variables) من قاعدة Neon المجانية، ثم إعادة النشر.
            </p>
          </div>
        )}

        {loadError && !dbError && (
          <div className="mt-8 rounded-3xl border border-mauve/30 bg-mauve/5 p-8 text-center">
          <p className="font-display text-xl font-bold text-mauve-deep">
              {loadError}
            </p>
          </div>
        )}

        {!loading && !dbError && !loadError && products.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-sand bg-linen p-10 text-center">
            <p className="font-display text-xl font-bold text-ink">
              لا توجد منتجات بعد
            </p>
            <button
              onClick={openAdd}
              className="mt-4 rounded-full bg-ink px-6 py-3 text-sm font-bold text-linen hover:bg-mauve-deep"
            >
              + إضافة أول منتج
            </button>
          </div>
        )}

        <div className="mt-6 space-y-2.5">
          {!loading &&
            products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-2xl border border-sand bg-linen p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-14 w-12 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">
                    {p.name}
                    {p.featured && (
                      <span className="ms-2 inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
                        <StarIcon className="h-3 w-3" /> مميز
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink/50">
                    {p.category === "bags" ? "شنط" : "مكياج"}
                    {p.badge ? ` · ${p.badge}` : ""} · مخزون {p.stock}
                  </p>
                </div>
                <span className="shrink-0 font-display font-bold text-mauve-deep">
                  {formatPrice(p.price)} <span className="text-[10px]">ر.س</span>
                </span>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => toggleFeatured(p)}
                    title="مميز في الواجهة"
                    className={`grid h-9 w-9 place-items-center rounded-full border transition-colors ${
                        p.featured
                          ? "border-gold bg-gold/15 text-gold"
                          : "border-ink/15 text-ink/40 hover:border-gold hover:text-gold"
                      }`}
                  >
                    <StarIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEdit(p)}
                    title="تعديل"
                    className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 text-ink/50 transition-colors hover:border-mauve hover:text-mauve-deep"
                  >
                    <EditIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => del(p.id)}
                    title="حذف"
                    className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 text-ink/50 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </main>

      {/* ─────────── product form modal ─────────── */}
      {formOpen && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <div
            className="fade-in absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setFormOpen(false)}
          />
          <form
            onSubmit={save}
            className="modal-in relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-linen p-6 sm:max-w-2xl sm:rounded-3xl sm:p-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-ink">
                {editingId ? "تعديل المنتج" : "منتج جديد"}
              </h2>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 text-ink/60 hover:text-mauve-deep"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink/70">
                    الاسم (عربي) *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink/70">
                    Name (English)
                  </label>
                  <input
                    dir="ltr"
                    value={form.nameEn}
                    onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink/70">
                    القسم *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["bags", "makeup"] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm({ ...form, category: c })}
                        className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold transition-all ${
                          form.category === c
                            ? "border-ink bg-ink text-linen"
                            : "border-ink/15 text-ink/60"
                        }`}
                      >
                        {c === "bags" ? (
                          <BagIcon className="h-4 w-4" />
                        ) : (
                          <BrushIcon className="h-4 w-4" />
                        )}
                        {c === "bags" ? "شنط" : "مكياج"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink/70">
                    الشارة
                  </label>
                  <select
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className={inputCls}
                  >
                    {BADGES.map((b) => (
                      <option key={b} value={b}>
                        {b || "بدون شارة"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink/70">
                    السعر (ر.س) *
                  </label>
                  <input
                    dir="ltr"
                    required
                    inputMode="numeric"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink/70">
                    السعر قبل الخصم
                  </label>
                  <input
                    dir="ltr"
                    inputMode="numeric"
                    value={form.oldPrice}
                    onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink/70">
                    الكمية
                  </label>
                  <input
                    dir="ltr"
                    inputMode="numeric"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink/70">
                    وصف قصير (عربي)
                  </label>
                  <input
                    value={form.subtitle}
                    onChange={(e) =>
                      setForm({ ...form, subtitle: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink/70">
                      Short subtitle (EN)
                  </label>
                  <input
                    dir="ltr"
                    value={form.subtitleEn}
                    onChange={(e) =>
                      setForm({ ...form, subtitleEn: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink/70">
                  الوصف الكامل (عربي)
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink/70">
                  Full description (EN)
                </label>
                <textarea
                  dir="ltr"
                  rows={3}
                  value={form.descriptionEn}
                  onChange={(e) =>
                    setForm({ ...form, descriptionEn: e.target.value })
                  }
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* image */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink/70">
                  الصورة *
                </label>
                <div className="flex gap-3">
                  {form.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.image}
                      alt="معاينة"
                      className="h-24 w-20 shrink-0 rounded-xl border border-sand object-cover"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      dir="ltr"
                      value={form.image.startsWith("data:") ? "" : form.image}
                      onChange={(e) =>
                        setForm({ ...form, image: e.target.value })
                      }
                      placeholder="https://… رابط الصورة"
                      className={inputCls}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-2 rounded-xl border border-mauve/40 bg-mauve/5 px-4 py-2.5 text-xs font-bold text-mauve-deep hover:bg-mauve hover:text-linen"
                      >
                        <UploadIcon className="h-4 w-4" />
                        رفع صورة من الجهاز
                      </button>
                      {form.image.startsWith("data:") && (
                        <span className="text-[11px] font-bold text-mauve-deep">
                          ✓ صورة مرفوعة
                        </span>
                      )}
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => onFile(e.target.files?.[0])}
                    />
                  </div>
                </div>
              </div>

              {/* custom extra fields */}
              <div className="rounded-2xl border border-sand bg-cream/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink/70">
                    حقول إضافية (تظهر مع المنتج في الموقع)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                    setForm((f) => ({
                        ...f,
                        extra: [...f.extra, { key: "", value: "" }],
                      }))
                  }
                    className="flex items-center gap-1 rounded-full bg-ink px-3.5 py-1.5 text-[11px] font-bold text-linen hover:bg-mauve-deep"
                  >
                    <PlusIcon className="h-3 w-3" />
                    إضافة حقل
                  </button>
                </div>
                {form.extra.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {form.extra.map((f, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={f.key}
                          onChange={(e) =>
                            setForm((f2) => ({
                              ...f2,
                              extra: f2.extra.map((x, j) =>
                                j === i ? { ...x, key: e.target.value } : x
                              ),
                            }))
                          }
                          placeholder="اسم الحقل (مثال: المقاس)"
                          className={`${inputCls} flex-1`}
                        />
                        <input
                          value={f.value}
                          onChange={(e) =>
                            setForm((f2) => ({
                              ...f2,
                              extra: f2.extra.map((x, j) =>
                                j === i ? { ...x, value: e.target.value } : x
                              ),
                            }))
                          }
                          placeholder="القيمة (مثال: 36-41)"
                          className={`${inputCls} flex-1`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f2) => ({
                              ...f2,
                              extra: f2.extra.filter((_, j) => j !== i),
                            }))
                          }
                          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-ink/15 text-ink/50 hover:border-red-400 hover:text-red-500"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-sand bg-cream/50 px-4 py-3">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm({ ...form, featured: e.target.checked })
                }
                className="h-4 w-4 accent-[#96605b]"
              />
              <span className="text-xs font-bold text-ink/70">
                مميز — يظهر في الواجهة (نجم)
              </span>
            </label>

              {saveErr && (
                <p className="rounded-xl bg-mauve/10 px-4 py-2.5 text-xs font-bold text-mauve-deep">
                  {saveErr}
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-full bg-ink py-4 text-sm font-bold text-linen transition-colors hover:bg-mauve-deep disabled:opacity-60"
              >
                {saving
                  ? "… جاري الحفظ"
                  : editingId
                    ? "حفظ التعديلات"
                    : "إضافة المنتج"}
              </button>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-full border border-ink/15 px-6 py-4 text-sm font-bold text-ink/60 hover:border-ink hover:text-ink"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
