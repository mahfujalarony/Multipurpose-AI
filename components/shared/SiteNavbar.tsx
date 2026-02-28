"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"

type SiteNavbarProps = {
  actionLabel: string
  actionHref?: string
  onActionClick?: () => void
  onMenuClick?: () => void
}

export default function SiteNavbar({ actionLabel, actionHref, onActionClick, onMenuClick }: SiteNavbarProps) {
  const { data: session, status } = useSession()
  const isLoggedIn = status === "authenticated"
  const [openMenu, setOpenMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return
      const target = event.target as Node
      if (!menuRef.current.contains(target)) {
        setOpenMenu(false)
      }
    }

    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  const profileImage = session?.user?.image || ""
  const profileInitial = (session?.user?.name?.[0] || "U").toUpperCase()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {onMenuClick ? (
            <button
              onClick={onMenuClick}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium md:hidden"
            >
              মেনু
            </button>
          ) : null}

          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="কিশোরগঞ্জ পলিটেকনিক লোগো" width={40} height={40} className="rounded-md" />
            <div>
              <p className="text-sm font-semibold leading-none sm:text-base">কিশোরগঞ্জ পলিটেকনিক ইনস্টিটিউট</p>
              <p className="text-xs text-slate-500">Karimganj, Kishoreganj</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://kishoreganj.polytech.gov.bd/"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
          >
            অফিসিয়াল ওয়েবসাইট
          </a>

          {actionHref ? (
            <Link
              href={actionHref}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onActionClick}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {actionLabel}
            </button>
          )}

          {isLoggedIn ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpenMenu((prev) => !prev)}
                className="h-10 w-10 overflow-hidden rounded-full border border-slate-300 bg-white shadow-sm transition hover:ring-2 hover:ring-slate-200"
                title="প্রোফাইল মেনু"
              >
                {profileImage ? (
                  <Image src={profileImage} alt="User" width={40} height={40} className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full w-full place-items-center text-sm font-bold text-slate-700">{profileInitial}</span>
                )}
              </button>

              {openMenu ? (
                <div className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  <Link
                    href="/chat"
                    onClick={() => setOpenMenu(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    হিস্ট্রি
                  </Link>
                  <button
                    onClick={() => {
                      setOpenMenu(false)
                      void signOut({ callbackUrl: "/" })
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    লগআউট
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              লগইন / রেজিস্টার
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
