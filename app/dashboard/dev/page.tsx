"use client"

import { useState } from "react"

const MODES = ["Generate code", "Debug", "Review", "Explain"]
const LANGUAGES = ["Auto-detect", "TypeScript", "JavaScript", "Python", "React", "Next.js"]

export default function DevToolkitPage() {
  const [mode, setMode] = useState(MODES[0])
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [task, setTask] = useState("")
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const generate = async () => {
    if (!task.trim()) return
    setLoading(true)
    setError("")
    setOutput("")

    try {
      const response = await fetch("/api/ai/dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, language, task }),
      })
      const data = (await response.json()) as { output?: string; error?: string }

      if (!response.ok) throw new Error(data.error || "Failed to generate developer output")
      setOutput(data.output || "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 text-zinc-900 dark:text-zinc-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xl">
          ⚡
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-zinc-100">Dev Toolkit</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Generate, debug, review, and explain code with OpenAI</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-6">
        <aside className="space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase mb-2">Mode</p>
            <div className="space-y-2">
              {MODES.map((item) => (
                <button
                  key={item}
                  onClick={() => setMode(item)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                    mode === item
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:border-indigo-300"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase">Stack</label>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="w-full mt-2 p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500"
            >
              {LANGUAGES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </aside>

        <main className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase">Task</label>
              <textarea
                value={task}
                onChange={(event) => setTask(event.target.value)}
                placeholder="Paste code, describe a bug, or ask for a function/component..."
                className="w-full mt-2 p-3 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm focus:outline-none focus:border-indigo-500 resize-none"
                rows={7}
              />
            </div>

            <button
              onClick={generate}
              disabled={loading || !task.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Generating..." : "Run Dev Toolkit"}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900 p-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {output && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase">Output</p>
                <button
                  onClick={() => navigator.clipboard.writeText(output)}
                  className="text-xs px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Copy
                </button>
              </div>
              <pre className="text-sm text-zinc-700 dark:text-zinc-200 whitespace-pre-wrap font-mono leading-relaxed">
                {output}
              </pre>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
