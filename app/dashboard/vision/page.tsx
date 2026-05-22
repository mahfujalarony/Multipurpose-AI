"use client"

import { useState } from "react"

type Style = { id: string; label: string; desc: string; accent: string }
type Ratio = "1:1" | "16:9" | "9:16" | "4:3"
type Quality = "draft" | "standard" | "hd"

const STYLES: Style[] = [
  { id: "photorealistic", label: "Photorealistic", desc: "Realistic photo quality", accent: "#6366f1" },
  { id: "editorial", label: "Editorial", desc: "Magazine-ready composition", accent: "#f43f5e" },
  { id: "3d-render", label: "3D Render", desc: "Modern 3D illustration", accent: "#8b5cf6" },
  { id: "flat-design", label: "Flat Design", desc: "Clean graphic artwork", accent: "#14b8a6" },
  { id: "cinematic", label: "Cinematic", desc: "Film-grade visual mood", accent: "#f59e0b" },
  { id: "neon-glow", label: "Neon / Cyber", desc: "High-contrast neon aesthetic", accent: "#ec4899" },
]

export default function VisionStudioPage() {
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("photorealistic")
  const [ratio, setRatio] = useState<Ratio>("16:9")
  const [quality, setQuality] = useState<Quality>("standard")
  const [count, setCount] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [error, setError] = useState("")

  const selectedStyle = STYLES.find((item) => item.id === style) || STYLES[0]

  const generate = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    setGeneratedImages([])
    setError("")

    try {
      const response = await fetch("/api/ai/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, ratio, quality, count }),
      })
      const data = (await response.json()) as { images?: string[]; error?: string }

      if (!response.ok) throw new Error(data.error || "Failed to generate images")
      setGeneratedImages(data.images || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsGenerating(false)
    }
  }

  const aspectRatio = ratio === "16:9" ? "16/9" : ratio === "9:16" ? "9/16" : ratio === "4:3" ? "4/3" : "1/1"

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-zinc-900 dark:text-zinc-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl bg-gradient-to-br from-violet-500 to-pink-500">
          ◉
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Vision Studio</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Generate visuals from your prompt using OpenAI.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_420px] gap-5">
        <div className="space-y-4">
          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase">Image Prompt</label>
              <textarea
                rows={5}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value.slice(0, 800))}
                placeholder="Describe the image you want to create..."
                className="w-full mt-2 p-3 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm focus:outline-none focus:border-violet-500 resize-none"
              />
              <p className="mt-1 text-xs text-zinc-400">{prompt.length}/800</p>
            </div>

            <div>
              <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-2">Visual Style</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {STYLES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setStyle(item.id)}
                    className={`text-left rounded-xl border p-3 transition ${
                      style === item.id
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-violet-300"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-zinc-800 dark:text-zinc-100">{item.label}</span>
                    <span className="block text-xs text-zinc-500 mt-1">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-2">Aspect Ratio</p>
                <div className="flex flex-wrap gap-2">
                  {(["1:1", "16:9", "9:16", "4:3"] as Ratio[]).map((item) => (
                    <button
                      key={item}
                      onClick={() => setRatio(item)}
                      className={`px-3 py-2 rounded-lg border text-xs font-bold ${
                        ratio === item
                          ? "border-violet-500 text-violet-600 bg-violet-50 dark:bg-violet-500/10"
                          : "border-zinc-200 dark:border-zinc-800 text-zinc-500"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-2">Quality</p>
                <select
                  value={quality}
                  onChange={(event) => setQuality(event.target.value as Quality)}
                  className="w-full p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="standard">Standard</option>
                  <option value="hd">HD</option>
                </select>
              </div>

              <div>
                <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-2">Variations</p>
                <div className="flex items-center gap-2">
                  <button className="h-9 w-9 rounded-lg border border-zinc-200 dark:border-zinc-800" onClick={() => setCount(Math.max(1, count - 1))}>
                    -
                  </button>
                  <span className="w-8 text-center font-bold">{count}</span>
                  <button className="h-9 w-9 rounded-lg border border-zinc-200 dark:border-zinc-800" onClick={() => setCount(Math.min(3, count + 1))}>
                    +
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={generate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? "Generating..." : `Generate ${count} Image${count > 1 ? "s" : ""}`}
            </button>
          </section>
        </div>

        <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-sm font-bold">Output</span>
            <span className="text-xs text-zinc-500">{selectedStyle.label}</span>
          </div>

          <div className="p-4">
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {isGenerating && (
              <div className={count === 1 ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 sm:grid-cols-2 gap-3"}>
                {Array.from({ length: count }).map((_, index) => (
                  <div
                    key={index}
                    className="min-h-[260px] rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse"
                    style={{ aspectRatio }}
                  />
                ))}
              </div>
            )}

            {!isGenerating && generatedImages.length === 0 && (
              <div className="py-16 text-center">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-300 flex items-center justify-center text-2xl">
                  ◉
                </div>
                <p className="mt-4 text-sm font-semibold text-zinc-500">No image generated yet</p>
                <p className="mt-1 text-xs text-zinc-400">Your real OpenAI output will appear here.</p>
              </div>
            )}

            {!isGenerating && generatedImages.length > 0 && (
              <div className={generatedImages.length === 1 ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 sm:grid-cols-2 gap-3"}>
                {generatedImages.map((src, index) => (
                  <div
                    key={src}
                    className="relative min-h-[260px] overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                    style={{ aspectRatio }}
                  >
                    <img src={src} alt={`Generated image ${index + 1}`} className="h-full w-full object-cover" />
                    <a
                      href={src}
                      download={`multipurpose-ai-${index + 1}.png`}
                      className="absolute bottom-2 right-2 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-zinc-800 shadow-sm"
                    >
                      Save
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
