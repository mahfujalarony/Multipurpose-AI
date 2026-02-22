"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

const dashboardLinks = [
  { label: "Overview", href: "/dashboard" },
  { label: "Email", href: "/dashboard/email" },
  { label: "Content", href: "/dashboard/content" },
  { label: "Vision", href: "/dashboard/vision" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("ai-theme") === "dark"
  })

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("ai-theme", dark ? "dark" : "light")
  }, [dark])

  const toggleDark = () => {
    setDark((prev) => !prev)
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="min-h-svh bg-zinc-50 dark:bg-zinc-950">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-zinc-200/60 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 backdrop-blur">
          <div className="h-14 px-4 flex items-center gap-3">
            <SidebarTrigger className="h-9 w-9 rounded-lg border border-zinc-200 dark:border-zinc-800" />

            <Link href="/" className="font-semibold text-zinc-900 dark:text-zinc-100">
              Multipurpose<span className="text-indigo-500">AI</span>
            </Link>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={toggleDark}
                className="h-9 w-9 rounded-lg border border-zinc-200 dark:border-zinc-800 text-base"
                aria-label="Toggle dark mode"
              >
                {dark ? "☀️" : "🌙"}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <nav className="px-4 pb-3 flex gap-2 overflow-x-auto">
            {dashboardLinks.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/dashboard" && pathname.startsWith(link.href))

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    "px-3 py-1.5 rounded-full text-sm font-medium border whitespace-nowrap transition-colors",
                    active
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-transparent text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </header>

        {/* Content */}
        <main className="p-4 md:p-6 max-w-7xl mx-auto w-full">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
