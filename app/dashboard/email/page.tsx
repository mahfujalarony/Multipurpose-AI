// ফাইল: components/EmailStudio.tsx
"use client"

import { useState } from "react"

const TEMPLATES = [
  { id: "cold", label: "Cold Outreach", icon: "📧" },
  { id: "followup", label: "Follow-Up", icon: "🔄" },
  { id: "newsletter", label: "Newsletter", icon: "📰" },
  { id: "support", label: "Support Reply", icon: "🆘" },
]

const TONES = ["Professional", "Friendly", "Casual", "Bold"]

export default function EmailStudio() {
  const [template, setTemplate] = useState("cold")
  const [tone, setTone] = useState("Professional")
  const [subject, setSubject] = useState("Quick idea for {Company}")
  const [body, setBody] = useState("Write a cold email to {Name} at {Company} about our AI tool...")
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const generate = async () => {
    if (!body.trim()) return

    setLoading(true)
    setError("")
    setOutput("")

    try {
      await new Promise((resolve) => setTimeout(resolve, 900))

      const generatedSubject = subject.trim() || "Quick idea for your team"
      const generatedBody = [
        "Hi there,",
        "",
        `I'm sharing a ${tone.toLowerCase()} ${template.replace("-", " ")} email draft for your request.`,
        "",
        body.trim(),
        "",
        "Let me know if you want a shorter or more sales-focused version.",
        "",
        "Best regards,",
        "MultipurposeAI",
      ].join("\n")

      setOutput(`Subject: ${generatedSubject}\n\n${generatedBody}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-transparent dark:border-zinc-800 transition-colors">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 dark:text-zinc-100">✉️ Email Studio</h1>
        <span className="text-xs text-gray-400 dark:text-zinc-500">Local demo mode</span>
      </div>

      {/* Template Buttons */}
      <div className="flex gap-2 flex-wrap">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTemplate(t.id)
              setOutput("")
              setError("")
            }}
            className={`px-4 py-2 rounded-lg text-sm border transition-all ${
              template === t.id
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
            }`}
          >
            <span className="mr-1">{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Subject Input */}
      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
          Subject Line
        </label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g., Quick idea for {Company}"
          className="w-full mt-1.5 p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-400 outline-none transition"
        />
      </div>

      {/* Body/Prompt Input */}
      <div>
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
            Email Prompt
          </label>
          <span className="text-xs text-gray-400 dark:text-zinc-500">{body.length} characters</span>
        </div>
        <textarea
          value={body}
          onChange={(e) => {
            setBody(e.target.value)
          }}
          rows={5}
          placeholder="Describe what you want in the email..."
          className="w-full mt-1.5 p-3 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 rounded-lg text-sm resize-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-400 outline-none transition"
        />
      </div>

      {/* Tone Selector */}
      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
          Tone
        </label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="w-full mt-1.5 p-3 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:border-indigo-400 outline-none transition"
        >
          {TONES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Generate Button */}
      <button
        onClick={generate}
        disabled={loading}
        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating...
          </span>
        ) : (
          "Generate Email"
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <span>⚠️</span> {error}
          </p>
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="bg-gray-50 dark:bg-zinc-950 rounded-lg p-5 border border-gray-200 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Generated Email
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              <span>📋</span> Copy
            </button>
          </div>
          <pre className="text-sm text-gray-700 dark:text-zinc-200 whitespace-pre-wrap font-sans leading-relaxed">
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}
