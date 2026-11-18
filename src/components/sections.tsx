"use client";

import { useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { useI18n } from "@/lib/i18n";
import {
  Accent,
  ArrowIcon,
  CheckIcon,
  ExchangeIcon,
  FlowerMark,
  GiftIcon,
  InstagramIcon,
  Logo,
  Reveal,
  SectionHeading,
  ShieldIcon,
  SparkleIcon,
  StarIcon,
  StitchDivider,
  TiktokIcon,
  TruckIcon,
  WhatsappIcon,
} from "./ui";

/* ============================= HERO (text only — clean) ============================= */

export function Hero() {
  const t = useI18n();
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(52rem 30rem at 85% 0%, rgba(227,201,194,.4), transparent 60%), radial-gradient(40rem 26rem at 8% 90%, rgba(230,233,224,.5), transparent 60%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-28">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 text-mauve">
            <span className="h-px w-10 bg-mauve/40" />
            <p className="text-[11px] font-bold tracking-[0.35em]">{t.hero.eyebrow}</p>
          </div>

          <h1 className="mt-8 font-display text-6xl font-bold leading-[1.25] text-ink sm:text-7xl sm:leading-[1.2]">
            <span className="mask-line">
              <span style={{ "--line-delay": "120ms" } as CSSProperties}>
                {t.hero.h1a}
              </span>
            </span>
            <span className="mask-line">
              <span style={{ "--line-delay": "340ms" } as CSSProperties}>
                {t.hero.h1b} <Accent>{t.hero.h1accent}</Accent>
              </span>
            </span>
          </h1>

          {t.hero.desc && (
            <p className="mt-7 max-w-md text-base leading-8 text-ink/55">{t.hero.desc}</p>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-7">
            <a
              href="#bags"
              className="group inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-sm font-bold text-linen transition-colors duration-300 hover:bg-mauve-deep"
            >
              {t.hero.cta1}
              <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1.5" />
            </a>
            <a
              href="#makeup"
              className="text-sm font-bold text-ink/60 transition-colors hover:text-mauve-deep"
            >
              {t.hero.cta2}
            </a>
          </div>
        </div>

        {/* ---------- Hayfaa portrait (the face of the site) ---------- */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative mx-auto w-[88%] sm:w-[78%]">
            <div className="arch-soft relative overflow-hidden shadow-[0_45px_90px_-45px_rgba(122,82,76,0.55)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/founder/hero-bag.jpg"
                alt="هيفاء بيوتي"
                className="aspect-[3/4] w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-mauve-deep/15 via-transparent to-transparent" />
            </div>
            <FlowerMark className="absolute -right-4 -top-6 h-12 w-14" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================= TRUST STRIP ============================= */

const TRUST_ICONS = [TruckIcon, ShieldIcon, ExchangeIcon, GiftIcon];

export function TrustStrip() {
  const t = useI18n();
  return (
    <section className="border-y border-sand/50 bg-linen/60">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-5 py-6 sm:px-8">
        {t.trust.map((label, i) => {
          const Icon = TRUST_ICONS[i];
          return (
            <Reveal key={label} delay={i * 80}>
              <span className="flex items-center gap-2.5 text-[13px] font-bold text-ink/55">
                <Icon
                  className={`h-4.5 w-4.5 ${i % 2 === 0 ? "text-mauve" : "text-sage-deep"}`}
                />
                {label}
              </span>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ============================= MANIFESTO ============================= */

export function Manifesto() {
  const t = useI18n();
  const links = [
    { label: t.nav.bags, href: "#bags" },
    { label: t.nav.makeup, href: "#makeup" },
  ];
  return (
    <section className="relative py-20 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-5 text-center sm:px-8">
        <Reveal>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/founder/artist-hayfaa.jpg"
            alt="هيفاء"
            className="mx-auto h-24 w-24 rounded-full object-cover object-top shadow-lg ring-4 ring-linen"
          />
          <p className="mt-5 text-[11px] font-bold tracking-[0.35em] text-mauve">
            {t.manifesto.eyebrow}
          </p>
          <h2 className="mt-5 font-display text-4xl font-bold leading-[1.4] text-ink sm:text-5xl sm:leading-[1.35]">
            {t.manifesto.lead} <Accent>{t.manifesto.accent}</Accent>…
            <br />
            {t.manifesto.lead2} <Accent>{t.manifesto.accent2}</Accent>
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full border border-ink/15 px-6 py-3 text-sm font-bold text-ink/65 transition-colors hover:border-ink hover:bg-ink hover:text-linen"
              >
                {l.label}
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================= FOUNDER (simple) ============================= */

export function Founder() {
  const t = useI18n();
  return (
    <section id="story" className="relative scroll-mt-24 bg-cream-deep/50 py-20 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-5 text-center sm:px-8">
        <Reveal>
          <div className="arch-soft w-44 overflow-hidden shadow-2xl shadow-mauve-deep/15 sm:w-52">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/founder/hero-hayfaa.jpg"
              alt={t.founder.name}
              className="aspect-[3/4] w-full object-cover object-top"
            />
          </div>
        </Reveal>
        <Reveal delay={120}>
          <p className="text-[11px] font-bold tracking-[0.3em] text-mauve">
            {t.founder.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-ink sm:text-5xl">
            {t.founder.name}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink/55">
            {t.founder.desc}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================= PROCESS (short) ============================= */

const STEP_ICONS = [WhatsappIcon, GiftIcon, TruckIcon, ShieldIcon];

export function ProcessStrip() {
  const t = useI18n();
  return (
    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            center
            eyebrow={t.process.eyebrow}
            lead={t.process.lead}
            accent={t.process.accent}
          />
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {t.process.steps.map((s, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <Reveal key={s.t} delay={i * 100}>
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="grid h-12 w-12 place-items-center rounded-full border border-dashed border-mauve/40 text-mauve-deep">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display text-lg font-bold text-ink">{s.t}</p>
                    <p className="mt-1 text-xs text-ink/50">{s.s}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================= TESTIMONIALS ============================= */

export function Testimonials() {
  const t = useI18n();
  return (
    <section id="reviews" className="relative py-20 lg:py-24">
      <StitchDivider className="mb-14" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            center
            eyebrow={t.reviews.eyebrow}
            lead={t.reviews.lead}
            accent={t.reviews.accent}
          />
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3 lg:gap-8">
          {t.reviews.items.map((r, i) => (
            <Reveal
              key={r.name}
              delay={i * 140}
              className={i === 1 ? "md:translate-y-8" : ""}
            >
              <figure
                className={`relative h-full rounded-3xl border bg-linen p-7 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-mauve-deep/10 ${
                  i === 1 ? "border-sage/50" : "border-sand/80"
                }`}
              >
                <FlowerMark className="absolute -top-4 right-6 h-9 w-10" />
                <div className="flex items-center gap-1 text-gold">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <StarIcon key={j} className="h-4 w-4" />
                  ))}
                </div>
                <blockquote className="mt-4 font-display text-lg leading-9 text-ink/75">
                  {r.text}
                </blockquote>
                <figcaption className="mt-6 flex items-center justify-between border-t border-sand/70 pt-4">
                  <div>
                    <p className="text-sm font-bold text-ink">{r.name}</p>
                    <p className="text-xs text-ink/45">{r.city}</p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-mauve/10 px-3 py-1 text-[11px] font-bold text-mauve-deep">
                    <CheckIcon className="h-3 w-3" />
                    {t.reviews.verified}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================= SESSION STRIP (all Hayfaa photos) ============================= */

const SESSION_PHOTOS = [
  "/images/founder/session-1.jpg",
  "/images/founder/session-2.jpg",
  "/images/founder/session-3.jpg",
  "/images/founder/session-4.jpg",
  "/images/founder/session-5.jpg",
];

export function SessionStrip() {
  const t = useI18n();
  return (
    <section className="py-14 lg:py-16">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <Reveal>
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-16 bg-sand" />
            <p className="text-[11px] font-bold tracking-[0.35em] text-mauve">
              {t.session}
            </p>
            <span className="h-px w-16 bg-sand" />
          </div>
        </Reveal>
        <div className="mt-10 flex flex-wrap items-start justify-center gap-4 sm:gap-5">
          {SESSION_PHOTOS.map((src, i) => (
            <Reveal key={src} delay={i * 90}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={t.session}
                loading="lazy"
                className={`h-32 w-32 rounded-2xl object-cover object-top shadow-md ring-2 ring-linen transition-transform duration-500 hover:-rotate-1 hover:scale-105 sm:h-36 sm:w-36 ${
                  i % 2 === 1 ? "sm:translate-y-5" : ""
                }`}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================= NEWSLETTER (short) ============================= */

export function Newsletter() {
  const t = useI18n();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="px-5 pb-20 sm:px-8 lg:pb-28">
      <Reveal className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[36px] bg-ink px-6 py-14 text-center sm:px-12 lg:py-16">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(34rem 20rem at 12% 0%, rgba(138,147,130,.22), transparent 60%), radial-gradient(30rem 18rem at 92% 100%, rgba(161,115,108,.18), transparent 60%)",
            }}
          />
          <div className="relative">
            <div className="mx-auto flex w-fit items-center gap-3">
              <span className="h-px w-10 bg-linen/30" />
              <SparkleIcon className="h-4 w-4 text-blush" />
              <span className="text-[11px] font-bold tracking-[0.3em] text-linen/70">
                {t.newsletter.eyebrow}
              </span>
              <span className="h-px w-10 bg-linen/30" />
            </div>
            <h2 className="mt-5 font-display text-4xl font-bold text-linen sm:text-5xl">
              {t.newsletter.titleA} <Accent className="text-blush">{t.newsletter.accent}</Accent>
              {t.newsletter.titleB && <> {t.newsletter.titleB}</>}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-linen/55">
              {t.newsletter.desc}
            </p>

            {done ? (
              <div className="mx-auto mt-8 w-fit rounded-2xl border border-linen/20 bg-linen/10 px-8 py-4 text-sm font-bold text-linen backdrop-blur-sm">
                {t.newsletter.doneA}{" "}
                <span dir="ltr" className="font-display text-blush">
                  HAYFAA10
                </span>
              </div>
            ) : (
              <form
                className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.trim()) setDone(true);
                }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.newsletter.placeholder}
                  className="w-full flex-1 rounded-full border border-linen/25 bg-linen/10 px-6 py-3.5 text-sm text-linen placeholder:text-linen/40 outline-none transition-colors focus:border-blush"
                />
                <button
                  type="submit"
                  className="rounded-full bg-linen px-8 py-3.5 text-sm font-bold text-ink transition-all duration-300 hover:bg-blush active:scale-95"
                >
                  {t.newsletter.cta}
                </button>
              </form>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ============================= FOOTER ============================= */

type TrackResult = {
  ok: boolean;
  stage?: number;
  error?: string;
};

export function Footer() {
  const t = useI18n();
  const [code, setCode] = useState("");
  const [tr, setTr] = useState<TrackResult | null>(null);
  const [tracing, setTracing] = useState(false);

  async function track(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setTracing(true);
    setTr(null);
    try {
      const res = await fetch(
        `/api/orders/track?code=${encodeURIComponent(code.trim())}`
      );
      const data = (await res.json()) as TrackResult;
      setTr(data);
    } catch {
      setTr({ ok: false, error: t.footer.error });
    } finally {
      setTracing(false);
    }
  }

  return (
    <footer id="contact" className="relative bg-ink text-linen/70">
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo tone="light" size="md" />
          <p className="mt-5 max-w-xs text-sm leading-7 text-linen/55">{t.footer.desc}</p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href="https://wa.me/963999000000"
              target="_blank"
              rel="noreferrer"
              aria-label={t.nav.whats}
              className="grid h-10 w-10 place-items-center rounded-full border border-linen/15 text-linen/60 transition-all hover:border-blush hover:text-blush"
            >
              <WhatsappIcon className="h-4.5 w-4.5" />
            </a>
            <a
              href="https://instagram.com/hayfaa.beauty"
              target="_blank"
              rel="noreferrer"
              aria-label={t.nav.insta}
              className="grid h-10 w-10 place-items-center rounded-full border border-linen/15 text-linen/60 transition-all hover:border-blush hover:text-blush"
            >
              <InstagramIcon className="h-4.5 w-4.5" />
            </a>
            <a
              href="#"
              aria-label={t.nav.tiktok}
              className="grid h-10 w-10 place-items-center rounded-full border border-linen/15 text-linen/60 transition-all hover:border-blush hover:text-blush"
            >
              <TiktokIcon className="h-4.5 w-4.5" />
            </a>
          </div>

          <div className="mt-8 rounded-2xl border border-linen/15 bg-linen/5 p-4">
            <p className="text-xs font-bold text-linen/70">{t.footer.track}</p>
            <form onSubmit={track} className="mt-3 flex gap-2">
              <input
                dir="ltr"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="HB-XXXX"
                className="w-full min-w-0 flex-1 rounded-full border border-linen/20 bg-linen/10 px-4 py-2.5 text-sm text-linen placeholder:text-linen/35 outline-none transition-colors focus:border-blush"
              />
              <button
                type="submit"
                disabled={tracing}
                className="rounded-full bg-linen px-5 py-2.5 text-sm font-bold text-ink transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
              >
                {tracing ? "…" : t.footer.trackBtn}
              </button>
            </form>
            {tr &&
              (tr.ok ? (
                <div className="mt-4 space-y-2.5">
                  {t.footer.trackStages.map((st, i) => (
                    <div
                      key={st}
                      className={`flex items-center gap-3 text-xs ${
                        i <= (tr.stage ?? 0) ? "text-linen" : "text-linen/35"
                      }`}
                    >
                      <span
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                          i <= (tr.stage ?? 0) ? "bg-sage text-linen" : "border border-linen/25"
                        }`}
                      >
                        {i <= (tr.stage ?? 0) ? (
                          <CheckIcon className="h-3 w-3" />
                        ) : (
                          i + 1
                        )}
                      </span>
                      <span className="shrink-0 font-bold">{st}</span>
                      <span className="hidden truncate text-linen/45 sm:inline">
                        — {t.footer.trackSubs[i]}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs font-bold text-blush">{tr.error ?? t.footer.notFound}</p>
              ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold text-linen">{t.footer.sections}</h4>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <a href="#bags" className="transition-colors hover:text-blush">
                {t.nav.bags}
              </a>
            </li>
            <li>
              <a href="#makeup" className="transition-colors hover:text-blush">
                {t.nav.makeup}
              </a>
            </li>
            <li>
              <a href="/admin" className="transition-colors hover:text-blush">
                {t.nav.admin}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold text-linen">{t.footer.contact}</h4>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <WhatsappIcon className="h-4 w-4 shrink-0 text-blush/70" />
              <span dir="ltr">+963 999 000 000</span>
            </li>
            <li className="flex items-center gap-3">
              <InstagramIcon className="h-4 w-4 shrink-0 text-blush/70" />
              <span dir="ltr">@hayfaa.beauty</span>
            </li>

          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold text-linen">{t.footer.shipping}</h4>
          <ul className="mt-5 space-y-3 text-sm text-linen/50">
            {t.footer.shippingItems.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            {t.footer.payments.map((m) => (
              <span
                key={m}
                className="rounded-full border border-linen/15 px-3.5 py-1.5 text-[11px] font-bold text-linen/60"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative border-t border-linen/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-linen/35 sm:flex-row sm:px-8">
          <p>{t.footer.rights}</p>
          <p className="flex items-center gap-2">
            {t.footer.madeA}
            <FlowerMark className="h-4 w-4.5" tone="light" />
            {t.footer.madeB}
          </p>
        </div>
      </div>
    </footer>
  );
}
