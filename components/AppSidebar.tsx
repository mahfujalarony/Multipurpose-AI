"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  { title: "Chat", href: "/dashboard/chat", emoji: "*" },
  { title: "Settings", href: "/dashboard/settings", emoji: "o" },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r-0">
      <style>{`
        [data-sidebar="sidebar"] {
          background: #ffffff;
          border-right: 1px solid #f0f0f8;
          font-family: 'DM Sans', sans-serif;
        }
        .dark [data-sidebar="sidebar"] {
          background: #0d0d18;
          border-right: 1px solid #1a1a2e;
        }
        [data-sidebar="menu-button"] {
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.2s ease;
          padding: 8px 12px;
          gap: 10px;
        }
        .dark [data-sidebar="menu-button"] {
          color: #6b6b8a;
        }
        [data-sidebar="menu-button"]:hover {
          background: #f5f5ff;
          color: #4f46e5;
        }
        .dark [data-sidebar="menu-button"]:hover {
          background: rgba(99,102,241,0.08);
          color: #a5b4fc;
        }
        [data-sidebar="menu-button"][data-active="true"] {
          background: linear-gradient(135deg, #eef2ff, #f5f3ff);
          color: #4f46e5;
          font-weight: 700;
          box-shadow: inset 2px 0 0 #6366f1;
        }
        .dark [data-sidebar="menu-button"][data-active="true"] {
          background: rgba(99,102,241,0.15);
          color: #a5b4fc;
          box-shadow: inset 2px 0 0 #6366f1;
        }
        [data-sidebar="group-label"] {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #c4c4d4;
          padding: 0 12px;
          margin-bottom: 4px;
        }
        .dark [data-sidebar="group-label"] { color: #3a3a5a; }
      `}</style>

      <SidebarHeader className="px-5 py-5">
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            *
          </div>
          <div>
            <p
              className="text-sm font-extrabold tracking-tight leading-none"
              style={{ fontFamily: "'Syne', sans-serif", color: "inherit" }}
            >
              Multipurpose<span style={{ color: "#6366f1" }}>AI</span>
            </p>
            <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#a0a0c0" }}>
              Creator Workspace
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link href={item.href} className="flex items-center gap-3">
                        <span
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
                          style={{
                            background: active
                              ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                              : "rgba(99,102,241,0.08)",
                            color: active ? "#fff" : "#6366f1",
                          }}
                        >
                          {item.emoji}
                        </span>
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-4">
        <div
          className="flex items-center gap-3 rounded-xl px-3 py-3"
          style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.1)" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate" style={{ color: "inherit" }}>User Name</p>
            <p className="text-[10px]" style={{ color: "#a0a0c0" }}>Pro Plan</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
