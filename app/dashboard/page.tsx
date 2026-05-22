"use client"

import Link from "next/link"

const tools = [
  {
    title: "Email Studio",
    desc: "Draft cold outreach, follow-ups, newsletters, and support replies.",
    href: "/dashboard/email",
    icon: "✉",
    action: "Write email",
  },
  {
    title: "Content Studio",
    desc: "Create blogs, landing copy, social posts, and SEO metadata.",
    href: "/dashboard/content",
    icon: "✦",
    action: "Create content",
  },
  {
    title: "Vision Studio",
    desc: "Generate visuals, social creatives, and product images.",
    href: "/dashboard/vision",
    icon: "◉",
    action: "Generate image",
  },
  {
    title: "Dev Toolkit",
    desc: "Generate code, debug issues, review snippets, and explain logic.",
    href: "/dashboard/dev",
    icon: "⚡",
    action: "Open toolkit",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl p-6 sm:p-7 text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600">
        <p className="text-white/70 text-sm">Welcome</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">Your AI Workspace</h1>
        <p className="text-white/80 text-sm mt-2 max-w-xl">
          Choose a studio and generate real output with your OpenAI API key.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-3">Tools</h2>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <article
              key={tool.title}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
            >
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-lg">
                {tool.icon}
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{tool.title}</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{tool.desc}</p>
              </div>

              <Link
                href={tool.href}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/70 transition"
              >
                {tool.action}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Activity</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Generated outputs will appear here once history tracking is connected.
        </p>
      </section>
    </div>
  )
}
