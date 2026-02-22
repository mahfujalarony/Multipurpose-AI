"use client";

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

/* ─────────────── DATA ─────────────── */
const plans = [
  {
    id: "free",
    name: "Starter",
    badge: null,
    desc: "Perfect for individuals exploring AI tools.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: "Get started free",
    ctaStyle: "outline",
    color: "zinc",
    features: [
      { text: "50 AI generations / month", included: true },
      { text: "Email Genius (basic)", included: true },
      { text: "Content Pro (basic)", included: true },
      { text: "Vision AI — 5 images / month", included: true },
      { text: "Dev Toolkit", included: false },
      { text: "Custom tone & style", included: false },
      { text: "API access", included: false },
      { text: "Priority support", included: false },
      { text: "Team workspace", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Most Popular",
    desc: "For creators and freelancers who ship daily.",
    monthlyPrice: 19,
    yearlyPrice: 15,
    cta: "Start Pro free trial",
    ctaStyle: "gradient",
    color: "indigo",
    features: [
      { text: "2,000 AI generations / month", included: true },
      { text: "Email Genius (full)", included: true },
      { text: "Content Pro (full + SEO)", included: true },
      { text: "Vision AI — 200 images / month", included: true },
      { text: "Dev Toolkit (full)", included: true },
      { text: "Custom tone & style", included: true },
      { text: "API access", included: false },
      { text: "Priority support", included: false },
      { text: "Team workspace", included: false },
    ],
  },
  {
    id: "team",
    name: "Team",
    badge: "Best Value",
    desc: "For growing teams that need more power.",
    monthlyPrice: 49,
    yearlyPrice: 39,
    cta: "Start Team trial",
    ctaStyle: "gradient",
    color: "violet",
    features: [
      { text: "10,000 AI generations / month", included: true },
      { text: "Email Genius (full)", included: true },
      { text: "Content Pro (full + SEO)", included: true },
      { text: "Vision AI — unlimited", included: true },
      { text: "Dev Toolkit (full)", included: true },
      { text: "Custom tone & style", included: true },
      { text: "API access (10k calls)", included: true },
      { text: "Priority support", included: true },
      { text: "Team workspace (up to 10)", included: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    badge: null,
    desc: "Custom power for large organizations.",
    monthlyPrice: null,
    yearlyPrice: null,
    cta: "Contact sales",
    ctaStyle: "dark",
    color: "zinc",
    features: [
      { text: "Unlimited AI generations", included: true },
      { text: "All Pro tools included", included: true },
      { text: "Custom AI model fine-tuning", included: true },
      { text: "Vision AI — unlimited", included: true },
      { text: "Dev Toolkit (full)", included: true },
      { text: "Advanced analytics dashboard", included: true },
      { text: "Unlimited API access", included: true },
      { text: "Dedicated support manager", included: true },
      { text: "Unlimited team members", included: true },
    ],
  },
];

const faqs = [
  {
    q: "Can I switch plans anytime?",
    a: "Yes. You can upgrade or downgrade at any time. Changes take effect immediately and we'll prorate any billing differences.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "Absolutely. Pro and Team plans come with a 14-day free trial — no credit card required.",
  },
  {
    q: "What counts as a 'generation'?",
    a: "Each AI output — whether an email draft, blog intro, image, or code snippet — counts as one generation.",
  },
  {
    q: "Do unused generations roll over?",
    a: "No. Generations reset at the start of each billing cycle. Enterprise plans can negotiate custom rollover terms.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards, PayPal, and bank transfers for Enterprise. All payments are secured by Stripe.",
  },
  {
    q: "Do you offer discounts for nonprofits or students?",
    a: "Yes — we offer 50% off for verified nonprofits and students. Contact support with proof of eligibility.",
  },
];

const logos = ["Vercel", "Linear", "Notion", "Loom", "Pitch", "Raycast"];

/* ─────────────── COMPONENT ─────────────── */
export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [dark, setDark] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { data: session } = useSession();

  const bg = dark ? "bg-zinc-950" : "bg-white";
  const text = dark ? "text-zinc-50" : "text-zinc-900";
  const muted = dark ? "text-zinc-400" : "text-zinc-500";
  const cardBg = dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100";

  return (
    <>
      <Head>
        <title>Pricing — MultipurposeAI</title>
        <meta name="description" content="Simple, transparent pricing for individuals, teams, and enterprises. Start free, upgrade when ready." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap" rel="stylesheet" />
      </Head>

      <div className={`${bg} ${text} min-h-screen transition-colors duration-300 overflow-x-hidden`} style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`
          .font-display { font-family: 'Syne', sans-serif; }
          .font-mono-custom { font-family: 'DM Mono', monospace; }
          .shimmer-btn {
            background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #4f46e5 100%);
            background-size: 200% 100%;
            animation: shimmer 2.5s infinite;
          }
          .shimmer-btn:hover { animation-duration: 1s; transform: translateY(-2px); }
          @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
          @keyframes fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          .animate-float { animation: float 4s ease-in-out infinite; }
          .fade-up { animation: fade-up 0.5s ease forwards; }
          .card-lift { transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease; }
          .card-lift:hover { transform: translateY(-6px); }
          .toggle-pill { transition: all 0.3s cubic-bezier(.34,1.56,.64,1); }
          .grid-dots {
            background-image: radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px);
            background-size: 28px 28px;
          }
          .popular-glow {
            box-shadow: 0 0 0 2px #6366f1, 0 24px 60px rgba(99,102,241,0.25);
          }
          .team-glow {
            box-shadow: 0 0 0 2px #7c3aed, 0 24px 60px rgba(124,58,237,0.25);
          }
          .faq-answer {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.35s ease, padding 0.25s ease;
          }
          .faq-answer.open {
            max-height: 200px;
          }
          .check-icon { color: #6366f1; }
          .cross-icon { color: #d1d5db; }
        `}</style>

        {/* ── NAVBAR ── */}
        <nav className={`sticky top-0 z-50 border-b ${dark ? "border-zinc-800 bg-zinc-950/90" : "border-zinc-100 bg-white/90"} backdrop-blur-md px-6`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white animate-float">✦</div>
              <span className="font-display text-lg font-extrabold tracking-tight">
                Multipurpose<span className="text-indigo-600">AI</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/#features" className={`text-sm font-medium ${muted} hover:text-indigo-600 transition-colors`}>
                Features
              </Link>
              <Link href="/#how-it-works" className={`text-sm font-medium ${muted} hover:text-indigo-600 transition-colors`}>
                How it works
              </Link>
              <Link href="/pricing" className="text-sm font-semibold text-indigo-600">
                Pricing
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDark(d => !d)}
                className={`w-9 h-9 rounded-lg border ${dark ? "border-zinc-700 bg-zinc-800" : "border-zinc-200 bg-zinc-50"} flex items-center justify-center text-base transition-colors hover:border-indigo-400`}
              >
                {dark ? "☀️" : "🌙"}
              </button>
              {session ? (
                <button
                  onClick={() => signOut()}
                  className={`text-sm font-semibold px-4 py-2 rounded-lg border transition-colors ${
                    dark
                      ? "border-zinc-700 text-zinc-200 hover:border-red-400 hover:text-red-400"
                      : "border-zinc-200 text-zinc-700 hover:border-red-400 hover:text-red-600"
                  }`}
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => signIn("google")}
                  className={`text-sm font-semibold px-4 py-2 rounded-lg border transition-colors ${
                    dark
                      ? "border-zinc-700 text-zinc-200 hover:border-indigo-400 hover:text-indigo-300"
                      : "border-zinc-200 text-zinc-700 hover:border-indigo-400 hover:text-indigo-600"
                  }`}
                >
                  Log in
                </button>
              )}
              <button className="text-sm font-semibold text-white shimmer-btn px-5 py-2 rounded-lg">
                Start Free →
              </button>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="grid-dots relative text-center px-6 pt-20 pb-16 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="fade-up max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse inline-block" />
              Simple, transparent pricing
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-none mb-5">
              Pay for what<br />
              <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
                you actually use.
              </span>
            </h1>
            <p className={`text-lg ${muted} max-w-xl mx-auto mb-10 leading-relaxed`}>
              Start free. Upgrade when you&apos;re ready. Cancel anytime — no questions asked.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-4 mb-2">
              <span className={`text-sm font-semibold ${!yearly ? "text-indigo-600" : muted}`}>Monthly</span>
              <button
                onClick={() => setYearly(y => !y)}
                aria-pressed={yearly}
                aria-label="Toggle yearly billing"
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${yearly ? "bg-indigo-600" : dark ? "bg-zinc-700" : "bg-zinc-200"}`}
              >
                <span className={`toggle-pill absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md ${yearly ? "translate-x-7" : "translate-x-0"}`} />
              </button>
              <span className={`text-sm font-semibold ${yearly ? "text-indigo-600" : muted}`}>
                Yearly
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                Save up to 20%
              </span>
            </div>
          </div>
        </section>

        {/* ── PRICING CARDS ── */}
        <section aria-label="Pricing plans" className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {plans.map((plan, i) => {
              const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
              const safePrice = price ?? 0;
              const isPopular = plan.id === "pro";
              const isTeam = plan.id === "team";
              const isEnterprise = plan.id === "enterprise";

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border p-7 card-lift transition-all duration-300 ${
                    isPopular
                      ? `${dark ? "bg-indigo-950/80" : "bg-indigo-50"} border-indigo-500 popular-glow`
                      : isTeam
                      ? `${dark ? "bg-violet-950/80" : "bg-violet-50"} border-violet-500 team-glow`
                      : cardBg
                  }`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap ${
                      isPopular ? "bg-indigo-600" : "bg-violet-600"
                    }`}>
                      {plan.badge}
                    </div>
                  )}

                  {/* Plan name */}
                  <div className={`text-xs font-bold uppercase tracking-widest mb-3 ${
                    isPopular ? "text-indigo-500" : isTeam ? "text-violet-500" : muted
                  }`}>
                    {plan.name}
                  </div>

                  {/* Price */}
                  <div className="mb-2">
                    {isEnterprise ? (
                      <div className="font-display text-4xl font-extrabold tracking-tight">Custom</div>
                    ) : (
                      <div className="flex items-end gap-1">
                        <span className={`font-mono-custom text-xl font-bold ${muted}`}>$</span>
                        <span className="font-display text-5xl font-extrabold tracking-tighter leading-none">
                          {safePrice}
                        </span>
                        <span className={`text-sm font-medium ${muted} mb-1.5`}>/ mo</span>
                      </div>
                    )}
                    {yearly && !isEnterprise && safePrice > 0 && (
                      <div className="text-xs text-emerald-600 font-semibold mt-1">
                        Billed ${(safePrice * 12)} / year
                      </div>
                    )}
                  </div>

                  <p className={`text-sm ${muted} mb-6 leading-relaxed`}>{plan.desc}</p>

                  {/* CTA Button */}
                  {plan.ctaStyle === "gradient" ? (
                    <button className="shimmer-btn w-full py-3 rounded-xl text-white font-bold text-sm mb-7 transition-all">
                      {plan.cta}
                    </button>
                  ) : plan.ctaStyle === "dark" ? (
                    <button className={`w-full py-3 rounded-xl font-bold text-sm mb-7 transition-all ${
                      dark
                        ? "bg-white text-zinc-900 hover:bg-zinc-100"
                        : "bg-zinc-900 text-white hover:bg-zinc-800"
                    }`}>
                      {plan.cta}
                    </button>
                  ) : (
                    <button className={`w-full py-3 rounded-xl font-bold text-sm mb-7 border-2 transition-all hover:border-indigo-500 hover:text-indigo-600 ${
                      dark ? "border-zinc-700 text-zinc-300" : "border-zinc-200 text-zinc-700"
                    }`}>
                      {plan.cta}
                    </button>
                  )}

                  {/* Divider */}
                  <div className={`h-px mb-5 ${dark ? "bg-zinc-800" : "bg-zinc-100"}`} />

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2.5">
                        <span className={`mt-0.5 text-base flex-shrink-0 ${f.included ? "check-icon" : "cross-icon"}`}>
                          {f.included ? "✓" : "✗"}
                        </span>
                        <span className={`text-sm leading-snug ${f.included ? (dark ? "text-zinc-200" : "text-zinc-700") : muted}`}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── TRUST LOGOS ── */}
        <section className={`border-y ${dark ? "border-zinc-800 bg-zinc-900" : "border-zinc-100 bg-zinc-50"} py-12 px-6`}>
          <div className="max-w-4xl mx-auto text-center">
            <p className={`text-xs font-bold uppercase tracking-widest ${muted} mb-8`}>
              Trusted by teams at
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              {logos.map(logo => (
                <span key={logo} className={`font-display text-xl font-bold ${muted} opacity-60 hover:opacity-100 transition-opacity`}>
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURE COMPARISON TABLE ── */}
        <section className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-12">
            <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-3">Compare</p>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tighter">
              What&apos;s in each plan
            </h2>
          </div>

          <div className={`rounded-2xl border overflow-hidden ${dark ? "border-zinc-800" : "border-zinc-200"}`}>
            {/* Table header */}
            <div className={`grid grid-cols-5 text-sm font-bold ${dark ? "bg-zinc-800" : "bg-zinc-50"}`}>
              <div className="p-4 col-span-1">Feature</div>
              {["Starter", "Pro", "Team", "Enterprise"].map((p, i) => (
                <div key={p} className={`p-4 text-center ${
                  i === 1 ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50" :
                  i === 2 ? "text-violet-600 bg-violet-50 dark:bg-violet-950/50" : ""
                }`}>{p}</div>
              ))}
            </div>

            {[
              { feature: "AI Generations / mo", values: ["50", "2,000", "10,000", "Unlimited"] },
              { feature: "Email Genius", values: ["Basic", "Full", "Full", "Full"] },
              { feature: "Content Pro", values: ["Basic", "Full + SEO", "Full + SEO", "Full + SEO"] },
              { feature: "Vision AI images", values: ["5 / mo", "200 / mo", "Unlimited", "Unlimited"] },
              { feature: "Dev Toolkit", values: ["✗", "✓", "✓", "✓"] },
              { feature: "API access", values: ["✗", "✗", "10k calls", "Unlimited"] },
              { feature: "Team members", values: ["1", "1", "Up to 10", "Unlimited"] },
              { feature: "Priority support", values: ["✗", "✗", "✓", "Dedicated"] },
              { feature: "Custom AI fine-tuning", values: ["✗", "✗", "✗", "✓"] },
            ].map((row, ri) => (
              <div
                key={ri}
                className={`grid grid-cols-5 text-sm border-t ${dark ? "border-zinc-800" : "border-zinc-100"} ${
                  ri % 2 === 0 ? "" : dark ? "bg-zinc-900/50" : "bg-zinc-50/50"
                }`}
              >
                <div className={`p-4 font-medium ${dark ? "text-zinc-300" : "text-zinc-700"}`}>{row.feature}</div>
                {row.values.map((val, vi) => (
                  <div key={vi} className={`p-4 text-center ${
                    vi === 1 ? "bg-indigo-50/50 dark:bg-indigo-950/20" :
                    vi === 2 ? "bg-violet-50/50 dark:bg-violet-950/20" : ""
                  } ${
                    val === "✗" ? muted : val === "✓" ? "text-indigo-600 font-bold" : (dark ? "text-zinc-200" : "text-zinc-700")
                  }`}>
                    {val}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className={`border-t ${dark ? "border-zinc-800 bg-zinc-900" : "border-zinc-100 bg-zinc-50"} py-24 px-6`}>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-3">FAQ</p>
              <h2 className="font-display text-4xl font-extrabold tracking-tighter">
                Got questions?
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border overflow-hidden transition-all ${
                    openFaq === i
                      ? dark ? "border-indigo-500/50 bg-indigo-950/30" : "border-indigo-200 bg-indigo-50/50"
                      : dark ? "border-zinc-700 bg-zinc-800" : "border-zinc-200 bg-white"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                  >
                    <span className="font-semibold text-sm pr-4">{faq.q}</span>
                    <span className={`text-xl transition-transform duration-300 flex-shrink-0 ${openFaq === i ? "rotate-45 text-indigo-600" : muted}`}>
                      +
                    </span>
                  </button>
                  <div className={`faq-answer ${openFaq === i ? "open" : ""}`}>
                    <p className={`px-6 pb-5 text-sm leading-relaxed ${muted}`}>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className={`border-t ${dark ? "border-zinc-800 bg-zinc-950" : "border-zinc-100 bg-white"} px-6 py-10`}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm">✦</div>
              <span className="font-display font-bold text-sm">MultipurposeAI</span>
              <span className={`text-xs ml-1 ${muted}`}>© 2026 · All rights reserved</span>
            </div>
            <nav aria-label="Footer links">
              <ul className="flex gap-6 flex-wrap">
                {["Privacy", "Terms", "Contact", "Blog", "Careers"].map(link => (
                  <li key={link}>
                    <a href="#" className={`text-sm ${muted} hover:text-indigo-600 transition-colors`}>{link}</a>
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
