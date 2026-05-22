"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import LoginButton from "../LoginButton";
import Link from "next/link";

/* ─────────────────────── DATA ─────────────────────── */
const features = [
  {
    id: "email",
    emoji: "✉️",
    label: "Email Genius",
    accent: "#FF6B6B",
    tabActive: "bg-rose-500 text-white border-rose-500",
    tabIdle: "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
    iconBg: "bg-rose-50 dark:bg-rose-900/20",
    description: "Draft persuasive, context-aware emails for outreach, sales, or support — in seconds.",
  },
  {
    id: "content",
    emoji: "📝",
    label: "Content Pro",
    accent: "#4ECDC4",
    tabActive: "bg-teal-500 text-white border-teal-500",
    tabIdle: "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
    iconBg: "bg-teal-50 dark:bg-teal-900/20",
    description: "Generate SEO-optimized articles, blog posts, and landing copy that ranks and converts.",
  },
  {
    id: "image",
    emoji: "🎨",
    label: "Vision AI",
    accent: "#A78BFA",
    tabActive: "bg-violet-500 text-white border-violet-500",
    tabIdle: "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
    iconBg: "bg-violet-50 dark:bg-violet-900/20",
    description: "Convert plain prompts into professional visuals for ads and social media instantly.",
  },
  {
    id: "code",
    emoji: "⚡",
    label: "Dev Toolkit",
    accent: "#F59E0B",
    tabActive: "bg-amber-500 text-white border-amber-500",
    tabIdle: "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
    iconBg: "bg-amber-50 dark:bg-amber-900/20",
    description: "Accelerate your workflow with AI-assisted code generation, review, and debugging.",
  },
];

const steps = [
  { num: "01", icon: "✍️", title: "Describe your need", desc: "Type a prompt or fill in the tool form." },
  { num: "02", icon: "⚡", title: "Generate with OpenAI", desc: "The workspace sends your request to the connected API route." },
  { num: "03", icon: "🚀", title: "Use the result", desc: "Copy text outputs or save generated images." },
];

/* ─────────────────────── TYPEWRITER ─────────────────────── */
function TypewriterText({ text, speed = 14 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 150);
    return () => clearTimeout(t);
  }, [text]);

  useEffect(() => {
    if (!started || displayed.length >= text.length) return;
    const t = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), speed);
    return () => clearTimeout(t);
  }, [displayed, text, started, speed]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="border-r-2 border-current ml-px animate-pulse" />
      )}
    </span>
  );
}

/* ─────────────────────── MAIN PAGE ─────────────────────── */
export default function LandingPageClient() {
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -80px 0px" },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  /* ── JSON-LD structured data for SEO ── */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MultipurposeAI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "All-in-one AI workspace for email writing, SEO content, image generation, and developer tools.",
    url: "https://multipurposeai.app",
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "5200" },
  };

  return (
    <>
      {/* ── SEO Meta Tags ── */}
      <Head>
        <title>MultipurposeAI — One AI Workspace. Infinite Possibilities.</title>
        <meta
          name="description"
          content="Write emails that get replies, generate SEO content that ranks, create visuals that stop the scroll, and ship code faster — all from one AI workspace."
        />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://multipurposeai.app" />

        {/* Open Graph */}
        <meta property="og:title" content="MultipurposeAI — One AI Workspace. Infinite Possibilities." />
        <meta property="og:description" content="Email writing, SEO content, image generation & developer tools — all in one powerful AI workspace." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://multipurposeai.app" />
        <meta property="og:image" content="https://multipurposeai.app/og-image.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MultipurposeAI — One AI Workspace" />
        <meta name="twitter:description" content="Write, create, and ship faster with AI." />
        <meta name="twitter:image" content="https://multipurposeai.app/og-image.png" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      <div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 min-h-screen overflow-x-hidden transition-colors duration-300" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── CUSTOM STYLES ── */}
        <style>{`
          .font-display { font-family: 'Syne', sans-serif; }
          .font-mono-custom { font-family: 'DM Mono', monospace; }
          .shimmer-btn {
            background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #4f46e5 100%);
            background-size: 200% 100%;
            animation: shimmer 2.5s infinite;
          }
          .shimmer-btn:hover { animation-duration: 1s; }
          @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
          @keyframes fade-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
          @keyframes hero-scale { from{opacity:0;transform:translateY(28px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
          .animate-float { animation: float 4s ease-in-out infinite; }
          .fade-up { animation: hero-scale 0.8s cubic-bezier(.22,1,.36,1) forwards; }
          [data-reveal] {
            opacity: 0;
            transform: translateY(34px) scale(.98);
            transition: opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1);
            transition-delay: var(--reveal-delay, 0ms);
          }
          [data-reveal].is-visible {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-float, .fade-up, .shimmer-btn, .spin { animation: none !important; }
            [data-reveal] { opacity: 1; transform: none; transition: none; }
          }
          .grid-dots {
            background-image: radial-gradient(circle, rgba(99,102,241,0.15) 1px, transparent 1px);
            background-size: 32px 32px;
          }
          .card-lift { transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease; }
          .card-lift:hover { transform: translateY(-6px); box-shadow: 0 24px 48px rgba(0,0,0,0.1); }
          .skeleton-bar {
            background: linear-gradient(90deg, #e8e8f0 25%, #d4d4e8 50%, #e8e8f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 6px;
          }
          .dark .skeleton-bar {
            background: linear-gradient(90deg, #1e1e3a 25%, #2a2a4a 50%, #1e1e3a 75%);
            background-size: 200% 100%;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          .spin { animation: spin 0.8s linear infinite; }
        `}</style>

        {/* ═══════════════════ NAVBAR ═══════════════════ */}
        <header
          role="banner"
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled
              ? "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm"
              : "bg-transparent"
          }`}
        >
          <nav aria-label="Main navigation" className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
            {/* Logo */}
            <a href="#top" className="flex items-center gap-2.5" aria-label="MultipurposeAI Home">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-base animate-float">
                ✦
              </div>
              <span className="font-display text-lg font-extrabold tracking-tight">
                Multipurpose<span className="text-indigo-600">AI</span>
              </span>
            </a>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {["Features", "How it works", "Pricing"].map((item) => (
                <a
                  key={item}
                  href={item === "Pricing" ? "/pricing" : `#${item.toLowerCase().replace(/ /g, "-")}`}
                  className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-white transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDark((d) => !d)}
                aria-label="Toggle dark mode"
                className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center text-base hover:border-indigo-400 transition-colors"
              >
                {dark ? "☀️" : "🌙"}
              </button>
              <LoginButton />
              <button className="shimmer-btn text-sm font-semibold text-white px-5 py-2 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30">
                Start Free →
              </button>
            </div>
          </nav>
        </header>

        {/* ═══════════════════ HERO ═══════════════════ */}
        <main id="top">
          <section
            aria-labelledby="hero-heading"
            className="relative grid-dots min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 overflow-hidden"
          >
            {/* Glow orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" aria-hidden="true" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" aria-hidden="true" />
            <div className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" aria-hidden="true" />

            <div className="fade-up max-w-5xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-widest mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Now in Public Beta
              </div>

              {/* H1 — SEO critical */}
              <h1
                id="hero-heading"
                className="font-display text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tighter leading-none mb-6"
              >
                One AI workspace.
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
                  Infinite possibilities.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
                Write emails that get replies. Create content that ranks. Generate visuals that stop the scroll.
                Build code that ships — all from one powerful workspace.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Link href="/dashboard" className="shimmer-btn text-white font-bold text-base px-8 py-4 rounded-xl flex items-center gap-2 shadow-xl shadow-indigo-500/20 hover:-translate-y-1 transition-transform">
                  Open dashboard
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

            </div>
          </section>

          {/* ═══════════════════ FEATURE CARDS ═══════════════════ */}
          <section
            aria-labelledby="capabilities-heading"
            className="max-w-7xl mx-auto px-6 py-16"
          >
            <div data-reveal className="text-center mb-12">
              <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-3">Capabilities</p>
              <h2 id="capabilities-heading" className="font-display text-4xl sm:text-5xl font-extrabold tracking-tighter">
                Built for creators & teams
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((f, index) => (
                <Link
                  key={f.id}
                  href={`/dashboard/${f.id === "image" ? "vision" : f.id}`}
                  data-reveal
                  style={{ "--reveal-delay": `${index * 90}ms` } as React.CSSProperties}
                  className="card-lift rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm"
                >
                  <div className={`w-14 h-14 rounded-2xl ${f.iconBg} flex items-center justify-center text-3xl mb-5`} aria-hidden="true">
                    {f.emoji}
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">{f.label}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-5">{f.description}</p>
                  <span className="text-sm font-semibold text-indigo-600 flex items-center gap-1">
                    Try it now <span aria-hidden="true">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
          <section
            id="how-it-works"
            aria-labelledby="how-heading"
            className="bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-100 dark:border-zinc-800 py-24 px-6"
          >
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-3">Process</p>
              <h2 data-reveal id="how-heading" className="font-display text-4xl sm:text-5xl font-extrabold tracking-tighter mb-14">
                From idea to output in 3 steps
              </h2>

              <div className="grid sm:grid-cols-3 gap-6">
                {steps.map((step, index) => (
                  <div
                    key={step.num}
                    data-reveal
                    style={{ "--reveal-delay": `${index * 100}ms` } as React.CSSProperties}
                    className="relative bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700 p-8 text-left shadow-sm"
                  >
                    <span
                      className="absolute top-4 right-5 font-display text-5xl font-black text-zinc-100 dark:text-zinc-700 select-none"
                      aria-hidden="true"
                    >
                      {step.num}
                    </span>
                    <div className="text-4xl mb-4" aria-hidden="true">{step.icon}</div>
                    <h3 className="font-display text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════════════ CTA ═══════════════════ */}
          <section
            id="pricing"
            aria-labelledby="cta-heading"
            data-reveal
            className="mx-6 mb-20 rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-600 p-16 sm:p-24 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")" }} aria-hidden="true" />

            <h2 id="cta-heading" className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tighter mb-5 relative">
              Ready to 10× your output?
            </h2>
            <p className="text-white/75 text-lg mb-10 max-w-lg mx-auto relative">
              Start using the real OpenAI-powered workspace.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
              <Link href="/dashboard"className="bg-white text-indigo-700 font-bold text-base px-10 py-4 rounded-xl shadow-xl hover:-translate-y-1 transition-transform">
                Get started for free →
              </Link>
              <Link href="/pricing" className="bg-white/15 text-white font-medium text-base px-8 py-4 rounded-xl border border-white/30 backdrop-blur-sm hover:bg-white/25 transition-colors">
                View pricing
              </Link>
            </div>
          </section>
        </main>

        {/* ═══════════════════ FOOTER ═══════════════════ */}
        <footer
          role="contentinfo"
          className="border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-10"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm">✦</div>
              <span className="font-display font-bold text-sm">MultipurposeAI</span>
              <span className="text-zinc-400 text-xs ml-1">© 2026 · All rights reserved</span>
            </div>
            <nav aria-label="Footer navigation">
              <ul className="flex gap-6">
                {["Privacy", "Terms", "Contact", "Blog", "Careers"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </footer>
      </div>
    </>
  );
}

