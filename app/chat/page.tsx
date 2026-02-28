"use client"

import { FormEvent, Fragment, ReactNode, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import SiteNavbar from "@/components/shared/SiteNavbar"
import { signIn, useSession } from "next-auth/react"

type Role = "user" | "assistant"

type Message = {
  id: string
  role: Role
  content: string
}

type HistoryItem = {
  id: string
  role: Role
  content: string
  createdAt: string
}

type HistorySession = {
  sessionId: string
  title: string
  updatedAt: string
}

const INITIAL_ASSISTANT_TEXT =
  "স্বাগতম। আমি কিশোরগঞ্জ পলিটেকনিকের কাস্টম ডেটাভিত্তিক সহকারী। আপনি বাংলা, ইংরেজি বা বাংলিশে প্রশ্ন করতে পারেন।"

function ThinkingLoader({ phase }: { phase: "fetching" | "typing" }) {
  const text = phase === "fetching" ? "উত্তর তৈরি হচ্ছে..." : "টাইপ করছে..."
  return (
    <article className="text-[15px] leading-7 sm:text-base sm:leading-8 animate-in fade-in-50 duration-300">
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">সহকারী</div>
      <div className="mr-auto max-w-[320px] rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-4 py-3 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="সহকারী"
            width={24}
            height={24}
            className="rounded-full border border-slate-200 bg-white p-0.5"
          />
          <span className="text-xs font-semibold text-slate-600">KPI সহকারী</span>
        </div>
        <div className="mb-2 flex items-center gap-2">
          <span className="relative inline-flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-300 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500" />
          </span>
          <span className="text-sm font-medium text-slate-700">{text}</span>
        </div>
        <div className="flex items-end gap-1">
          <span className="h-2 w-1.5 animate-[pulse_1s_ease-in-out_infinite] rounded bg-slate-400" />
          <span className="h-3 w-1.5 animate-[pulse_1s_ease-in-out_infinite_150ms] rounded bg-slate-500" />
          <span className="h-4 w-1.5 animate-[pulse_1s_ease-in-out_infinite_300ms] rounded bg-slate-600" />
          <span className="h-3 w-1.5 animate-[pulse_1s_ease-in-out_infinite_450ms] rounded bg-slate-500" />
          <span className="h-2 w-1.5 animate-[pulse_1s_ease-in-out_infinite_600ms] rounded bg-slate-400" />
        </div>
      </div>
    </article>
  )
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function renderInlineMarkdown(text: string) {
  const nodes: ReactNode[] = []
  let cursor = 0
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let match: RegExpExecArray | null
  let index = 0

  // eslint-disable-next-line no-cond-assign
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(<Fragment key={`t-${index++}`}>{text.slice(cursor, match.index)}</Fragment>)
    }
    const token = match[0]
    if (token.startsWith("**")) {
      nodes.push(<strong key={`b-${index++}`}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={`c-${index++}`} className="rounded bg-slate-200 px-1.5 py-0.5 text-[0.92em] text-slate-800">
          {token.slice(1, -1)}
        </code>,
      )
    }
    cursor = match.index + token.length
  }

  if (cursor < text.length) {
    nodes.push(<Fragment key={`t-${index++}`}>{text.slice(cursor)}</Fragment>)
  }
  return nodes
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const keywords = [
    "const", "let", "var", "function", "return", "if", "else", "for", "while", "try", "catch",
    "class", "import", "from", "export", "await", "async", "def", "print", "True", "False", "None",
  ]
  const escapedCode = code
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")

  const highlighted = keywords.reduce((acc, kw) => {
    const regex = new RegExp(`\\b${escapeRegExp(kw)}\\b`, "g")
    return acc.replace(regex, `<span class="text-sky-300">${kw}</span>`)
  }, escapedCode)

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
        <span>{lang || "code"}</span>
        <span>highlighted</span>
      </div>
      <pre className="chat-scroll overflow-x-auto p-3 text-sm leading-6 text-slate-100">
        {/* eslint-disable-next-line react/no-danger */}
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  )
}

function FormattedMessage({ content }: { content: string }) {
  const blocks = content.split(/```/g)

  return (
    <div className="space-y-2">
      {blocks.map((block, idx) => {
        if (idx % 2 === 1) {
          const firstNewLine = block.indexOf("\n")
          const lang = (firstNewLine >= 0 ? block.slice(0, firstNewLine) : "").trim()
          const code = firstNewLine >= 0 ? block.slice(firstNewLine + 1) : block
          return <CodeBlock key={`code-${idx}`} lang={lang} code={code.trimEnd()} />
        }

        const lines = block.split("\n")

        const tableStart = lines.findIndex((line, i) => {
          if (!line.trim().startsWith("|")) return false
          let j = i + 1
          while (j < lines.length && !lines[j].trim()) j += 1
          const nextNonEmpty = lines[j]?.trim() || ""
          return /^\|?[\s:-|]+\|?$/.test(nextNonEmpty) && nextNonEmpty.includes("---")
        })

        if (tableStart >= 0) {
          const before = lines.slice(0, tableStart)
          let cursor = tableStart
          while (cursor < lines.length) {
            const t = lines[cursor].trim()
            if (!t || t.startsWith("|")) {
              cursor += 1
              continue
            }
            break
          }

          const tableLines = lines
            .slice(tableStart, cursor)
            .map((l) => l.trim())
            .filter((l) => l.startsWith("|"))
          const after = lines.slice(cursor)
          const header = tableLines[0]
            .split("|")
            .map((x) => x.trim())
            .filter(Boolean)
          const rows = tableLines
            .slice(1)
            .filter((line, idx) => !(idx === 0 && /^\|?[\s:-|]+\|?$/.test(line)))
            .map((line) => line.split("|").map((x) => x.trim()).filter(Boolean))
            .filter((r) => r.length > 0)

          return (
            <div key={`text-${idx}`} className="space-y-2">
              {before.filter(Boolean).map((line, lineIdx) => (
                <p key={`pre-${idx}-${lineIdx}`}>{renderInlineMarkdown(line)}</p>
              ))}
              <div className="chat-scroll overflow-x-auto rounded-xl border border-slate-300 bg-white">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      {header.map((cell, cellIdx) => (
                        <th key={`h-${idx}-${cellIdx}`} className="border-b border-slate-300 px-3 py-2 text-left font-semibold text-slate-700">
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIdx) => (
                      <tr key={`r-${idx}-${rowIdx}`} className="odd:bg-white even:bg-slate-50">
                        {row.map((cell, cellIdx) => (
                          <td key={`c-${idx}-${rowIdx}-${cellIdx}`} className="border-b border-slate-200 px-3 py-2 align-top">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {after.filter(Boolean).map((line, lineIdx) => (
                <p key={`aft-${idx}-${lineIdx}`}>{renderInlineMarkdown(line)}</p>
              ))}
            </div>
          )
        }

        return (
          <div key={`text-${idx}`} className="space-y-1.5">
            {lines.map((rawLine, lineIdx) => {
              const line = rawLine.trimEnd()
              if (!line) return <div key={`line-${idx}-${lineIdx}`} className="h-1" />

              if (line.startsWith("### ")) {
                return <h3 key={`line-${idx}-${lineIdx}`} className="text-base font-semibold text-slate-900">{renderInlineMarkdown(line.slice(4))}</h3>
              }
              if (line.startsWith("## ")) {
                return <h2 key={`line-${idx}-${lineIdx}`} className="text-lg font-bold text-slate-900">{renderInlineMarkdown(line.slice(3))}</h2>
              }
              if (line.startsWith("# ")) {
                return <h1 key={`line-${idx}-${lineIdx}`} className="text-xl font-bold text-slate-900">{renderInlineMarkdown(line.slice(2))}</h1>
              }
              if (/^\d+\.\s+/.test(line)) {
                return (
                  <div key={`line-${idx}-${lineIdx}`} className="flex gap-2">
                    <span className="min-w-5 font-semibold text-slate-600">{line.match(/^\d+\./)?.[0]}</span>
                    <span>{renderInlineMarkdown(line.replace(/^\d+\.\s+/, ""))}</span>
                  </div>
                )
              }
              if (/^[-*]\s+/.test(line)) {
                return (
                  <div key={`line-${idx}-${lineIdx}`} className="flex gap-2">
                    <span className="font-bold text-slate-600">*</span>
                    <span>{renderInlineMarkdown(line.replace(/^[-*]\s+/, ""))}</span>
                  </div>
                )
              }
              return <p key={`line-${idx}-${lineIdx}`}>{renderInlineMarkdown(line)}</p>
            })}
          </div>
        )
      })}
    </div>
  )
}

const quickPrompts = [
  "কিশোরগঞ্জ পলিটেকনিক সম্পর্কে বলো",
  "প্রতিষ্ঠান কোড, প্রতিষ্ঠার বছর ও ধরন কী?",
  "ক্যাম্পাসের অবস্থান ও সুবিধাগুলো বলো",
  "কোন কোন বিভাগ/টেকনোলজি আছে?",
  "বর্তমান অধ্যক্ষ ও উপাধ্যক্ষ কে?",
  "কম্পিউটার বিভাগের শিক্ষক/ইন্সট্রাক্টর তথ্য দাও",
  "অফিশিয়াল ইমেইল, ওয়েবসাইট ও যোগাযোগ নম্বর দাও",
  "BTEB ভর্তি ও পরীক্ষার আপডেট কোথায় পাব?",
  "সাম্প্রতিক নোটিশ ও রুটিনের সারাংশ দাও",
  "CST ১ম শিফট প্র্যাকটিক্যাল রুটিন দাও",
]

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs = 70000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export default function ChatPage() {
  const { status } = useSession()
  const initialAssistantId = useRef(makeId())
  const introAnimated = useRef(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: initialAssistantId.current,
      role: "assistant",
      content: "",
    },
  ])
  const [input, setInput] = useState("")
  const [loadingPhase, setLoadingPhase] = useState<"idle" | "fetching" | "typing">("idle")
  const [error, setError] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCompact, setSidebarCompact] = useState(false)
  const [historySessions, setHistorySessions] = useState<HistorySession[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState(`session-${makeId()}`)
  const endRef = useRef<HTMLDivElement | null>(null)

  const isBusy = loadingPhase !== "idle"
  const isAuthenticated = status === "authenticated"
  const canSend = useMemo(() => input.trim().length > 0 && !isBusy && isAuthenticated, [input, isBusy, isAuthenticated])

  useEffect(() => {
    document.documentElement.classList.remove("dark")
    localStorage.setItem("ai-theme", "light")
  }, [])

  useEffect(() => {
    if (introAnimated.current) return
    introAnimated.current = true

    const animateIntro = async () => {
      for (let i = 0; i < INITIAL_ASSISTANT_TEXT.length; i += 8) {
        const chunk = INITIAL_ASSISTANT_TEXT.slice(i, i + 8)
        setMessages((prev) =>
          prev.map((m) => (m.id === initialAssistantId.current ? { ...m, content: m.content + chunk } : m)),
        )
        await sleep(10)
      }
    }

    void animateIntro()
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, loadingPhase])

  useEffect(() => {
    if (!isAuthenticated) {
      setHistorySessions([])
      return
    }

    const loadHistorySessions = async () => {
      setHistoryLoading(true)
      try {
        const res = await fetch("/api/chat/history", { cache: "no-store" })
        if (!res.ok) return
        const data = (await res.json()) as { sessions?: HistorySession[] }
        setHistorySessions(Array.isArray(data.sessions) ? data.sessions : [])
      } finally {
        setHistoryLoading(false)
      }
    }

    void loadHistorySessions()
  }, [isAuthenticated])

  const startNewChat = () => {
    setActiveSessionId(`session-${makeId()}`)
    setMessages([
      {
        id: makeId(),
        role: "assistant",
        content: "নতুন চ্যাট শুরু হয়েছে। আপনার প্রশ্ন লিখুন।",
      },
    ])
    setInput("")
    setError("")
  }

  const handleQuickPrompt = (text: string) => {
    setInput(text)
    setSidebarOpen(false)
  }

  const openHistorySession = async (sessionId: string) => {
    if (!isAuthenticated) return
    setSidebarOpen(false)
    setHistoryLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/chat/history?sessionId=${encodeURIComponent(sessionId)}`, { cache: "no-store" })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error || "হিস্ট্রি লোড করা যায়নি।")
      }
      const data = (await res.json()) as { items?: HistoryItem[] }
      const items = Array.isArray(data.items) ? data.items : []
      setActiveSessionId(sessionId)

      if (items.length === 0) {
        setMessages([{ id: makeId(), role: "assistant", content: "এই সেশনে কোনো মেসেজ পাওয়া যায়নি।" }])
        return
      }

      setMessages(
        items.map((item) => ({
          id: item.id,
          role: item.role,
          content: item.content,
        })),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "হিস্ট্রি লোড করা যায়নি।")
    } finally {
      setHistoryLoading(false)
    }
  }

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      setError("চ্যাট ব্যবহার করতে লগইন করুন।")
      return
    }
    if (!canSend) return

    const userText = input.trim()
    const userMessage: Message = { id: makeId(), role: "user", content: userText }
    const assistantId = makeId()
    const history = [...messages, userMessage]

    setInput("")
    setSidebarOpen(false)
    setError("")
    setLoadingPhase("fetching")
    setMessages((prev) => [...prev, userMessage])

    try {
      const res = await fetchWithTimeout("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      const data = (await res.json()) as { reply?: string; error?: string }
      if (!res.ok) throw new Error(data.error || "Chat API error")

      const reply = data.reply || "Sorry, no response was generated."
      const shortReply = reply.length <= 260
      if (!shortReply) {
        setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: reply }])
      } else {
        setLoadingPhase("typing")
        setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }])
        for (let i = 0; i < reply.length; i += 14) {
          const chunk = reply.slice(i, i + 14)
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)))
          await sleep(2)
        }
      }

      void fetch("/api/chat/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          messages: [
            { role: "user", content: userText },
            { role: "assistant", content: reply },
          ],
        }),
      })
        .then(async () => {
          const res = await fetch("/api/chat/history", { cache: "no-store" })
          if (!res.ok) return
          const data = (await res.json()) as { sessions?: HistorySession[] }
          setHistorySessions(Array.isArray(data.sessions) ? data.sessions : [])
        })
        .catch(() => {})
    } catch (err) {
      const msg =
        err instanceof Error && err.name === "AbortError"
          ? "রেসপন্স পেতে দেরি হচ্ছে। আবার চেষ্টা করুন।"
          : err instanceof Error
            ? err.message
            : "Unexpected error"
      setError(msg)
      setMessages((prev) =>
        prev.some((m) => m.id === assistantId)
          ? prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: "API response failed. Please check API key, model, and knowledge data." }
                : m,
            )
          : [...prev, { id: assistantId, role: "assistant", content: "API response failed. Please check API key, model, and knowledge data." }],
      )
    } finally {
      setLoadingPhase("idle")
    }
  }

  return (
    <main className="h-svh bg-gradient-to-b from-slate-100 to-slate-200 text-slate-900">
          <SiteNavbar actionLabel="নতুন চ্যাট" onActionClick={startNewChat} onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex h-[calc(100svh-4rem)]">
        <div
          className={["fixed inset-0 z-30 bg-black/35 md:hidden", sidebarOpen ? "block" : "hidden"].join(" ")}
          onClick={() => setSidebarOpen(false)}
        />

        <aside
          className={[
            "chat-scroll fixed left-0 top-16 z-40 h-[calc(100svh-4rem)] overflow-y-auto overscroll-contain border-r border-slate-200 bg-slate-50 p-3 transition-all md:static md:top-0 md:h-full md:translate-x-0",
            sidebarCompact ? "md:w-[92px]" : "md:w-[300px]",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="mb-3 flex items-center gap-2">
            <button
              onClick={startNewChat}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-left text-sm font-semibold shadow-sm transition hover:bg-slate-100"
            >নতুন চ্যাট</button>
            <button
              onClick={() => setSidebarCompact((prev) => !prev)}
              className="hidden rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 md:block"
              title={sidebarCompact ? "Expand sidebar" : "Compact sidebar"}
            >
              {sidebarCompact ? ">>" : "<<"}
            </button>
          </div>

          {!sidebarCompact && (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                <p className="px-2 pb-1 pt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500">দ্রুত প্রশ্ন</p>
                <div className="space-y-1.5">
                  {quickPrompts.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleQuickPrompt(item)}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                      title={item}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                <p className="px-2 pb-1 pt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500">চ্যাট হিস্ট্রি</p>
                <div className="chat-scroll max-h-[280px] space-y-1.5 overflow-y-auto px-1 pb-1">
                  {!isAuthenticated ? (
                    <p className="px-2 py-2 text-xs text-slate-500">হিস্ট্রি দেখতে আগে লগইন করুন।</p>
                  ) : historyLoading ? (
                    <p className="px-2 py-2 text-xs text-slate-500">হিস্ট্রি লোড হচ্ছে...</p>
                  ) : historySessions.length === 0 ? (
                    <p className="px-2 py-2 text-xs text-slate-500">এখনো কোনো হিস্ট্রি নেই।</p>
                  ) : (
                    historySessions.slice(0, 30).map((item) => (
                      <button
                        key={item.sessionId}
                        onClick={() => openHistorySession(item.sessionId)}
                        className={[
                          "w-full rounded-lg border px-2.5 py-2 text-left transition",
                          item.sessionId === activeSessionId
                            ? "border-slate-400 bg-slate-100"
                            : "border-slate-200 bg-slate-50 hover:bg-slate-100",
                        ].join(" ")}
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">চ্যাট</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.updatedAt).toLocaleString("bn-BD", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="max-h-[3.75rem] overflow-hidden text-xs leading-5 text-slate-700">{item.title}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {sidebarCompact && (
            <div className="space-y-2">
              {quickPrompts.map((item, i) => (
                <button
                  key={item}
                  onClick={() => handleQuickPrompt(item)}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100"
                  title={item}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 md:hidden">
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              মেনু বন্ধ করুন
            </button>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="chat-scroll flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-4xl px-3 pb-36 pt-6 sm:px-6">
              <div className="space-y-7">
                {messages.map((m) => (
                  <article key={m.id} className="text-[15px] leading-7 sm:text-base sm:leading-8">
                    <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {m.role === "user" ? "আপনি" : "সহকারী"}
                    </div>
                    <div
                      className={[
                        "whitespace-pre-wrap break-words rounded-2xl border px-4 py-3 shadow-sm",
                        m.role === "user"
                          ? "ml-auto max-w-[92%] border-slate-300 bg-white"
                          : "mr-auto max-w-full border-slate-200 bg-slate-50",
                      ].join(" ")}
                    >
                      <FormattedMessage content={m.content} />
                    </div>
                  </article>
                ))}
                {isBusy && <ThinkingLoader phase={loadingPhase === "fetching" ? "fetching" : "typing"} />}
                <div ref={endRef} />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white/80 px-3 pb-4 pt-3 backdrop-blur sm:px-4">
            <form onSubmit={sendMessage} className="mx-auto w-full max-w-3xl">
              <div className="flex items-end gap-2 rounded-2xl border border-slate-300 bg-white p-2 shadow-sm">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isAuthenticated ? "আপনার প্রশ্ন লিখুন..." : "চ্যাট করতে আগে লগইন করুন"}
                  disabled={!isAuthenticated}
                  className="h-12 flex-1 rounded-xl px-3 text-[15px] outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className="h-12 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingPhase === "fetching" ? "ভাবছে..." : loadingPhase === "typing" ? "টাইপ করছে..." : "পাঠান"}
                </button>
              </div>

              {!isAuthenticated ? (
                <div className="mt-2 text-center">
                  <button
                    onClick={() => signIn("google")}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    গুগল দিয়ে লগইন করুন
                  </button>
                </div>
              ) : null}

              {error ? (
                <p className="mt-2 text-center text-xs font-medium text-rose-600">{error}</p>
              ) : (
                <p className="mt-2 text-center text-xs text-slate-500">
                  API মোড চালু আছে। নলেজ ফাইল: <code>data/college-knowledge.json</code>
                </p>
              )}
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}

