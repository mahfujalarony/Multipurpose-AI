"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

const toolCards = [
  { title: "Email Studio", desc: "Cold outreach, support replies, and campaign drafts.", href: "/dashboard/email", emoji: "✉", stat: "128", statLabel: "drafts this month" },
  { title: "Content Studio", desc: "SEO blog outlines, intros, and full article blocks.", href: "/dashboard/content", emoji: "✦", stat: "42", statLabel: "content pieces" },
  { title: "Vision Studio", desc: "Social media creatives and ad-ready visual sets.", href: "/dashboard/vision", emoji: "◉", stat: "19", statLabel: "image sets" },
  { title: "Dev Toolkit", desc: "Code generation, debugging, and review snippets.", href: "/dashboard/dev", emoji: "⚡", stat: "67", statLabel: "code snippets" },
]

const recentTasks = [
  { name: "Launch email sequence — Q2 campaign", status: "Completed", module: "Email Studio", emoji: "✉", time: "2 hrs ago" },
  { name: "Blog: AI workflow in 2026", status: "In Review", module: "Content Studio", emoji: "✦", time: "5 hrs ago" },
  { name: "Instagram carousel concept", status: "Queued", module: "Vision Studio", emoji: "◉", time: "Yesterday" },
  { name: "Fix auth hook — useSession bug", status: "Completed", module: "Dev Toolkit", emoji: "⚡", time: "Yesterday" },
  { name: "Sales page rewrite — pricing section", status: "In Progress", module: "Content Studio", emoji: "✦", time: "2 days ago" },
]

const badge = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
    case "In Review":
      return "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20"
    case "In Progress":
      return "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20"
    default:
      return "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20"
  }
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"all" | "completed" | "pending">("all")

  const filtered = useMemo(() => {
    return recentTasks.filter((t) => {
      if (activeTab === "completed") return t.status === "Completed"
      if (activeTab === "pending") return t.status !== "Completed"
      return true
    })
  }, [activeTab])

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <section className="rounded-2xl p-6 sm:p-7 text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600">
        <p className="text-white/70 text-sm">Good morning 👋</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">Your AI Workspace</h1>
        <p className="text-white/80 text-sm mt-2 max-w-xl">
          You&apos;ve generated <span className="font-semibold text-white">328</span> outputs this month.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3 max-w-lg">
          <div className="rounded-xl bg-white/10 border border-white/15 p-3">
            <div className="text-xl font-extrabold">328</div>
            <div className="text-xs text-white/70">Generations</div>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/15 p-3">
            <div className="text-xl font-extrabold">5</div>
            <div className="text-xs text-white/70">Active tasks</div>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/15 p-3">
            <div className="text-xl font-extrabold">3×</div>
            <div className="text-xs text-white/70">Faster</div>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Quick actions</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/dashboard/email" className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/70 transition">
            <div className="text-xl">✉</div>
            <div className="mt-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">New Email Draft</div>
          </Link>

          <Link href="/dashboard/content" className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/70 transition">
            <div className="text-xl">✦</div>
            <div className="mt-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">Write Blog Post</div>
          </Link>

          <Link href="/dashboard/vision" className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/70 transition">
            <div className="text-xl">◉</div>
            <div className="mt-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">Generate Image</div>
          </Link>

          <Link href="/dashboard/dev" className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/70 transition">
            <div className="text-xl">⚡</div>
            <div className="mt-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">Generate Code</div>
          </Link>
        </div>
      </section>

      {/* Studios */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-3">Studios</h2>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {toolCards.map((tool) => (
            <div
              key={tool.title}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
            >
              <div className="flex items-center justify-between">
                <div className="text-xl">{tool.emoji}</div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">{tool.stat}</div>
                  <div className="text-xs text-zinc-500">{tool.statLabel}</div>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{tool.title}</div>
                <div className="text-xs text-zinc-500 mt-1">{tool.desc}</div>
              </div>

              <Link
                href={tool.href}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/70 transition"
              >
                Open → 
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Recent activity</h2>

          <div className="flex items-center gap-2">
            {(["all", "completed", "pending"] as const).map((t) => {
              const active = activeTab === t
              return (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={[
                    "text-xs font-semibold px-3 py-1.5 rounded-full border transition",
                    active
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/70",
                  ].join(" ")}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filtered.map((item) => (
              <div key={item.name} className="p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-sm">
                  {item.emoji}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{item.name}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{item.module} • {item.time}</div>
                </div>

                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge(item.status)}`}>
                  {item.status}
                </span>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="p-10 text-center text-sm text-zinc-500">No tasks found.</div>
            )}
          </div>

          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
            <Link href="/dashboard/tasks" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              View all tasks →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}