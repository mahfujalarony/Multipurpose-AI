import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

type HistoryMessage = {
  role: "user" | "assistant"
  content: string
}

type SessionSummary = {
  sessionId: string
  title: string
  updatedAt: string
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await req.json()) as { messages?: HistoryMessage[]; sessionId?: string }
    const messages = Array.isArray(body.messages) ? body.messages : []
    const sessionId = typeof body.sessionId === "string" && body.sessionId.trim().length > 0 ? body.sessionId.trim() : "default"
    const cleaned = messages
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m) => ({ role: m.role, content: m.content.trim() }))
      .filter((m) => m.content.length > 0)
      .slice(0, 10)

    if (cleaned.length === 0) {
      return NextResponse.json({ ok: true, saved: 0 })
    }

    await Promise.all(
      cleaned.map((m) =>
        prisma.chatHistory.create({
          data: {
            userId: session.user.id,
            sessionId,
            role: m.role,
            content: m.content,
          },
        }),
      ),
    )

    return NextResponse.json({ ok: true, saved: cleaned.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requestedSessionId = req.nextUrl.searchParams.get("sessionId")
    if (requestedSessionId) {
      const items = await prisma.chatHistory.findMany({
        where: { userId: session.user.id, sessionId: requestedSessionId },
        orderBy: { createdAt: "asc" },
        take: 400,
      })
      return NextResponse.json({ items })
    }

    const recent = await prisma.chatHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 1000,
    })

    const sessionMap = new Map<string, SessionSummary>()
    for (const item of recent) {
      const existing = sessionMap.get(item.sessionId)
      if (existing) continue
      const titleSource = item.role === "user" ? item.content : recent.find((x) => x.sessionId === item.sessionId && x.role === "user")?.content || item.content
      const title = titleSource.replace(/\s+/g, " ").slice(0, 70) || "নতুন চ্যাট"
      sessionMap.set(item.sessionId, {
        sessionId: item.sessionId,
        title,
        updatedAt: item.createdAt.toISOString(),
      })
    }

    return NextResponse.json({ sessions: [...sessionMap.values()] })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
