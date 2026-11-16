import { FlowerMark } from "@/components/ui";

const FILES = [
  { name: "logo.png", desc: "اللوقو — الخلفيات الفاتحة" },
  { name: "logo-light.png", desc: "اللوقو — الفوتر الداكن" },
  { name: "hero-a.jpg", desc: "صورة الواجهة الرئيسية" },
  { name: "hero-b.jpg", desc: "الشريط السينمائي" },
  { name: "founder-main.jpg", desc: "صورة هيفاء الرئيسية" },
  { name: "founder-1 → 4.jpg", desc: "البواريد المبعثرة" },
];

export const metadata = { title: "تحميل الصور — هيفاء بيوتي" };

export default function DownloadPage() {
  return (
    <main
      dir="rtl"
      className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 py-16"
    >
      <div className="w-full max-w-lg rounded-[32px] border border-sand bg-linen p-8 text-center shadow-xl shadow-mauve-deep/10 sm:p-10">
        <FlowerMark className="mx-auto h-10 w-11" />
        <h1 className="mt-5 font-display text-3xl font-bold text-ink">
          ملف صور هيفاء بيوتي
        </h1>
        <p className="mt-3 text-sm leading-7 text-ink/55">
          كل صور الموقع في ملف مضغوط واحد (1.3MB) — حمّليه ورفعيه إلى
          المستودع داخل مجلد <span dir="ltr" className="font-mono text-xs">public/</span>
        </p>

        <a
          href="/hayfaa-images.zip"
          download="hayfaa-images.zip"
          className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-ink px-10 py-4 text-base font-bold text-linen shadow-lg shadow-ink/20 transition-all duration-300 hover:bg-mauve-deep hover:shadow-mauve-deep/30 active:scale-95"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden
          >
            <path d="M12 4v12M7 11l5 5 5-5" />
            <path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" />
          </svg>
          تحميل hayfaa-images.zip
          <span className="rounded-full bg-linen/15 px-2.5 py-0.5 text-xs">1.3MB</span>
        </a>

        <div className="mt-8 rounded-2xl border border-sand bg-cream/60 p-5 text-start">
          <p className="text-xs font-bold text-ink/50">محتويات الملف:</p>
          <ul className="mt-3 space-y-2">
            {FILES.map((f) => (
              <li key={f.name} className="flex items-center justify-between gap-3 text-sm">
                <span dir="ltr" className="font-mono text-xs text-mauve-deep">
                  {f.name}
                </span>
                <span className="text-xs text-ink/50">{f.desc}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-[11px] leading-6 text-ink/40">
          بعد التحميل: فكي الملف في جذر المستودع (جنب package.json) ثم
          Commit — وVercel بينشر الصور تلقائياً
        </p>
      </div>
    </main>
  );
}
