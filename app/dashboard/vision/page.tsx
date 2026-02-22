"use client"

import { useState } from "react"

/* ─────────────── DATA ─────────────── */
type Style = { id: string; label: string; emoji: string; desc: string; accent: string }
type Ratio = "1:1" | "16:9" | "9:16" | "4:3"
type Quality = "draft" | "standard" | "hd"

const STYLES: Style[] = [
  { id: "photorealistic", label: "Photorealistic", emoji: "📷", desc: "Ultra-realistic photo quality", accent: "#6366f1" },
  { id: "editorial",      label: "Editorial",      emoji: "🗞️", desc: "Magazine / editorial look",   accent: "#f43f5e" },
  { id: "3d-render",      label: "3D Render",      emoji: "🎮", desc: "Modern 3D illustration",      accent: "#8b5cf6" },
  { id: "flat-design",    label: "Flat Design",    emoji: "🎨", desc: "Clean vector flat art",       accent: "#14b8a6" },
  { id: "cinematic",      label: "Cinematic",      emoji: "🎬", desc: "Movie / film grade look",     accent: "#f59e0b" },
  { id: "neon-glow",      label: "Neon / Cyber",   emoji: "⚡", desc: "Neon & cyberpunk aesthetic",  accent: "#ec4899" },
]

const QUICK_PROMPTS = [
  "Futuristic dashboard UI mockup, dark mode, neon blue accents",
  "Minimalist product shot, white background, soft shadows",
  "Abstract gradient mesh, purple and cyan, editorial style",
  "Social media banner for an AI SaaS product, bold typography",
  "Hero image for a landing page, tech startup, clean modern",
  "Instagram carousel slide, lifestyle brand, warm tones",
]

const GALLERY = [
  { id: 1, prompt: "Futuristic dashboard UI, dark mode",   style: "3D Render",      ratio: "16:9", time: "2 hrs ago",   gradient: "from-indigo-900 via-violet-900 to-slate-900", emoji: "🖥️" },
  { id: 2, prompt: "Product banner, AI SaaS, bold type",   style: "Editorial",      ratio: "16:9", time: "5 hrs ago",   gradient: "from-rose-900 via-pink-900 to-slate-900",   emoji: "🎯" },
  { id: 3, prompt: "Abstract mesh, purple and cyan",       style: "Neon / Cyber",   ratio: "1:1",  time: "Yesterday",   gradient: "from-purple-900 via-cyan-900 to-slate-900",  emoji: "✦" },
  { id: 4, prompt: "Landing page hero, tech startup",      style: "Photorealistic", ratio: "4:3",  time: "2 days ago",  gradient: "from-blue-900 via-indigo-900 to-slate-900",  emoji: "🚀" },
  { id: 5, prompt: "Instagram post, lifestyle brand",      style: "Flat Design",    ratio: "1:1",  time: "3 days ago",  gradient: "from-teal-900 via-emerald-900 to-slate-900", emoji: "📱" },
  { id: 6, prompt: "Cinematic scene, futuristic city",     style: "Cinematic",      ratio: "16:9", time: "4 days ago",  gradient: "from-amber-900 via-orange-900 to-slate-900", emoji: "🌆" },
]

/* ─────────────── MOCK IMAGE CARD ─────────────── */
function MockImage({ gradient, emoji, label }: { gradient: string; emoji: string; label?: string }) {
  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2 relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 60%), radial-gradient(circle at 70% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)" }} />
      <span className="text-4xl relative z-10">{emoji}</span>
      {label && <span className="text-white/40 text-[10px] font-mono relative z-10">{label}</span>}
    </div>
  )
}

/* ─────────────── COMPONENT ─────────────── */
export default function VisionStudioPage() {
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("photorealistic")
  const [ratio, setRatio] = useState<Ratio>("16:9")
  const [quality, setQuality] = useState<Quality>("standard")
  const [count, setCount] = useState(4)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [activeTab, setActiveTab] = useState<"generate" | "gallery">("generate")
  const [, setSelectedImg] = useState<number | null>(null)

  const selectedStyle = STYLES.find(s => s.id === style)!

  const generate = () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    setGenerated(false)
    setTimeout(() => { setIsGenerating(false); setGenerated(true) }, 2200)
  }

  const MOCK_OUTPUTS = [
    { gradient: "from-indigo-900 via-violet-800 to-slate-900", emoji: "✦" },
    { gradient: "from-violet-900 via-purple-800 to-slate-900", emoji: "◉" },
    { gradient: "from-purple-900 via-indigo-800 to-slate-900", emoji: "◈" },
    { gradient: "from-slate-900 via-indigo-900 to-violet-900", emoji: "⬡" },
  ].slice(0, count)

  return (
    <div className="text-zinc-900 dark:text-zinc-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
        .font-display { font-family: 'Syne', sans-serif; }
        .font-mono-c { font-family: 'DM Mono', monospace; }
        @keyframes fade-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fade-up 0.45s ease forwards; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .shimmer-btn {
          background: linear-gradient(90deg, #8b5cf6 0%, #ec4899 50%, #8b5cf6 100%);
          background-size: 200% 100%; animation: shimmer 2.5s infinite;
          transition: all 0.3s;
        }
        .shimmer-btn:hover { animation-duration: 1s; transform: translateY(-2px); box-shadow: 0 12px 30px rgba(139,92,246,0.35) !important; }
        .shimmer-btn:disabled { animation: none; opacity: 0.6; transform: none !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(1.6);opacity:0} }
        .pulse-ring { animation: pulse-ring 1.2s ease-out infinite; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .img-hover { transition: all 0.3s cubic-bezier(.34,1.56,.64,1); }
        .img-hover:hover { transform: scale(1.03); z-index: 10; box-shadow: 0 20px 50px rgba(0,0,0,0.25) !important; }
        .style-card {
          border-radius: 12px; border: 1.5px solid #f0f0f8; padding: 10px 12px;
          cursor: pointer; transition: all 0.2s cubic-bezier(.34,1.56,.64,1);
          background: white; display: flex; align-items: center; gap: 8px;
        }
        .dark .style-card { background: #13131a; border-color: #1e1e2e; }
        .style-card:hover { transform: translateY(-2px); }
        .style-card.selected { border-color: #8b5cf6; background: rgba(139,92,246,0.04); box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
        .ratio-btn {
          padding: 6px 12px; border-radius: 10px; font-size: 12px; font-weight: 700;
          border: 1.5px solid #f0f0f8; cursor: pointer; transition: all 0.2s;
          background: white; color: #888899;
        }
        .dark .ratio-btn { background: #13131a; border-color: #1e1e2e; color: #6b6b8a; }
        .ratio-btn:hover { border-color: #8b5cf6; color: #8b5cf6; }
        .ratio-btn.active { border-color: #8b5cf6; background: rgba(139,92,246,0.08); color: #8b5cf6; font-weight: 800; }
        .quality-btn {
          padding: 5px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;
          border: 1.5px solid #f0f0f8; cursor: pointer; transition: all 0.2s;
          background: transparent; color: #888899;
        }
        .quality-btn.active { border-color: #8b5cf6; background: rgba(139,92,246,0.08); color: #8b5cf6; }
        .quick-tag {
          padding: 5px 12px; border-radius: 100px; font-size: 11px; font-weight: 600;
          border: 1px solid #f0f0f8; cursor: pointer; transition: all 0.2s;
          background: white; color: #777788; white-space: nowrap;
        }
        .dark .quick-tag { background: #13131a; border-color: #1e1e2e; color: #6b6b8a; }
        .quick-tag:hover { border-color: #8b5cf6; color: #8b5cf6; background: rgba(139,92,246,0.04); }
        .tab-btn { padding: 6px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
        .tab-btn.active { background: rgba(139,92,246,0.1); color: #8b5cf6; }
        .tab-btn.idle { background: transparent; color: #888899; }
        .tab-btn.idle:hover { color: #8b5cf6; background: rgba(139,92,246,0.05); }
        .action-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 600;
          border: 1.5px solid #f0f0f8; background: white; color: #666677;
          cursor: pointer; transition: all 0.2s;
        }
        .dark .action-btn { background: #1a1a2e; border-color: #2a2a3e; color: #8888aa; }
        .action-btn:hover { border-color: #8b5cf6; color: #8b5cf6; transform: translateY(-1px); }
        .skeleton { border-radius: 8px; background: linear-gradient(90deg, #f0f0f8 25%, #e8e8f5 50%, #f0f0f8 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
        .dark .skeleton { background: linear-gradient(90deg, #1a1a2e 25%, #22223a 50%, #1a1a2e 75%); background-size: 200% 100%; }
        @keyframes gen-pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        .gen-card { animation: gen-pulse 1.5s ease-in-out infinite; }
        .count-btn { width:28px; height:28px; border-radius:8px; border:1.5px solid #f0f0f8; background:white; font-size:14px; font-weight:700; cursor:pointer; transition:all 0.2s; color:#555566; display:flex; align-items:center; justify-content:center; }
        .dark .count-btn { background:#13131a; border-color:#1e1e2e; color:#8888aa; }
        .count-btn:hover { border-color:#8b5cf6; color:#8b5cf6; }
        .panel-card { background: white; border: 1px solid #f0f0f8; box-shadow: 0 2px 16px rgba(0,0,0,0.04); }
        .dark .panel-card { background: #101018 !important; border-color: #202036 !important; }
        .panel-header { border-bottom: 1px solid #f8f8ff; background: rgba(139,92,246,0.02); }
        .dark .panel-header { border-bottom-color: #202036 !important; background: rgba(139,92,246,0.06) !important; }
        .panel-top-border { border-top: 1px solid #f8f8ff; }
        .dark .panel-top-border { border-top-color: #202036 !important; }
        .dark .muted-soft { color: #94a3b8 !important; }
      `}</style>

      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-6 fade-up flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg" style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}>
              ◉
            </div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">
              Vision Studio
            </h1>
          </div>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 pl-12">
            Generate ad-ready visuals, social creatives, and product images from a prompt.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "rgba(139,92,246,0.08)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.15)" }}>
            ◉ 19 image sets this month
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "rgba(16,185,129,0.06)", color: "#059669", border: "1px solid rgba(16,185,129,0.12)" }}>
            +23% vs last month
          </span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 rounded-xl mb-5 inline-flex" style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.08)" }}>
        <button className={`tab-btn ${activeTab === "generate" ? "active" : "idle"}`} onClick={() => setActiveTab("generate")}>
          ✦ Generate
        </button>
        <button className={`tab-btn ${activeTab === "gallery" ? "active" : "idle"}`} onClick={() => setActiveTab("gallery")}>
          🖼 My Gallery
        </button>
      </div>

      {activeTab === "generate" && (
        <div className="grid lg:grid-cols-[1fr_380px] gap-5 fade-up">

          {/* ═══ LEFT — prompt + settings ═══ */}
          <div className="space-y-4">

            {/* Prompt card */}
            <div className="rounded-2xl overflow-hidden panel-card">
              <div className="px-5 py-3 flex items-center justify-between panel-header">
                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">✦ Image Prompt</span>
                <span className="text-xs font-mono-c muted-soft" style={{ color: "#b0b0c8" }}>{prompt.length}/500</span>
              </div>
              <div className="px-5 py-4">
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value.slice(0, 500))}
                  placeholder="Describe the image you want to create...&#10;&#10;e.g. Futuristic AI dashboard UI mockup, dark background, neon indigo accents, clean minimal layout, editorial magazine style"
                  className="w-full text-sm text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-300 dark:placeholder:text-zinc-600 resize-none border-none outline-none bg-transparent leading-relaxed"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>

              {/* Quick prompts */}
              <div className="px-5 pb-4">
                <p className="text-[10px] font-black uppercase tracking-widest mb-2 muted-soft" style={{ color: "#b0b0c8" }}>Quick Ideas</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map(q => (
                    <button key={q} onClick={() => setPrompt(q)} className="quick-tag">{q}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Style selector */}
            <div className="rounded-2xl p-5 panel-card">
              <p className="text-[10px] font-black uppercase tracking-widest mb-3 muted-soft" style={{ color: "#b0b0c8" }}>Visual Style</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STYLES.map(s => (
                  <div
                    key={s.id}
                    className={`style-card ${style === s.id ? "selected" : ""}`}
                    onClick={() => setStyle(s.id)}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: `${s.accent}18`, color: s.accent }}>
                      {s.emoji}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200 truncate">{s.label}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{s.desc}</p>
                    </div>
                    {style === s.id && <span className="ml-auto text-xs font-bold flex-shrink-0" style={{ color: "#8b5cf6" }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Settings row */}
            <div className="rounded-2xl p-5 panel-card">
              <div className="grid sm:grid-cols-3 gap-5">
                {/* Aspect ratio */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-2 muted-soft" style={{ color: "#b0b0c8" }}>Aspect Ratio</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(["1:1", "16:9", "9:16", "4:3"] as Ratio[]).map(r => (
                      <button key={r} className={`ratio-btn ${ratio === r ? "active" : ""}`} onClick={() => setRatio(r)}>{r}</button>
                    ))}
                  </div>
                </div>
                {/* Quality */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-2 muted-soft" style={{ color: "#b0b0c8" }}>Quality</p>
                  <div className="flex gap-1.5">
                    {(["draft", "standard", "hd"] as Quality[]).map(q => (
                      <button key={q} className={`quality-btn ${quality === q ? "active" : ""}`} onClick={() => setQuality(q)}>
                        {q === "draft" ? "Draft" : q === "standard" ? "Standard" : "HD"}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Count */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-2 muted-soft" style={{ color: "#b0b0c8" }}>Variations</p>
                  <div className="flex items-center gap-2">
                    <button className="count-btn" onClick={() => setCount(Math.max(1, count - 1))}>−</button>
                    <span className="font-display text-lg font-extrabold w-6 text-center text-zinc-700 dark:text-zinc-200">{count}</span>
                    <button className="count-btn" onClick={() => setCount(Math.min(8, count + 1))}>+</button>
                    <span className="text-xs text-zinc-400">images</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={generate}
              disabled={isGenerating || !prompt.trim()}
              className="shimmer-btn w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <>
                  <span className="spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full inline-block" />
                  Generating {count} image{count > 1 ? "s" : ""}…
                </>
              ) : (
                <>◉ Generate {count} Image{count > 1 ? "s" : ""}</>
              )}
            </button>
          </div>

          {/* ═══ RIGHT — output ═══ */}
          <div className="space-y-4 fade-up" style={{ animationDelay: "0.08s" }}>

            {/* Settings summary */}
            <div className="rounded-2xl p-4 flex flex-wrap gap-2" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.1)" }}>
              {[
                { label: "Style", value: selectedStyle.label, emoji: selectedStyle.emoji },
                { label: "Ratio", value: ratio, emoji: "⬜" },
                { label: "Quality", value: quality.toUpperCase(), emoji: quality === "hd" ? "💎" : "⚡" },
                { label: "Count", value: `${count} images`, emoji: "🖼" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900" style={{ border: "1px solid rgba(139,92,246,0.12)", color: "#6b6b8a" }}>
                  <span>{s.emoji}</span>
                  <span style={{ color: "#b0b0c8" }}>{s.label}:</span>
                  <span style={{ color: "#8b5cf6", fontWeight: 700 }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Output grid */}
            <div className="rounded-2xl overflow-hidden panel-card">
              <div className="px-4 py-3 flex items-center justify-between panel-header">
                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">Output</span>
                {generated && (
                  <div className="flex gap-1.5">
                    <button className="action-btn">📥 Download All</button>
                    <button className="action-btn">💾 Save to Gallery</button>
                  </div>
                )}
              </div>

              <div className="p-4">
                {/* Empty state */}
                {!generated && !isGenerating && (
                  <div className="flex flex-col items-center justify-center py-14 gap-4 text-center">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "rgba(139,92,246,0.08)" }}>◉</div>
                    </div>
                    <p className="text-sm font-semibold text-zinc-400 dark:text-zinc-300">Your images will appear here</p>
                    <p className="text-xs text-zinc-300 dark:text-zinc-500 max-w-48">Write a prompt, pick a style, and hit Generate</p>
                  </div>
                )}

                {/* Generating skeleton */}
                {isGenerating && (
                  <div className={`grid gap-3 ${count <= 1 ? "grid-cols-1" : count <= 2 ? "grid-cols-2" : "grid-cols-2"}`}>
                    {Array.from({ length: count }).map((_, i) => (
                      <div
                        key={i}
                        className="gen-card rounded-xl overflow-hidden"
                        style={{ aspectRatio: ratio === "16:9" ? "16/9" : ratio === "9:16" ? "9/16" : ratio === "4:3" ? "4/3" : "1/1", animationDelay: `${i * 0.15}s` }}
                      >
                        <div className="w-full h-full skeleton" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Generated images */}
                {generated && !isGenerating && (
                  <div className="fade-up">
                    <div className={`grid gap-3 ${count <= 1 ? "grid-cols-1" : count <= 2 ? "grid-cols-2" : "grid-cols-2"}`}>
                      {MOCK_OUTPUTS.map((img, i) => (
                        <div
                          key={i}
                          className="img-hover rounded-xl overflow-hidden cursor-pointer relative group"
                          style={{
                            aspectRatio: ratio === "16:9" ? "16/9" : ratio === "9:16" ? "9/16" : ratio === "4:3" ? "4/3" : "1/1",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                          }}
                          onClick={() => setSelectedImg(i)}
                        >
                          <MockImage gradient={img.gradient} emoji={img.emoji} label={`v${i + 1} · ${selectedStyle.label}`} />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <button className="bg-white/90 text-zinc-800 text-xs font-bold px-3 py-1.5 rounded-lg">📥 Save</button>
                            <button className="bg-white/90 text-zinc-800 text-xs font-bold px-3 py-1.5 rounded-lg">🔍 Expand</button>
                          </div>
                          <div className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "rgba(139,92,246,0.7)", backdropFilter: "blur(4px)" }}>
                            v{i + 1}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 pt-3 panel-top-border" style={{ borderTop: "1px solid #f8f8ff" }}>
                      <button onClick={generate} className="action-btn">🔄 Regenerate All</button>
                      <button className="action-btn">🎨 Vary Style</button>
                      <button className="action-btn">🔍 Upscale Selected</button>
                      <button className="action-btn">📤 Export Pack</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Gallery tab ── */}
      {activeTab === "gallery" && (
        <div className="fade-up">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GALLERY.map(item => (
              <div key={item.id} className="rounded-2xl overflow-hidden group cursor-pointer img-hover panel-card" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                {/* Image preview */}
                <div className="relative aspect-video overflow-hidden">
                  <MockImage gradient={item.gradient} emoji={item.emoji} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button className="bg-white/90 text-zinc-800 text-xs font-bold px-3 py-1.5 rounded-lg">📥 Download</button>
                    <button className="bg-white/90 text-zinc-800 text-xs font-bold px-3 py-1.5 rounded-lg">✏️ Remix</button>
                  </div>
                  <div className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "rgba(139,92,246,0.75)", backdropFilter: "blur(4px)" }}>
                    {item.ratio}
                  </div>
                </div>
                {/* Info */}
                <div className="px-4 py-3">
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 truncate">{item.prompt}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-medium text-zinc-400">{item.style} · {item.time}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.08)", color: "#8b5cf6" }}>{item.ratio}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
