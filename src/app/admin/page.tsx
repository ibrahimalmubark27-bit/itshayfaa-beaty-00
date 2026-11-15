"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import {
  BagIcon,
  BrushIcon,
  CheckIcon,
  CloseIcon,
  EditIcon,
  LockIcon,
  Logo,
  PlusIcon,
  TrashIcon,
  UploadIcon,
} from "@/components/ui";

const TOKEN_KEY = "hb-admin-token";
const BADGES = ["", "جديد", "وصل حديثاً", "الأكثر مبيعاً"];

type FormState = {
  name: string;
  nameEn: string;
  subtitle: string;
  subtitleEn: string;
  category: "bags" | "makeup";
  price: string;
  oldPrice: string;
  badge: string;
  featured: boolean;
  stock: string;
  description: string;
  descriptionEn: string;
  image: string;
};

const emptyForm: FormState = {
  name: "",
  nameEn: "",
  subtitle: "",
  subtitleEn: "",
  category: "bags",
  price: "",
  oldPrice: "",
  badge: "",
  featured: false,
  stock: "10",
  description: "",
  descriptionEn: "",
  image: "",
};

/** ضغط صورة الموبايل إلى JPEG (ماкс عرض 1000px) وحفظها Data URL */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 1000;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("canvas error"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("تعذر قراءة الصورة"));
    };
    img.src = url;
  });
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-ink/70">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-ink/15 bg-cream/60 px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink/30 focus:border-mauve";

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [listError, setListError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((m: string) => {
    setToast(m);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2500);
  }, []);

  useEffect(() => {
    try {
      const t = sessionStorage.getItem(TOKEN_KEY);
      if (t) setToken(t);
    } catch {
      /* ignore */
    }
  }, []);

  const api = useCallback(
    async (path: string, opts?: RequestInit) => {
      const res = await fetch(path, {
        ...opts,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setToken(null);
        try {
          sessionStorage.removeItem(TOKEN_KEY);
        } catch {
          /* ignore */
        }
        throw new Error("انتهت الجلسة — ادخلي الـPIN مرة أخرى");
      }
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || `خطأ ${res.status}`);
      }
      return data;
    },
    [token]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const d = await api("/api/admin/products");
      setProducts(d.products as Product[]);
    } catch (e) {
      setListError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const d = (await res.json()) as { ok: boolean; token?: string; error?: string };
      if (!d.ok || !d.token) throw new Error(d.error || "PIN غير صحيح");
      setToken(d.token);
      try {
        sessionStorage.setItem(TOKEN_KEY, d.token);
      } catch {
        /* ignore */
      }
    } catch (e) {
      setAuthError((e as Error).message);
    } finally {
      setAuthBusy(false);
    }
  }

  function logout() {
    setToken(null);
    setProducts([]);
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  }

  function startAdd() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setView("form");
    window.scrollTo({ top: 0 });
  }

  function startEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      nameEn: p.nameEn ?? "",
      subtitle: p.subtitle ?? "",
      subtitleEn: p.subtitleEn ?? "",
      category: p.category,
      price: String(p.price),
      oldPrice: p.oldPrice ? String(p.oldPrice) : "",
      badge: p.badge ?? "",
      featured: p.featured,
      stock: String(p.stock),
      description: p.description ?? "",
      descriptionEn: p.descriptionEn ?? "",
      image: p.image,
    });
    setError("");
    setView("form");
    window.scrollTo({ top: 0 });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      nameEn: form.nameEn.trim(),
      subtitle: form.subtitle.trim() || null,
      subtitleEn: form.subtitleEn.trim() || null,
      category: form.category,
      price: Math.round(Number(form.price) || 0),
      oldPrice: form.oldPrice ? Math.round(Number(form.oldPrice)) : null,
      badge: form.badge || null,
      featured: form.featured,
      stock: Math.max(0, Math.round(Number(form.stock) || 0)),
      description: form.description.trim() || null,
      descriptionEn: form.descriptionEn.trim() || null,
      image: form.image.trim(),
    };
    try {
      if (editing) {
        await api("/api/admin/products", {
          method: "PATCH",
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
        notify("تم تحديث المنتج ✓");
      } else {
        await api("/api/admin/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        notify("تمت إضافة المنتج ✓");
      }
      setView("list");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(p: Product) {
    if (!confirm(`متأكدة من حذف «${p.name}»؟ لا يمكن التراجع.`)) return;
    try {
      await api("/api/admin/products", {
        method: "DELETE",
        body: JSON.stringify({ id: p.id }),
      });
      notify("تم حذف المنتج");
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function toggleFeatured(p: Product) {
    try {
      await api("/api/admin/products", {
        method: "PATCH",
        body: JSON.stringify({
          id: p.id,
          name: p.name,
          nameEn: p.nameEn,
          subtitle: p.subtitle,
          subtitleEn: p.subtitleEn,
          category: p.category,
          price: p.price,
          oldPrice: p.oldPrice,
          badge: p.badge,
          featured: !p.featured,
          stock: p.stock,
          description: p.description,
          descriptionEn: p.descriptionEn,
          image: p.image,
        }),
      });
      await load();
    } catch (e) {
      notify((e as Error).message);
    }
  }

  async function onFile(f?: File | null) {
    if (!f) return;
    try {
      const dataUrl = await fileToDataUrl(f);
      setForm((fm) => ({ ...fm, image: dataUrl }));
      notify("تم رفع الصورة ✓");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  /* ─────────── login gate ─────────── */
  if (!token) {
    return (
      <div className="grain flex min-h-screen flex-col items-center justify-center bg-cream px-5">
        <div className="w-full max-w-sm rounded-3xl border border-sand bg-linen p-8 shadow-xl shadow-mauve-deep/10">
          <div className="flex flex-col items-center text-center">
            <Logo size="md" />
            <span className="mt-6 grid h-12 w-12 place-items-center rounded-full bg-mauve/10 text-mauve">
              <LockIcon className="h-5 w-5" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold text-ink">
              لوحة تحكم هيفاء
            </h1>
            <p className="mt-2 text-sm text-ink/55">
              أدخلي الـPIN للدخول وإدارة المنتجات
            </p>
          </div>
          <form onSubmit={login} className="mt-6 space-y-3">
            <input
              dir="ltr"
              type="password"
              inputMode="numeric"
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className={inputCls}
            />
            {authError && (
              <p className="rounded-xl bg-mauve/10 px-4 py-2.5 text-xs font-bold text-mauve-deep">
                {authError}
              </p>
            )}
            <button
              type="submit"
              disabled={authBusy || !pin}
              className="w-full rounded-full bg-ink py-3.5 text-sm font-bold text-linen transition-colors hover:bg-mauve-deep disabled:opacity-50"
            >
              {authBusy ? "… جاري التحقق" : "دخول"}
            </button>
          </form>
          <a
            href="/"
            className="mt-5 block text-center text-xs font-bold text-ink/45 hover:text-mauve-deep"
          >
            ← الرجوع للموقع
          </a>
        </div>
      </div>
    );
  }

  /* ─────────── admin app ─────────── */
  const bagsCount = products.filter((p) => p.category === "bags").length;
  const makeupCount = products.length - bagsCount;

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-sand/70 bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="hidden rounded-full bg-ink/5 px-3 py-1 text-[11px] font-bold text-ink/50 sm:block">
              لوحة التحكم
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="rounded-full border border-ink/15 px-4 py-2 text-xs font-bold text-ink/60 transition-colors hover:border-ink hover:text-ink"
            >
              عرض الموقع
            </a>
            <button
              onClick={logout}
              className="rounded-full border border-ink/15 px-4 py-2 text-xs font-bold text-ink/60 transition-colors hover:border-mauve hover:text-mauve-deep"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pt-8">
        {/* stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-sand bg-linen p-4">
            <p className="text-2xl font-extrabold tabular-nums text-ink">{products.length}</p>
            <p className="text-xs font-bold text-ink/50">إجمالي المنتجات</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-sand bg-linen p-4">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-mauve/10 text-mauve">
              <BagIcon className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-xl font-extrabold tabular-nums text-ink">{bagsCount}</p>
              <p className="text-xs font-bold text-ink/50">شنط</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-sand bg-linen p-4">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-sage/15 text-sage-deep">
              <BrushIcon className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-xl font-extrabold tabular-nums text-ink">{makeupCount}</p>
              <p className="text-xs font-bold text-ink/50">مكياج</p>
            </div>
          </div>
        </div>

        {/* ─── form view ─── */}
        {view === "form" ? (
          <form
            onSubmit={save}
            className="mt-6 rounded-3xl border border-sand bg-linen p-6 sm:p-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-ink">
                {editing ? "تعديل منتج" : "إضافة منتج جديد"}
              </h2>
              <button
                type="button"
                onClick={() => setView("list")}
                className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-xs font-bold text-ink/60 hover:border-ink hover:text-ink"
              >
                <CloseIcon className="h-3.5 w-3.5" />
                رجوع
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <L label="الاسم (عربي) *">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="شنطة ليان"
                  className={inputCls}
                />
              </L>
              <L label="Name (English) *">
                <input
                  dir="ltr"
                  required
                  value={form.nameEn}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                  placeholder="Lian Tote"
                  className={`${inputCls} text-left`}
                />
              </L>
              <L label="وصف قصير (عربي)">
                <input
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="توت يومي من الجلد الطبيعي"
                  className={inputCls}
                />
              </L>
              <L label="Short subtitle (English)">
                <input
                  dir="ltr"
                  value={form.subtitleEn}
                  onChange={(e) => setForm({ ...form, subtitleEn: e.target.value })}
                  placeholder="Everyday tote in natural leather"
                  className={`${inputCls} text-left`}
                />
              </L>
              <L label="القسم *">
                <div className="grid grid-cols-2 gap-2">
                  {(["bags", "makeup"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, category: c })}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition-all ${
                        form.category === c
                          ? "border-ink bg-ink text-linen"
                          : "border-ink/15 text-ink/60 hover:border-mauve"
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
              </L>
              <L label="الشارة">
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
              </L>
              <L label="السعر (ر.ق) *">
                <input
                  dir="ltr"
                  required
                  inputMode="numeric"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="320"
                  className={`${inputCls} text-left`}
                />
              </L>
              <L label="السعر قبل الخصم (اختياري)">
                <input
                  dir="ltr"
                  inputMode="numeric"
                  value={form.oldPrice}
                  onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                  placeholder="400"
                  className={`${inputCls} text-left`}
                />
              </L>
              <L label="الكمية في المخزون">
                <input
                  dir="ltr"
                  inputMode="numeric"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className={`${inputCls} text-left`}
                />
              </L>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, featured: !form.featured })}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition-all ${
                    form.featured
                      ? "border-sage-deep bg-sage-soft text-sage-deep"
                      : "border-ink/15 text-ink/50 hover:border-sage"
                  }`}
                >
                  <CheckIcon className="h-4 w-4" />
                  {form.featured ? "مميز في المتجر" : "عادي"}
                </button>
              </div>
              <div className="sm:col-span-2">
                <L label="الوصف (عربي)">
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={`${inputCls} resize-none`}
                  />
                </L>
              </div>
              <div className="sm:col-span-2">
                <L label="Description (English)">
                  <textarea
                    dir="ltr"
                    rows={3}
                    value={form.descriptionEn}
                    onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                    className={`${inputCls} resize-none text-left`}
                  />
                </L>
              </div>

              {/* image */}
              <div className="sm:col-span-2">
                <span className="mb-1.5 block text-xs font-bold text-ink/70">
                  صورة المنتج *
                </span>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex items-center gap-2">
                    <input
                      value={form.image.startsWith("data:") ? "صورة مرفوعة ✓" : form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder="https://… أو ارفعي صورة"
                      dir="ltr"
                      className={`${inputCls} min-w-0 flex-1 text-left`}
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex shrink-0 items-center gap-2 rounded-xl border border-mauve/40 bg-mauve/5 px-4 py-3 text-xs font-bold text-mauve-deep transition-colors hover:bg-mauve hover:text-linen"
                    >
                      <UploadIcon className="h-4 w-4" />
                      ارفعي صورة
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onFile(e.target.files?.[0])}
                    />
                  </div>
                  {form.image && (
                    <img
                      src={form.image}
                      alt="معاينة"
                      className="h-28 w-24 shrink-0 rounded-xl border border-sand object-cover"
                    />
                  )}
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-xl bg-mauve/10 px-4 py-3 text-xs font-bold text-mauve-deep">
                {error}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-full bg-ink py-4 text-sm font-bold text-linen transition-colors hover:bg-mauve-deep disabled:opacity-50"
              >
                {saving
                  ? "… جاري الحفظ"
                  : editing
                    ? "حفظ التعديلات"
                    : "إضافة المنتج"}
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className="rounded-full border border-ink/15 px-6 py-4 text-sm font-bold text-ink/60 hover:border-ink hover:text-ink"
              >
                إلغاء
              </button>
            </div>
          </form>
        ) : (
          /* ─── list view ─── */
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-ink">المنتجات</h2>
              <button
                onClick={startAdd}
                className="flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-linen transition-colors hover:bg-mauve-deep"
              >
                <PlusIcon className="h-4 w-4" />
                منتج جديد
              </button>
            </div>

            {listError && (
              <p className="mt-4 rounded-2xl bg-mauve/10 px-5 py-4 text-sm font-bold text-mauve-deep">
                {listError}
              </p>
            )}

            {loading ? (
              <p className="mt-8 text-center text-sm font-bold text-ink/40">
                … جاري التحميل
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {products.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center gap-4 rounded-2xl border border-sand bg-linen p-3 sm:flex-nowrap"
                  >
                    <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-sand/40">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-ink">{p.name}</p>
                        <span className="shrink-0 rounded-full bg-ink/5 px-2.5 py-0.5 text-[10px] font-bold text-ink/50">
                          {p.category === "bags" ? "شنط" : "مكياج"}
                        </span>
                        {p.badge && (
                          <span className="shrink-0 rounded-full bg-sage/15 px-2.5 py-0.5 text-[10px] font-bold text-sage-deep">
                            {p.badge}
                          </span>
                        )}
                        {p.featured && (
                          <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-bold text-gold">
                            مميز
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-xs text-ink/45" dir="ltr">
                        {p.nameEn}
                      </p>
                      <p className="mt-1 text-sm font-extrabold tabular-nums text-mauve-deep">
                        {p.price} ر.ق
                        {p.oldPrice && (
                          <span className="ms-2 text-xs font-bold text-ink/30 line-through">
                            {p.oldPrice}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => toggleFeatured(p)}
                        title={p.featured ? "إزالة التمييز" : "تمييز في المتجر"}
                        className={`grid h-9 w-9 place-items-center rounded-full border text-xs font-bold transition-colors ${
                          p.featured
                            ? "border-gold bg-gold/15 text-gold"
                            : "border-ink/15 text-ink/40 hover:border-gold hover:text-gold"
                        }`}
                      >
                        ★
                      </button>
                      <button
                        onClick={() => startEdit(p)}
                        aria-label="تعديل"
                        className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 text-ink/50 transition-colors hover:border-mauve hover:text-mauve-deep"
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(p)}
                        aria-label="حذف"
                        className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 text-ink/50 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
                {products.length === 0 && !listError && (
                  <p className="mt-8 text-center text-sm font-bold text-ink/40">
                    لا توجد منتجات بعد — أضيفي أول منتج
                  </p>
                )}
              </ul>
            )}
          </div>
        )}
      </main>

      {toast && (
        <div className="toast-pop fixed bottom-6 left-1/2 z-50 flex items-center gap-2.5 rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-linen shadow-2xl">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-sage text-linen">
            <CheckIcon className="h-3 w-3" />
          </span>
          {toast}
        </div>
      )}
    </div>
  );
}
