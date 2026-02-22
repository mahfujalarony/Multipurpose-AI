"use client"

import { useState } from "react"

type ContentType = {
  id: string
  label: string
  emoji: string
  desc: string
}

const CONTENT_TYPES: ContentType[] = [
  { id: "blog", label: "Blog Post", emoji: "📝", desc: "Full SEO article" },
  { id: "landing", label: "Landing Page", emoji: "🚀", desc: "Hero copy & CTA" },
  { id: "social", label: "Social Post", emoji: "📱", desc: "LinkedIn/Twitter" },
  { id: "meta", label: "Meta SEO", emoji: "🔍", desc: "Title & description" },
]

const TONES = [
  { id: "professional", label: "Professional", emoji: "💼" },
  { id: "casual", label: "Casual", emoji: "😎" },
  { id: "inspirational", label: "Inspirational", emoji: "✨" },
]

export default function ContentStudio() {
  const [selectedType, setSelectedType] = useState<ContentType>(CONTENT_TYPES[0])
  const [tone, setTone] = useState("professional")
  const [topic, setTopic] = useState("")
  const [output, setOutput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generate = () => {
    if (!topic.trim()) return
    setIsGenerating(true)
    
    setTimeout(() => {
      setOutput(`# ${topic}

This is your AI-generated ${selectedType.label} in a ${tone} tone.

## Key Points

- Point one about ${topic}
- Point two with insights
- Point three with actionable tips

## Conclusion

Start implementing these ideas today and see the results!`)
      setIsGenerating(false)
    }, 1500)
  }

  const copy = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xl">
          ✦
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-zinc-100">Content Studio</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Generate blogs, landing copy & more</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Sidebar - Content Types */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase">Content Type</p>
          {CONTENT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                selectedType.id === type.id
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-500/10"
                  : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-teal-300 dark:hover:border-teal-500"
              }`}
            >
              <span className="text-xl">{type.emoji}</span>
              <div className="text-left">
                <p className="font-semibold text-sm text-gray-800 dark:text-zinc-100">{type.label}</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">{type.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-4">
          {/* Input Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 space-y-4">
            {/* Topic */}
            <div>
              <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase">Topic</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Why AI is changing marketing"
                className="w-full mt-2 p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 rounded-xl text-sm focus:outline-none focus:border-teal-500 resize-none"
                rows={2}
              />
            </div>

            {/* Tone */}
            <div>
              <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase">Tone</label>
              <div className="flex gap-2 mt-2">
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      tone === t.id
                        ? "bg-teal-500 text-white"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generate}
              disabled={isGenerating || !topic.trim()}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-indigo-500 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isGenerating ? "Generating..." : `Generate ${selectedType.label}`}
            </button>
          </div>

          {/* Output Section */}
          {output && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase">Output</p>
                <button
                  onClick={copy}
                  className="text-xs px-3 py-1.5 border border-gray-200 dark:border-zinc-700 rounded-lg hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  📋 Copy
                </button>
              </div>
              <pre className="text-sm text-gray-700 dark:text-zinc-200 whitespace-pre-wrap font-sans leading-relaxed">
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
