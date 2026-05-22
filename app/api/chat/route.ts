import { createHash } from "crypto"
import { readFile } from "fs/promises"
import path from "path"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import OpenAI from "openai"
import prisma from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

type Role = "user" | "assistant"

type IncomingMessage = {
  role: Role
  content: string
}

type KnowledgeItem = {
  id: string
  title: string
  content: string
  tags?: string[]
}

type StoredChunk = {
  sourceId: string
  title: string
  content: string
  tags: string[]
  checksum: string
  embedding: number[]
}

type ContactRecord = {
  name: string
  mobile?: string
  email?: string
  source: string
}

const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini"
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small"
const SYNC_INTERVAL_MS = 5 * 60 * 1000
const CHUNK_COLLECTION = "KnowledgeChunk"
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 20
const OPENAI_TIMEOUT_MS = 35000
const OPENAI_FALLBACK_TIMEOUT_MS = 25000
const MAX_CONTEXT_CHARS_PER_CHUNK = 1200
const FAST_FALLBACK_MODEL = process.env.OPENAI_FALLBACK_MODEL || "gpt-4o-mini"

const NAME_ALIASES: Record<string, string> = {
  tania: "tahmina akter",
  taniya: "tahmina akter",
  "তানিয়া": "tahmina akter",
  "তাহমিনা": "tahmina akter",
  tahmina: "tahmina akter",
  tarmina: "tahmina akter",
  "tania mem": "tahmina akter",
  "tahmina mem": "tahmina akter",
  "তাহমিনা ম্যাম": "tahmina akter",
  "তানিয়া ম্যাম": "tahmina akter",
  "lija mem": "sabikunnahar liza",
  "liza mem": "sabikunnahar liza",
  "লাইজা": "sabikunnahar liza",
  "লাইজা ম্যাম": "sabikunnahar liza",
  lija: "sabikunnahar liza",
  liza: "sabikunnahar liza",
  "সাবিকুন্নাহার": "sabikunnahar liza",
  "সাবিকুন্নাহার লিজা": "sabikunnahar liza",
  "লিজা ম্যাম": "sabikunnahar liza",
  rafiq: "rafiqul islam",
  "rafiq sir": "rafiqul islam",
  "রফিক": "rafiqul islam",
  "রফিকুল": "rafiqul islam",
  shahab: "shahab uddin shihab",
  shihab: "shahab uddin shihab",
  "শাহাব": "shahab uddin shihab",
  "শিহাব": "shahab uddin shihab",
  mamun: "md mamonur rashid",
  mamon: "md mamonur rashid",
  "মামুন": "md mamonur rashid",
  "মামুনুর": "md mamonur rashid",
  biplob: "biplob kumar sarkar",
  "বিপ্লব": "biplob kumar sarkar",
  razuanul: "rezwanul islam",
  "রেজওয়ান": "rezwanul islam",
  "রেজওয়ানুল": "rezwanul islam",
  khaled: "khaled hasan shihab",
  "খালিদ": "khaled hasan shihab",
  nasrin: "nasrin",
  "নাসরিন": "nasrin",
  mahbub: "md mahbubur rahman",
  "মাহবুব": "md mahbubur rahman",
}

let lastSyncAt = 0
let syncPromise: Promise<void> | null = null
const ipRateLimit = new Map<string, { count: number; resetAt: number }>()
const BN_DIGIT_MAP: Record<string, string> = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
}

function toAsciiDigits(text: string) {
  return text.replace(/[০-৯]/g, (d) => BN_DIGIT_MAP[d] || d)
}

function sha256(text: string) {
  return createHash("sha256").update(text).digest("hex")
}

function getClientIp(req: NextRequest) {
  const xff = req.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  return req.headers.get("x-real-ip") || "unknown"
}

function isRateLimited(ip: string) {
  const now = Date.now()
  const current = ipRateLimit.get(ip)
  if (!current || now > current.resetAt) {
    ipRateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }
  if (current.count >= RATE_LIMIT_MAX_REQUESTS) return true
  current.count += 1
  ipRateLimit.set(ip, current)
  return false
}

async function loadKnowledgeFile() {
  const filePath = path.join(process.cwd(), "data", "college-knowledge.json")
  const raw = await readFile(filePath, "utf-8")
  const parsed = JSON.parse(raw) as { items?: KnowledgeItem[] }
  return Array.isArray(parsed.items) ? parsed.items : []
}

function normalizeMessages(messages: IncomingMessage[]) {
  return messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.trim() }))
    .filter((m) => m.content.length > 0)
    .slice(-12)
}

function normalizeText(text: string) {
  return toAsciiDigits(text)
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09ff\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function normalizePhone(text: string) {
  const ascii = toAsciiDigits(text)
  const hasPlus = ascii.trim().startsWith("+")
  const digits = ascii.replace(/\D/g, "")
  if (!digits) return ""
  return hasPlus ? `+${digits}` : digits
}

function extractEmails(text: string) {
  const found = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []
  return [...new Set(found.map((x) => x.toLowerCase()))]
}

function extractPhones(text: string) {
  const ascii = toAsciiDigits(text)
  const found = ascii.match(/(?:\+?\d[\d\s-]{7,}\d)/g) || []
  return [...new Set(found.map((x) => normalizePhone(x)).filter((x) => x.length >= 8))]
}

function cosineSimilarity(a: number[], b: number[]) {
  if (a.length !== b.length || a.length === 0) return 0
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (!normA || !normB) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

function levenshteinDistance(a: string, b: string) {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i += 1) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= n; j += 1) {
      const tmp = dp[j]
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost)
      prev = tmp
    }
  }
  return dp[n]
}

function similarityScore(a: string, b: string) {
  if (!a || !b) return 0
  if (a === b) return 1
  if (a.includes(b) || b.includes(a)) return 0.92
  const dist = levenshteinDistance(a, b)
  return 1 - dist / Math.max(a.length, b.length)
}

function expandQueryForRetrieval(query: string) {
  const q = normalizeText(query)
  const extra: string[] = []

  if (q.includes("shikkok") || q.includes("sikkok") || q.includes("teacher") || q.includes("??????")) {
    extra.push("instructor", "junior instructor", "chief instructor", "teacher", "staff")
  }
  if (q.includes("kotojon") || q.includes("kotjon") || q.includes("how many") || q.includes("????")) {
    extra.push("count", "total")
  }
  if (q.includes("admission") || q.includes("?????")) {
    extra.push("admission", "merit", "eligibility")
  }
  if (q.includes("upadhokkho") || q.includes("?????????") || q.includes("vice principal")) {
    extra.push("vice principal", "leadership")
  }

  return `${query} ${extra.join(" ")}`.trim()
}

function isTeacherCountQuestion(query: string) {
  const q = normalizeText(query)
  const asksCount =
    q.includes("kotojon") ||
    q.includes("kotjon") ||
    q.includes("how many") ||
    q.includes("count") ||
    q.includes("mot") ||
    q.includes("total") ||
    q.includes("????")
  const asksTeacher =
    q.includes("shikkok") ||
    q.includes("sikkok") ||
    q.includes("teacher") ||
    q.includes("techer") ||
    q.includes("teachar") ||
    q.includes("ticher") ||
    q.includes("sir") ||
    q.includes("madam") ||
    q.includes("??????") ||
    q.includes("instructor")
  return asksCount && asksTeacher
}

function isTeacherListQuestion(query: string) {
  const q = normalizeText(query)
  const asksList =
    q.includes("list") ||
    q.includes("talika") ||
    q.includes("nam") ||
    q.includes("name") ||
    q.includes("der")
  const asksTeacher =
    q.includes("teacher") ||
    q.includes("techer") ||
    q.includes("teachar") ||
    q.includes("ticher") ||
    q.includes("shikkok") ||
    q.includes("sikkok") ||
    q.includes("instructor") ||
    q.includes("sir") ||
    q.includes("madam")
  return asksList && asksTeacher
}

function parseRequestedCount(query: string) {
  const ascii = toAsciiDigits(query)
  const m = ascii.match(/\b(\d{1,3})\b/)
  if (!m?.[1]) return 0
  const n = Number(m[1])
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.min(n, 200)
}

function uniqueContactsByName(records: ContactRecord[]) {
  const best = new Map<string, ContactRecord>()
  for (const r of records) {
    const key = normalizePersonKey(r.name)
    if (!key) continue
    const prev = best.get(key)
    if (!prev) {
      best.set(key, r)
      continue
    }
    const prevScore = (prev.mobile ? 1 : 0) + (prev.email ? 1 : 0)
    const newScore = (r.mobile ? 1 : 0) + (r.email ? 1 : 0)
    if (newScore > prevScore) best.set(key, r)
  }
  return [...best.values()]
}

function isStudentCountQuestion(query: string) {
  const q = normalizeText(query)
  const asksCount =
    q.includes("kotojon") ||
    q.includes("kotjon") ||
    q.includes("how many") ||
    q.includes("count") ||
    q.includes("mot") ||
    q.includes("total")
  const asksStudent =
    q.includes("student") ||
    q.includes("students") ||
    q.includes("shikkharthi") ||
    q.includes("sikkharthi") ||
    q.includes("chatro") ||
    q.includes("chatri")
  return asksCount && asksStudent
}

function extractStudentCountFromChunks(chunks: StoredChunk[]) {
  for (const chunk of chunks) {
    const text = `${chunk.title}. ${chunk.content}`
    const m =
      text.match(/(?:total students|student[s]?:?)\s*[:=]?\s*([0-9][0-9,]{1,8})/i) ||
      text.match(/(?:শিক্ষার্থী|student)\s*[:=]?\s*([0-9][0-9,]{1,8})/i)
    if (m?.[1]) {
      const raw = m[1].replace(/,/g, "")
      const n = Number(raw)
      if (Number.isFinite(n) && n > 0) return n
    }
  }
  return 0
}

function isContactLookupQuestion(query: string) {
  const q = normalizeText(query)
  return (
    q.includes("number") ||
    q.includes("nambar") ||
    q.includes("nmbr") ||
    q.includes("num") ||
    q.includes("mail") ||
    q.includes("gmail") ||
    q.includes("email") ||
    q.includes("mobile") ||
    q.includes("phone") ||
    q.includes("whatsapp") ||
    q.includes("fb") ||
    q.includes("facebook") ||
    q.includes("contact") ||
    q.includes("???????") ||
    q.includes("???") ||
    q.includes("??????") ||
    q.includes("???????")
  )
}

function extractNameHint(query: string) {
  const q = normalizeText(query)
  const stop = new Set([
    "number", "num", "mobile", "phone", "contact", "dau", "dao", "den", "de", "ta", "er",
    "mail", "email", "gmail", "whatsapp", "fb", "facebook",
    "mem", "madam", "sir", "teacher", "shikkok", "shikkhak", "namber", "name", "list", "talika",
    "tar", "tader", "id", "info", "details", "please",
    "sir", "sirr", "madam", "maam", "mam", "miss",
    "স্যার", "ম্যাম", "ম্যামের", "স্যারের",
    "???????", "???", "??????", "???????", "kishoreganj", "kishoregonj", "polytechnic", "politecnic", "institute",
  ])

  const tokens = q
    .split(" ")
    .map((t) => t.replace(/^['"`]+|['"`]+$/g, ""))
    .filter((t) => t && !stop.has(t))

  const base = tokens.join(" ").trim()

  if (!base) return ""
  if (NAME_ALIASES[base]) return NAME_ALIASES[base]

  const one = tokens.find((t) => NAME_ALIASES[t])
  if (one) return NAME_ALIASES[one]
  return base
}

function normalizePersonKey(text: string) {
  return normalizeText(text)
    .replace(/\b(md|mo|mohammad|mohammed|mr|mrs|ms|dr|eng|sir|madam|mem|mam)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function phoneticKey(text: string) {
  const key = normalizePersonKey(text)
    .replace(/[aeiou]/g, "")
    .replace(/ph/g, "f")
    .replace(/ck/g, "k")
    .replace(/sh/g, "s")
    .replace(/bh/g, "b")
    .replace(/kh/g, "k")
    .replace(/th/g, "t")
    .replace(/dh/g, "d")
    .replace(/zh/g, "j")
    .replace(/\s+/g, " ")
    .trim()
  return key
}

function extractRecentNameFromMessages(messages: IncomingMessage[]) {
  const recent = [...messages].reverse().slice(0, 8)
  for (const m of recent) {
    const text = m.content
    const fromBangla = text.match(/(?:নাম|name)\s*[:：]\s*\**([A-Za-z][A-Za-z .'-]{2,80})\**/i)
    if (fromBangla?.[1]) return fromBangla[1].trim()

    const fromContactLine = text.match(/\b([A-Za-z][A-Za-z .'-]{2,80})\s*[:,-]\s*(?:Instructor|Chief Instructor|Junior Instructor|Mobile|Email)/i)
    if (fromContactLine?.[1]) return fromContactLine[1].trim()
  }
  return ""
}

function isFacebookQuery(text: string) {
  const q = normalizeText(text)
  return q.includes("facebook") || q.includes("fb")
}

function asksPronounTarget(text: string) {
  const q = normalizeText(text)
  return q.includes("tar") || q.includes("his") || q.includes("her") || q.includes("or")
}

function isCreatorFollowupIdQuery(query: string) {
  const q = normalizeText(query)
  const asksId = q.includes("id") || q.includes("facebook") || q.includes("fb")
  const pronounLike =
    q.includes("ata") ||
    q.includes("eta") ||
    q.includes("eita") ||
    q.includes("oita") ||
    q.includes("kar") ||
    q.includes("whose") ||
    q.includes("this")
  return asksId && pronounLike
}

function isCreatorFollowupContactQuery(query: string) {
  const q = normalizeText(query)
  const asksContact =
    q.includes("number") ||
    q.includes("nambar") ||
    q.includes("num") ||
    q.includes("mobile") ||
    q.includes("phone") ||
    q.includes("email") ||
    q.includes("mail") ||
    q.includes("contact")
  const pronounLike =
    q.includes("tar") ||
    q.includes("ata") ||
    q.includes("eta") ||
    q.includes("eita") ||
    q.includes("oita") ||
    q.includes("or") ||
    q.includes("his") ||
    q.includes("her")
  return asksContact && pronounLike
}

function hasRecentCreatorContext(recentContext: string) {
  const rc = normalizeText(recentContext)
  return (
    rc.includes("creator") ||
    rc.includes("mahfuj alam rony") ||
    rc.includes("chatbot creator profile") ||
    rc.includes("facebook com mahaphuja") ||
    rc.includes("facebook com aphridi")
  )
}

function isExplicitCreatorNameQuery(query: string) {
  const q = normalizeText(query)
  return (
    q.includes("mahfuj") ||
    q.includes("mahfuz") ||
    q.includes("alam rony") ||
    q.includes("mahfuj alam rony") ||
    q.includes("rony")
  )
}

function isCreatorSummaryQuery(query: string) {
  const q = normalizeText(query)
  const asksAbout =
    q.includes("somporke") ||
    q.includes("about") ||
    q.includes("summary") ||
    q.includes("bio") ||
    q.includes("profile") ||
    q.includes("porichoy")
  const creatorRef =
    q.includes("mahfuj") ||
    q.includes("mahfuz") ||
    q.includes("rony") ||
    q.includes("creator") ||
    q.includes("banayce") ||
    q.includes("banayse") ||
    q.includes("made by")
  return asksAbout && creatorRef
}

function isCreatorIdentityQuery(query: string) {
  const q = normalizeText(query)
  const creatorRef =
    q.includes("mahfuj") ||
    q.includes("mahfuz") ||
    q.includes("rony") ||
    q.includes("mahfuj alam rony")
  const asksWho = q.includes("ke") || q.includes("who")
  return creatorRef && asksWho
}

function extractContactRecords(chunks: StoredChunk[]) {
  const records: ContactRecord[] = []
  const seen = new Set<string>()

  for (const chunk of chunks) {
    const prepared = chunk.content.replace(/\b(Md|Mr|Mrs|Ms|Dr|Moha)\.\s/gi, "$1 ")
    const segments = prepared
      .split(/\.\s+(?=[A-Z][A-Za-z .()'/-]{2,90}\s*[-:])/)
      .map((x) => x.trim())
      .filter(Boolean)

    for (const segment of segments) {
      const hasContactSignal = /(mobile|phone|email|contact|office phone)/i.test(segment)
      if (!hasContactSignal) continue

      const nameFromDash = segment.match(/^([A-Za-z][A-Za-z .()'/-]{2,90})\s*-\s*/)
      const nameFromLabel = segment.match(/^(?:name|principal|vice principal|registrar|librarian)\s*:\s*([A-Za-z][A-Za-z .()'/-]{2,90})/i)
      const name = (nameFromDash?.[1] || nameFromLabel?.[1] || "").replace(/\s+/g, " ").trim()
      if (!name) continue

      const emails = extractEmails(segment)
      const phones = extractPhones(segment)
      const mobile = phones[0]
      const email = emails[0]
      if (!mobile && !email) continue

      const key = `${normalizeText(name)}|${mobile || ""}|${email || ""}`
      if (seen.has(key)) continue
      seen.add(key)

      records.push({
        name,
        mobile,
        email,
        source: chunk.title,
      })
    }
  }

  return records
}

function findContactByDirectValue(records: ContactRecord[], query: string) {
  const queryEmails = extractEmails(query)
  if (queryEmails.length > 0) {
    const emailSet = new Set(queryEmails)
    const directByEmail = records.find((r) => r.email && emailSet.has(r.email.toLowerCase()))
    if (directByEmail) return directByEmail
  }

  const queryPhones = extractPhones(query)
  if (queryPhones.length > 0) {
    const phoneSet = new Set(queryPhones)
    const directByPhone = records.find((r) => r.mobile && phoneSet.has(normalizePhone(r.mobile)))
    if (directByPhone) return directByPhone
  }

  return null
}

function findBestContactMatch(records: ContactRecord[], query: string) {
  const hint = extractNameHint(query)
  if (!hint) return null

  const hintNorm = normalizePersonKey(hint)
  const hintPhone = phoneticKey(hint)
  const hintTokens = hintNorm.split(" ").filter((x) => x.length >= 2)
  if (hintTokens.length === 0) return null

  let best: (ContactRecord & { score: number }) | null = null
  for (const r of records) {
    const nameNorm = normalizePersonKey(r.name)
    const namePhone = phoneticKey(r.name)
    let scoreSum = 0
    let strongHitCount = 0

    for (const token of hintTokens) {
      if (nameNorm.includes(token)) {
        scoreSum += 1
        strongHitCount += 1
      } else {
        const parts = nameNorm.split(" ").filter(Boolean)
        const bestPart = parts.reduce((mx, p) => Math.max(mx, similarityScore(token, p)), 0)
        if (bestPart > 0.8) scoreSum += bestPart
        if (bestPart > 0.9) strongHitCount += 1
      }
    }

    const phraseScore = similarityScore(hintNorm, nameNorm)
    const phoneScore = similarityScore(hintPhone, namePhone)
    const finalScore = (scoreSum / hintTokens.length) * 0.6 + phraseScore * 0.25 + phoneScore * 0.15
    const requiredStrongHits = hintTokens.length >= 3 ? 2 : 1
    if ((strongHitCount >= requiredStrongHits || phoneScore > 0.86) && finalScore > 0.58 && (!best || finalScore > best.score)) {
      best = { ...r, score: finalScore }
    }
  }

  return best
}

function isCreatorIntent(query: string) {
  const q = normalizeText(query)
  const asksWho = q.includes("ke") || q.includes("who")
  const asksBuild =
    q.includes("banay") ||
    q.includes("banai") ||
    q.includes("baniye") ||
    q.includes("banayce") ||
    q.includes("banyce") ||
    q.includes("banayse") ||
    q.includes("banaise") ||
    q.includes("toiri")
  const refersBot =
    q.includes("tomake") ||
    q.includes("amake") ||
    q.includes("chatbot") ||
    q.includes("site") ||
    q.includes("app") ||
    q.includes("eta") ||
    q.includes("eitake")

  return (
    q.includes("creator") ||
    q.includes("who made") ||
    q.includes("made by") ||
    q.includes("developed by") ||
    (asksWho && asksBuild) ||
    (asksWho && refersBot)
  )
}

function isInstituteIntent(query: string) {
  const q = normalizeText(query)
  return (
    q.includes("kishoreganj") ||
    q.includes("kishoregonj") ||
    q.includes("polytechnic") ||
    q.includes("politecnic") ||
    q.includes("bteb") ||
    q.includes("admission") ||
    q.includes("?????") ||
    q.includes("???????") ||
    q.includes("?????????") ||
    q.includes("upadhokkho") ||
    q.includes("upadhakko") ||
    q.includes("principal") ||
    q.includes("vice principal") ||
    q.includes("??????") ||
    q.includes("shikkok") ||
    q.includes("instructor")
  )
}

function tokenize(text: string) {
  return normalizeText(text)
    .split(" ")
    .filter((t) => t.length >= 2)
}

function keywordScore(query: string, chunk: StoredChunk) {
  const qTokens = tokenize(query)
  if (qTokens.length === 0) return 0
  const hay = normalizeText(`${chunk.title} ${chunk.tags.join(" ")} ${chunk.content}`)
  let hit = 0
  for (const t of qTokens) {
    if (hay.includes(t)) hit += 1
  }
  return hit / qTokens.length
}

function isNoticeRoutineSummaryQuery(query: string) {
  const q = normalizeText(query)
  const noticeLike =
    q.includes("notice") ||
    q.includes("notish") ||
    q.includes("routine") ||
    q.includes("rutin") ||
    q.includes("exam") ||
    q.includes("porikkha") ||
    q.includes("result")
  const summaryLike =
    q.includes("summary") ||
    q.includes("saransho") ||
    q.includes("short") ||
    q.includes("recent") ||
    q.includes("latest") ||
    q.includes("sampotik")
  return noticeLike || (noticeLike && summaryLike)
}

function isInstituteOverviewQuery(query: string) {
  const q = normalizeText(query)
  const hasInstitute =
    q.includes("kishoreganj") ||
    q.includes("kishoregonj") ||
    q.includes("polytechnic") ||
    q.includes("politecnic") ||
    q.includes("কিশোরগঞ্জ")
  const asksOverview =
    q.includes("somporke") ||
    q.includes("about") ||
    q.includes("bolo") ||
    q.includes("janate") ||
    q.includes("jano") ||
    q.includes("overview") ||
    q.includes("এক নজরে")
  return hasInstitute && asksOverview
}

function isGeneralInfoQuery(query: string) {
  const q = normalizeText(query)
  return (
    q.includes("somporke") ||
    q.includes("about") ||
    q.includes("jano") ||
    q.includes("bolo") ||
    q.includes("overview") ||
    q.includes("ek nojore")
  )
}

function isDataAvailabilityQuery(query: string) {
  const q = normalizeText(query)
  const asksData =
    q.includes("totto") ||
    q.includes("totto") ||
    q.includes("data") ||
    q.includes("info") ||
    q.includes("information")
  const asksHave =
    q.includes("tomar kace") ||
    q.includes("tomar kase") ||
    q.includes("ache") ||
    q.includes("ase") ||
    q.includes("ki ki") ||
    q.includes("kader kader") ||
    q.includes("available")
  return asksData && asksHave
}

function summarizeAvailableData(chunks: StoredChunk[]) {
  const hasOverview = chunks.some((c) => /overview|institute|campus|department|contact|hostel|uniform/i.test(`${c.title} ${c.tags.join(" ")}`))
  const hasPeople = chunks.some((c) => /instructor|teacher|staff|principal|vice principal|leadership/i.test(`${c.title} ${c.tags.join(" ")}`))
  const hasRoutine = chunks.some((c) => /routine|practical|exam|semester/i.test(`${c.title} ${c.tags.join(" ")}`))
  const hasNotice = chunks.some((c) => /notice|job fair|bteb/i.test(`${c.title} ${c.tags.join(" ")}`))

  const lines: string[] = []
  if (hasOverview) lines.push("1. প্রতিষ্ঠানের পরিচিতি, অবস্থান, বিভাগ, ক্যাম্পাস সুবিধা")
  if (hasPeople) lines.push("2. অধ্যক্ষ/উপাধ্যক্ষ, শিক্ষক-ইন্সট্রাক্টর ও স্টাফের তথ্য (যেখানে পাওয়া গেছে)")
  if (hasRoutine) lines.push("3. পরীক্ষার রুটিন ও প্র্যাকটিক্যাল সময়সূচী (CST/Electronics/RAC/Food)")
  if (hasNotice) lines.push("4. নোটিশ, জব ফেয়ার, BTEB আপডেট ও সেমিস্টার প্ল্যান")
  return lines.join("\n")
}

function selectContextChunks(query: string, rankedChunks: Array<StoredChunk & { score: number }>) {
  const isNoticeRoutine = isNoticeRoutineSummaryQuery(query)
  const isOverview = isInstituteOverviewQuery(query)
  const reRanked = rankedChunks
    .map((c) => {
      const keyScore = keywordScore(query, c)
      const recencyBoost = /2026|2025|notice|routine|exam|job fair|semester plan/i.test(`${c.title} ${c.content}`) ? 0.08 : 0
      const topicBoost = isNoticeRoutine && /notice|routine|exam|bteb|semester|practical/i.test(`${c.title} ${c.tags.join(" ")} ${c.content}`) ? 0.18 : 0
      const overviewBoost = isOverview && /overview|campus|department|contact|hostel|uniform|location|facility|infrastructure/i.test(`${c.title} ${c.tags.join(" ")} ${c.content}`) ? 0.15 : 0
      return { ...c, finalScore: c.score * 0.6 + keyScore * 0.4 + recencyBoost + topicBoost + overviewBoost }
    })
    .sort((a, b) => b.finalScore - a.finalScore)

  if (isOverview) {
    const prioritySourceIds = new Set([
      "kpi-overview",
      "kpi-location-campus",
      "kpi-main-campus-infra",
      "kpi-departments",
      "kpi-contact",
      "kpi-hostel",
      "kpi-leadership-and-chief-instructors-2024",
    ])
    const mustInclude = reRanked.filter((c) => prioritySourceIds.has(c.sourceId))
    const picked = [...mustInclude.slice(0, 5)]
    for (const c of reRanked) {
      if (picked.length >= 8) break
      if (!picked.find((x) => x.sourceId === c.sourceId)) picked.push(c)
    }
    return picked
  }

  if (isNoticeRoutine) {
    return reRanked.slice(0, 6)
  }
  return reRanked.slice(0, 5)
}

function trimChunkContent(content: string) {
  if (content.length <= MAX_CONTEXT_CHARS_PER_CHUNK) return content
  return `${content.slice(0, MAX_CONTEXT_CHARS_PER_CHUNK)}...`
}

function firstSnippet(text: string, max = 180) {
  const clean = text.replace(/\s+/g, " ").trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max)}...`
}

function extractDateHint(text: string) {
  const m = text.match(/\b(?:\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|20\d{2})\b/)
  return m?.[0] || ""
}

type RoutineEntry = {
  date: string
  time: string
  semester: string
  subject: string
  lab: string
  examiner: string
}

function parseRoutineEntriesFromText(text: string): RoutineEntry[] {
  const entries: RoutineEntry[] = []
  const normalized = text.replace(/\s+/g, " ")
  const regex =
    /(\d{2}-\d{2}-\d{4}),\s*([0-9]{1,2}:[0-9]{2}-[0-9]{1,2}:[0-9]{2}),\s*([^,]*semester),\s*([0-9]{4,5})\s*([^,]+?),\s*([^,]+),\s*(.+?)(?=\.\s+\d{2}-\d{2}-\d{4},|$)/gi

  let match: RegExpExecArray | null
  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(normalized)) !== null) {
    const date = match[1]
    const time = match[2]
    const semester = match[3].trim()
    const subjectCode = match[4].trim()
    const subjectName = match[5].trim().replace(/^[-–]\s*/, "")
    const lab = match[6].trim()
    const examiner = match[7].trim().replace(/\.$/, "")
    entries.push({
      date,
      time,
      semester,
      subject: `${subjectCode}-${subjectName}`,
      lab,
      examiner,
    })
  }

  return entries
}

function formatRoutineTable(entries: RoutineEntry[]) {
  const header = [
    "| তারিখ | সময় | সেমিস্টার | বিষয় কোড ও নাম | ল্যাবের নাম | ইন্টারনাল এক্সামিনার |",
    "|---|---|---|---|---|---|",
  ]
  const rows = entries.slice(0, 40).map((e) => `| ${e.date} | ${e.time} | ${e.semester} | ${e.subject} | ${e.lab} | ${e.examiner} |`)
  return [...header, ...rows].join("\n")
}

function formatLocalFallbackSummary(query: string, chunks: StoredChunk[]) {
  if (chunks.length === 0) return "দুঃখিত, এই প্রশ্নের জন্য এখন কোনো প্রাসঙ্গিক লোকাল ডেটা পাওয়া যায়নি।"

  if (isNoticeRoutineSummaryQuery(query)) {
    const lines = chunks.slice(0, 5).map((c) => {
      const date = extractDateHint(c.content) || extractDateHint(c.title)
      return `- ${c.title}${date ? ` (${date})` : ""}`
    })
    return `সাম্প্রতিক নোটিশ/রুটিনের সারসংক্ষেপ:\n${lines.join("\n")}`
  }

  if (isInstituteOverviewQuery(query) || isGeneralInfoQuery(query)) {
    const lines = chunks.slice(0, 6).map((c) => `- ${c.title}: ${firstSnippet(c.content, 120)}`)
    return `কিশোরগঞ্জ পলিটেকনিক সম্পর্কে সংক্ষিপ্ত তথ্য:\n${lines.join("\n")}`
  }

  const lines = chunks.slice(0, 5).map((c) => `- ${c.title}: ${firstSnippet(c.content, 140)}`)
  return `প্রাসঙ্গিক তথ্য:\n${lines.join("\n")}`
}

async function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
  let timer: NodeJS.Timeout | null = null
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error(errorMessage)), ms)
    }),
  ]).finally(() => {
    if (timer) clearTimeout(timer)
  })
}

function isVicePrincipalListQuestion(query: string) {
  const q = normalizeText(query)
  const asksList = q.includes("talika") || q.includes("list") || q.includes("der") || q.includes("???") || q.includes("name")
  const asksVp = q.includes("?????????") || q.includes("upadhokkho") || q.includes("upadhakko") || q.includes("vice principal")
  return asksList && asksVp
}

function isCurrentPrincipalVicePrincipalQuery(query: string) {
  const q = normalizeText(query)
  const asksCurrent =
    q.includes("current") ||
    q.includes("bortoman") ||
    q.includes("updated") ||
    q.includes("latest") ||
    q.includes("বর্তমান")
  const asksPrincipal = q.includes("principal") || q.includes("odhokkho") || q.includes("adhokkho") || q.includes("অধ্যক্ষ")
  const asksVicePrincipal =
    q.includes("vice principal") || q.includes("upadhokkho") || q.includes("upadhakko") || q.includes("উপাধ্যক্ষ")
  return (asksCurrent && asksPrincipal && asksVicePrincipal) || (asksPrincipal && asksVicePrincipal)
}

function extractNameFromText(content: string, patterns: RegExp[]) {
  for (const p of patterns) {
    const m = content.match(p)
    if (m?.[1]) return m[1].replace(/\s+/g, " ").trim()
  }
  return ""
}

function extractVicePrincipalNames(chunks: StoredChunk[]) {
  const names = new Set<string>()
  const patterns = [
    /Vice Principal[:\s-]+([A-Za-z .()'-]{3,80})/gi,
    /Name[:\s-]+([A-Za-z .()'-]{3,80}).{0,60}Vice Principal/gi,
  ]

  for (const chunk of chunks) {
    const text = `${chunk.title}. ${chunk.content}`
    for (const p of patterns) {
      let match: RegExpExecArray | null
      // eslint-disable-next-line no-cond-assign
      while ((match = p.exec(text)) !== null) {
        const name = match[1].replace(/\s+/g, " ").trim()
        if (name.length > 2) names.add(name)
      }
    }
  }

  return [...names]
}

function isAmbiguousInstituteWhoQuery(query: string) {
  const q = normalizeText(query)
  const hasInstitute = q.includes("kishoreganj") || q.includes("kishoregonj") || q.includes("polytechnic") || q.includes("politecnic")
  const asksWho = q.includes("ke") || q.includes("kew") || q.includes("keu") || q.includes("who")
  const hasSpecificRole =
    q.includes("principal") || q.includes("???????") || q.includes("vice") || q.includes("?????????") || q.includes("instructor") || q.includes("teacher") || q.includes("??????")

  return hasInstitute && asksWho && !hasSpecificRole
}

function countTeachersFromChunks(chunks: StoredChunk[]) {
  const nameSet = new Set<string>()
  const instructorPattern = /([A-Za-z][A-Za-z .()'-]{1,80})\s-\s(?:Instructor|Junior Instructor|Chief Instructor|Craft Instructor)/gi

  for (const chunk of chunks) {
    const text = `${chunk.title}. ${chunk.content}`
    let match: RegExpExecArray | null
    // eslint-disable-next-line no-cond-assign
    while ((match = instructorPattern.exec(text)) !== null) {
      const name = match[1].replace(/\s+/g, " ").trim()
      if (name.length > 2) nameSet.add(name)
    }
  }

  return nameSet.size
}

async function embedText(client: OpenAI, text: string) {
  const result = await client.embeddings.create({ model: EMBEDDING_MODEL, input: text })
  return result.data[0]?.embedding || []
}

async function getStoredChunks(): Promise<StoredChunk[]> {
  const result = (await prisma.$runCommandRaw({ find: CHUNK_COLLECTION, filter: {} })) as {
    cursor?: { firstBatch?: StoredChunk[] }
  }
  return result?.cursor?.firstBatch || []
}

async function upsertStoredChunk(chunk: StoredChunk) {
  const nowIso = new Date().toISOString()
  await prisma.$runCommandRaw({
    update: CHUNK_COLLECTION,
    updates: [
      {
        q: { sourceId: chunk.sourceId },
        u: {
          $set: {
            sourceId: chunk.sourceId,
            title: chunk.title,
            content: chunk.content,
            tags: chunk.tags,
            checksum: chunk.checksum,
            embedding: chunk.embedding,
            updatedAt: nowIso,
          },
          $setOnInsert: { createdAt: nowIso },
        },
        upsert: true,
        multi: false,
      },
    ],
  })
}

async function deleteRemovedChunks(sourceIds: string[]) {
  await prisma.$runCommandRaw({
    delete: CHUNK_COLLECTION,
    deletes: [{ q: { sourceId: { $nin: sourceIds } }, limit: 0 }],
  })
}

async function syncKnowledgeToDb(client: OpenAI) {
  const now = Date.now()
  if (now - lastSyncAt < SYNC_INTERVAL_MS) return
  if (syncPromise) return syncPromise

  syncPromise = (async () => {
    const items = await loadKnowledgeFile()
    const sourceIds = items.map((item) => item.id)

    const existing = await getStoredChunks()
    const existingMap = new Map(existing.map((row) => [row.sourceId, row]))

    for (const item of items) {
      const tags = item.tags || []
      const payload = `${item.title}\n${tags.join(" ")}\n${item.content}`
      const checksum = sha256(payload)
      const current = existingMap.get(item.id)
      if (current && current.checksum === checksum) continue

      const embedding = await embedText(client, payload)
      await upsertStoredChunk({
        sourceId: item.id,
        title: item.title,
        content: item.content,
        tags,
        checksum,
        embedding,
      })
    }

    await deleteRemovedChunks(sourceIds)
    lastSyncAt = Date.now()
  })()

  try {
    await syncPromise
  } finally {
    syncPromise = null
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized. Please login first." }, { status: 401 })
    }

    const ip = getClientIp(req)
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: `Too many requests. Try again after 1 minute.` },
        { status: 429 },
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY missing in .env" }, { status: 500 })

    const body = (await req.json()) as { messages?: IncomingMessage[] }
    const incoming = Array.isArray(body.messages) ? body.messages : []
    const messages = normalizeMessages(incoming)
    if (messages.length === 0) return NextResponse.json({ error: "messages required" }, { status: 400 })
    const client = new OpenAI({ apiKey })

    const lastUser = [...messages].reverse().find((m) => m.role === "user")
    const query = lastUser?.content || ""
    let chunks = await getStoredChunks()
    // Avoid blocking every request on sync. If DB already has chunks, serve immediately.
    if (chunks.length === 0) {
      await syncKnowledgeToDb(client)
      chunks = await getStoredChunks()
    } else {
      void syncKnowledgeToDb(client).catch(() => {})
    }

    const recentContext = normalizeText(messages.map((m) => m.content).join(" "))
    const creatorIntent = isCreatorIntent(query)
    const instituteIntent = true

    const retrievalQuery = expandQueryForRetrieval(query)
    let queryEmbedding: number[] = []
    // For fast-path queries, keyword retrieval is enough and much faster.
    const skipEmbedding = isInstituteOverviewQuery(query) || isNoticeRoutineSummaryQuery(query)
    if (!skipEmbedding) {
      try {
        queryEmbedding = await withTimeout(embedText(client, retrievalQuery), 12000, "Embedding timeout")
      } catch {
        queryEmbedding = []
      }
    }

    const creatorChunk = chunks.find((c) => c.sourceId === "kpi-chatbot-creator-profile")
    if (creatorChunk && isCreatorIdentityQuery(query)) {
      return NextResponse.json({
        reply: "মাহফুজ আলম রনি এই চ্যাটবটটি তৈরি করেছেন।\n\nSource: Chatbot Creator Profile",
        sources: [creatorChunk.title],
        vectorMode: true,
      })
    }

    if (creatorChunk && asksPronounTarget(query) && isCreatorSummaryQuery(`${query} creator`) && hasRecentCreatorContext(recentContext)) {
      return NextResponse.json({
        reply:
          "সংক্ষিপ্ত পরিচিতি: এই চ্যাটবটের নির্মাতা মাহফুজ আলম রনি। তিনি কিশোরগঞ্জ পলিটেকনিক ইনস্টিটিউটের কম্পিউটার টেকনোলজির শিক্ষার্থী (৬ষ্ঠ সেমিস্টার) এবং প্রোগ্রামিং ও AI/ML নিয়ে কাজ করতে আগ্রহী। তিনি Python, JavaScript ও TypeScript নিয়ে কাজ করেন এবং ভবিষ্যতে সৃজনশীল টেক প্রজেক্টে কাজ করতে চান।\n\nSource: Chatbot Creator Profile",
        sources: [creatorChunk.title],
        vectorMode: true,
      })
    }

    if (creatorChunk && isCreatorSummaryQuery(query)) {
      return NextResponse.json({
        reply:
          "সংক্ষিপ্ত পরিচিতি: এই চ্যাটবটের নির্মাতা মাহফুজ আলম রনি। তিনি কিশোরগঞ্জ পলিটেকনিক ইনস্টিটিউটের কম্পিউটার টেকনোলজির শিক্ষার্থী (৬ষ্ঠ সেমিস্টার) এবং প্রোগ্রামিং ও AI/ML নিয়ে কাজ করতে আগ্রহী। তিনি Python, JavaScript ও TypeScript নিয়ে কাজ করেন এবং ভবিষ্যতে সৃজনশীল টেক প্রজেক্টে কাজ করতে চান।\n\nSource: Chatbot Creator Profile",
        sources: [creatorChunk.title],
        vectorMode: true,
      })
    }

    if (isCurrentPrincipalVicePrincipalQuery(query)) {
      const principalChunk = chunks.find((c) => c.sourceId === "kpi-principal-message-2025-03-17")
      const vicePrincipalChunk = chunks.find((c) => c.sourceId === "kpi-vice-principal-2025-05-20")
      const leadershipChunk = chunks.find((c) => c.sourceId === "kpi-leadership-and-chief-instructors-2024")

      const principalName =
        (principalChunk &&
          extractNameFromText(principalChunk.content, [
            /Principal\s*\(Additional Duty\)\s*:\s*([A-Za-z .'-]{3,80})/i,
            /Name\s*:\s*([A-Za-z .'-]{3,80})/i,
          ])) ||
        ""

      const vicePrincipalName =
        (vicePrincipalChunk &&
          extractNameFromText(vicePrincipalChunk.content, [
            /Name\s*:\s*([A-Za-z .'-]{3,80})/i,
            /Vice Principal\s*:\s*([A-Za-z .'-]{3,80})/i,
          ])) ||
        (leadershipChunk &&
          extractNameFromText(leadershipChunk.content, [/Vice Principal\s*:\s*([A-Za-z .'-]{3,80})/i])) ||
        ""

      if (principalName || vicePrincipalName) {
        return NextResponse.json({
          reply: `বর্তমান তথ্য অনুযায়ী:\n- অধ্যক্ষ: ${principalName || "তথ্য পাওয়া যায়নি"}\n- উপাধ্যক্ষ: ${vicePrincipalName || "তথ্য পাওয়া যায়নি"}\n\nSource: ${[principalChunk?.title, vicePrincipalChunk?.title, leadershipChunk?.title].filter(Boolean).join(", ")}`,
          sources: [principalChunk?.title, vicePrincipalChunk?.title, leadershipChunk?.title].filter(Boolean) as string[],
          vectorMode: true,
        })
      }
    }

    if (creatorChunk && isExplicitCreatorNameQuery(query)) {
      const phones = extractPhones(creatorChunk.content)
      const emails = extractEmails(creatorChunk.content)
      const fbLinks = creatorChunk.content.match(/https?:\/\/(?:www\.)?facebook\.com\/[^\s,]+/gi) || []
      const uniqueFb = [...new Set(fbLinks)]
      const q = normalizeText(query)
      const wantsEmail = q.includes("email") || q.includes("mail")
      const wantsNumber =
        q.includes("number") || q.includes("nambar") || q.includes("num") || q.includes("mobile") || q.includes("phone")
      const wantsFb = q.includes("facebook") || q.includes("fb") || q.includes("id")

      if (wantsNumber && phones.length > 0) {
        return NextResponse.json({
          reply: `Mahfuj Alam Rony er mobile number:\n- ${phones[0]}\n\nSource: ${creatorChunk.title}`,
          sources: [creatorChunk.title],
          vectorMode: true,
        })
      }
      if (wantsEmail && emails.length > 0) {
        return NextResponse.json({
          reply: `Mahfuj Alam Rony er email:\n- ${emails[0]}\n\nSource: ${creatorChunk.title}`,
          sources: [creatorChunk.title],
          vectorMode: true,
        })
      }
      if (wantsFb && uniqueFb.length > 0) {
        return NextResponse.json({
          reply: `Mahfuj Alam Rony er Facebook profiles:\n- ${uniqueFb.join("\n- ")}\n\nSource: ${creatorChunk.title}`,
          sources: [creatorChunk.title],
          vectorMode: true,
        })
      }
    }

    if (creatorChunk && isCreatorFollowupContactQuery(query) && hasRecentCreatorContext(recentContext)) {
      const phones = extractPhones(creatorChunk.content)
      const emails = extractEmails(creatorChunk.content)
      const q = normalizeText(query)
      const wantsEmail = q.includes("email") || q.includes("mail")
      const wantsNumber =
        q.includes("number") || q.includes("nambar") || q.includes("num") || q.includes("mobile") || q.includes("phone")

      if (wantsEmail && emails.length > 0) {
        return NextResponse.json({
          reply: `Creator email:\n- ${emails[0]}\n\nSource: ${creatorChunk.title}`,
          sources: [creatorChunk.title],
          vectorMode: true,
        })
      }
      if (wantsNumber && phones.length > 0) {
        return NextResponse.json({
          reply: `Creator mobile number:\n- ${phones[0]}\n\nSource: ${creatorChunk.title}`,
          sources: [creatorChunk.title],
          vectorMode: true,
        })
      }
      if (phones.length > 0 || emails.length > 0) {
        return NextResponse.json({
          reply: `Creator contact info:\n${phones[0] ? `- Mobile: ${phones[0]}\n` : ""}${emails[0] ? `- Email: ${emails[0]}` : ""}\n\nSource: ${creatorChunk.title}`.trim(),
          sources: [creatorChunk.title],
          vectorMode: true,
        })
      }
    }

    if (creatorChunk && isCreatorFollowupIdQuery(query) && hasRecentCreatorContext(recentContext)) {
      const fbLinks = creatorChunk.content.match(/https?:\/\/(?:www\.)?facebook\.com\/[^\s,]+/gi) || []
      const uniqueFb = [...new Set(fbLinks)]
      if (uniqueFb.length > 0) {
        return NextResponse.json({
          reply: `Ei duita Chatbot creator Mahfuj Alam Rony er Facebook ID:\n- ${uniqueFb.join("\n- ")}\n\nSource: ${creatorChunk.title}`,
          sources: [creatorChunk.title],
          vectorMode: true,
        })
      }
    }

    const rankedChunks = chunks
      .map((chunk) => ({
        ...chunk,
        score: queryEmbedding.length > 0 ? cosineSimilarity(queryEmbedding, chunk.embedding as number[]) : 0,
      }))
      .filter((chunk) => {
        if (creatorIntent) return true
        return chunk.sourceId !== "kpi-chatbot-creator-profile"
      })
      .sort((a, b) => b.score - a.score)

    const topChunks = selectContextChunks(query, rankedChunks)

    if (isDataAvailabilityQuery(query)) {
      const summary = summarizeAvailableData(chunks)
      if (summary) {
        return NextResponse.json({
          reply: `আমার কাছে বর্তমানে এই ধরনের তথ্য আছে:\n\n${summary}\n\nআপনি চাইলে নির্দিষ্ট করে বলুন, আমি সাথে সাথে ওই অংশটা দেখাচ্ছি।\n\nSource: ${chunks.slice(0, 4).map((c) => c.title).join(", ")}`,
          sources: chunks.slice(0, 4).map((c) => c.title),
          vectorMode: true,
        })
      }
    }

    if (isInstituteOverviewQuery(query)) {
      const overviewLines = topChunks.slice(0, 6).map((c) => `- ${c.title}: ${firstSnippet(c.content)}`)
      return NextResponse.json({
        reply: `কিশোরগঞ্জ পলিটেকনিক ইনস্টিটিউট সম্পর্কে সংক্ষিপ্ত তথ্য:\n${overviewLines.join("\n")}\n\nSource: ${topChunks.map((c) => c.title).join(", ")}`,
        sources: topChunks.map((c) => c.title),
        vectorMode: true,
      })
    }

    if (isContactLookupQuestion(query)) {
      const creatorFromRecent = isCreatorIntent(recentContext)
      if (creatorChunk && isFacebookQuery(query) && (creatorFromRecent || asksPronounTarget(query))) {
        const links = extractEmails(creatorChunk.content)
        const fbLinks = creatorChunk.content.match(/https?:\/\/(?:www\.)?facebook\.com\/[^\s,]+/gi) || []
        const uniqueFb = [...new Set(fbLinks)]
        if (uniqueFb.length > 0) {
          return NextResponse.json({
            reply: `Creator Facebook profiles:\n${uniqueFb.map((x) => `- ${x}`).join("\n")}\n\nSource: ${creatorChunk.title}`,
            sources: [creatorChunk.title],
            vectorMode: true,
          })
        }
        if (links.length > 0) {
          return NextResponse.json({
            reply: `Creator contact:\n${links.map((x) => `- ${x}`).join("\n")}\n\nSource: ${creatorChunk.title}`,
            sources: [creatorChunk.title],
            vectorMode: true,
          })
        }
      }

      const contactPool = chunks
        .filter((c) => {
          const hay = `${c.title} ${(c.tags || []).join(" ")} ${c.content}`.toLowerCase()
          return hay.includes("mobile") || hay.includes("phone") || hay.includes("email") || hay.includes("contact") || hay.includes("staff") || hay.includes("instructor")
        })

      const records = extractContactRecords(contactPool)
      const directMatch = findContactByDirectValue(records, query)
      const match = directMatch || findBestContactMatch(records, query)

      if (match) {
        const lines = [
          `নাম: **${match.name}**`,
          match.mobile ? `মোবাইল: **${match.mobile}**` : "",
          match.email ? `ইমেইল: **${match.email}**` : "",
        ].filter(Boolean)

        return NextResponse.json({
          reply: `${lines.join("\n")}\n\nSource: ${match.source}`,
          sources: [match.source],
          vectorMode: true,
        })
      }

      const hint = extractNameHint(query)
      const recentName = extractRecentNameFromMessages(messages)
      const followupMatch = !match && recentName ? findBestContactMatch(records, `${query} ${recentName}`) : null
      const resolved = match || followupMatch

      if (resolved) {
        const lines = [
          `নাম: **${resolved.name}**`,
          resolved.mobile ? `মোবাইল: **${resolved.mobile}**` : "",
          resolved.email ? `ইমেইল: **${resolved.email}**` : "",
        ].filter(Boolean)

        return NextResponse.json({
          reply: `${lines.join("\n")}\n\nSource: ${resolved.source}`,
          sources: [resolved.source],
          vectorMode: true,
        })
      }

      if (!hint || hint.length < 3) {
        return NextResponse.json({
          reply: `যার কন্টাক্ট চান তার পূর্ণ নাম দিন (যেমন: "Tahmina Akter er mobile number").`,
          sources: contactPool.slice(0, 2).map((c) => c.title),
          vectorMode: true,
        })
      }
      return NextResponse.json({
        reply: `"${hint || "requested person"}" এর কন্টাক্ট ডেটা পাওয়া যায়নি। বানান ঠিক করে পূর্ণ নাম দিন (যেমন: "Tahmina Akter er mobile number").`,
        sources: contactPool.slice(0, 2).map((c) => c.title),
        vectorMode: true,
      })
    }

    if (isAmbiguousInstituteWhoQuery(query) && !isInstituteOverviewQuery(query)) {
      const principalChunk =
        chunks.find((c) => c.sourceId === "kpi-principal-message-2025-03-17") ||
        chunks.find((c) => c.sourceId === "kpi-leadership-and-chief-instructors-2024")

      if (principalChunk) {
        return NextResponse.json({
          reply:
            "Kishoreganj Polytechnic e prothan daitto shil pod holo Principal. Latest data onujayi Principal (Additional Duty) hishebe Md. Mahbubur Rahman ullekho ache.\n\nSource: Principal Information and Message (Updated 2025-03-17)",
          sources: [principalChunk.title],
          vectorMode: true,
        })
      }
    }

    if (isTeacherListQuestion(query)) {
      const teacherChunks = rankedChunks
        .filter((chunk) => {
          const hay = `${chunk.title} ${(chunk.tags || []).join(" ")} ${chunk.content}`.toLowerCase()
          return hay.includes("instructor") || hay.includes("teacher") || hay.includes("staff") || hay.includes("chief instructor")
        })
        .slice(0, 24)

      const records = uniqueContactsByName(extractContactRecords(teacherChunks))
      const requestedCount = parseRequestedCount(query)
      const sorted = [...records].sort((a, b) => a.name.localeCompare(b.name))
      const shown = requestedCount > 0 ? sorted.slice(0, requestedCount) : sorted.slice(0, 30)

      if (shown.length > 0) {
        const lines = shown.map((r, i) => {
          const parts = [`${i + 1}. ${r.name}`]
          if (r.mobile) parts.push(`মোবাইল: ${r.mobile}`)
          if (r.email) parts.push(`ইমেইল: ${r.email}`)
          return parts.join(" | ")
        })
        const note =
          requestedCount > 0
            ? `মোট পাওয়া শিক্ষক/ইন্সট্রাক্টর তথ্য: **${sorted.length}** জন। আপনি **${requestedCount}** জন চেয়েছিলেন, তাই পাওয়া অনুযায়ী দেখানো হলো।`
            : `মোট পাওয়া শিক্ষক/ইন্সট্রাক্টর তথ্য: **${sorted.length}** জন (উপলব্ধ ডাটাবেইস অনুযায়ী)।`
        return NextResponse.json({
          reply: `${note}\n\n${lines.join("\n")}\n\nSource: ${teacherChunks.slice(0, 3).map((c) => c.title).join(", ")}`,
          sources: teacherChunks.slice(0, 3).map((c) => c.title),
          vectorMode: true,
        })
      }
    }

    if (isStudentCountQuestion(query)) {
      const studentCandidates = rankedChunks
        .filter((chunk) => /student|overview|institute|kpi/i.test(`${chunk.title} ${chunk.tags.join(" ")} ${chunk.content}`))
        .slice(0, 12)
      const totalStudents = extractStudentCountFromChunks(studentCandidates)
      if (totalStudents > 0) {
        return NextResponse.json({
          reply: `কিশোরগঞ্জ পলিটেকনিক ইনস্টিটিউটে মোট শিক্ষার্থী: **${totalStudents}** জন।\n\nSource: ${studentCandidates
            .slice(0, 2)
            .map((c) => c.title)
            .join(", ")}`,
          sources: studentCandidates.slice(0, 2).map((c) => c.title),
          vectorMode: true,
        })
      }
    }

    if (isTeacherCountQuestion(query)) {
      const teacherCandidates = rankedChunks
        .filter((chunk) => {
          const hay = `${chunk.title} ${(chunk.tags || []).join(" ")} ${chunk.content}`.toLowerCase()
          return hay.includes("instructor") || hay.includes("teacher") || hay.includes("staff") || hay.includes("??????")
        })
        .slice(0, 18)

      const teacherCount = countTeachersFromChunks(teacherCandidates)
      if (teacherCount > 0) {
        return NextResponse.json({
          reply: `Amar indexed data onujayi teacher/instructor count approx ${teacherCount}. Official final count jante institute office list check korben.\n\nSource: ${teacherCandidates
            .slice(0, 3)
            .map((c) => c.title)
            .join(", ")}`,
          sources: teacherCandidates.slice(0, 3).map((c) => c.title),
          vectorMode: true,
        })
      }
    }

    if (isVicePrincipalListQuestion(query)) {
      const vpCandidates = rankedChunks
        .filter((chunk) => {
          const hay = `${chunk.title} ${(chunk.tags || []).join(" ")} ${chunk.content}`.toLowerCase()
          return hay.includes("vice principal") || hay.includes("?????????") || hay.includes("leadership")
        })
        .slice(0, 8)

      const vpNames = extractVicePrincipalNames(vpCandidates)
      if (vpNames.length > 0) {
        const vpList = vpNames.map((n, i) => `${i + 1}. ${n}`).join("\n")
        return NextResponse.json({
          reply: `Vice Principal list from available data:\n${vpList}\n\nSource: ${vpCandidates
            .slice(0, 3)
            .map((c) => c.title)
            .join(", ")}`,
          sources: vpCandidates.slice(0, 3).map((c) => c.title),
          vectorMode: true,
        })
      }
    }

    const contextText = topChunks.length
      ? topChunks
          .map((chunk, idx) => `Source ${idx + 1}: ${chunk.title}\nTags: ${chunk.tags.join(", ")}\nInfo: ${trimChunkContent(chunk.content)}`)
          .join("\n\n")
      : "No internal data matched this query."

    const systemPrompt = [
      "তুমি Kishoreganj Polytechnic Institute-এর তথ্যভিত্তিক সহকারী।",
      "উত্তর সবসময় প্রাকৃতিক, স্পষ্ট ও সুন্দর বাংলায় দেবে (ব্যবহারকারী Banglish লিখলেও)।",
      "শুধু Context-এর তথ্য ব্যবহার করবে; তথ্য না থাকলে 'তথ্য পাওয়া যায়নি' বলবে, বানিয়ে বলবে না।",
      "রেসপন্স Markdown-friendly হবে:",
      "- দরকার হলে `##` শিরোনাম ব্যবহার করো",
      "- তালিকায় `-` বা `1.` ব্যবহার করো",
      "- গুরুত্বপূর্ণ নাম/তারিখ/সংখ্যা `**bold**` করো",
      "- code/example এলে triple-backtick code block ব্যবহার করো",
      "নোটিশ/রুটিন প্রশ্নে সাম্প্রতিক (2026/2025) তথ্য আগে দেবে।",
      "creator সম্পর্কিত প্রশ্নে সংক্ষিপ্ত ও প্রাসঙ্গিক উত্তর দেবে।",
      "শেষ লাইনে অবশ্যই দেবে: `Source: <titles>`",
      "",
      "Context:",
      contextText,
    ].join("\n")

    let reply = ""
    const shouldUseFastModel =
      isNoticeRoutineSummaryQuery(query) ||
      isInstituteOverviewQuery(query) ||
      isGeneralInfoQuery(query) ||
      query.length < 180
    const primaryModel = shouldUseFastModel ? FAST_FALLBACK_MODEL : CHAT_MODEL
    const secondaryModel = primaryModel === CHAT_MODEL ? FAST_FALLBACK_MODEL : CHAT_MODEL

    try {
      const completion = await withTimeout(
        client.chat.completions.create({
          model: primaryModel,
          ...(primaryModel.startsWith("gpt-5") ? {} : { temperature: 0.2 }),
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
        OPENAI_TIMEOUT_MS,
        "OpenAI response timeout. Please retry.",
      )
      reply = completion.choices[0]?.message?.content?.trim() || "Sorry, no response generated."
    } catch {
      try {
        const fallbackCompletion = await withTimeout(
          client.chat.completions.create({
            model: secondaryModel,
            ...(secondaryModel.startsWith("gpt-5") ? {} : { temperature: 0.2 }),
            messages: [
              {
                role: "system",
                content:
                  "শুধু দেওয়া context ব্যবহার করে সংক্ষিপ্ত, সুন্দর বাংলা Markdown এ উত্তর দাও। তথ্য বানাবে না। শেষে `Source:` লাইন দাও।",
              },
              {
                role: "user",
                content: `Question: ${query}\n\nContext:\n${contextText}`,
              },
            ],
          }),
          OPENAI_FALLBACK_TIMEOUT_MS,
          "Fallback model timeout",
        )
        reply =
          fallbackCompletion.choices[0]?.message?.content?.trim() ||
          formatLocalFallbackSummary(query, topChunks)
      } catch {
        reply = formatLocalFallbackSummary(query, topChunks)
      }
    }

    return NextResponse.json({
      reply,
      sources: instituteIntent ? topChunks.map((chunk) => chunk.title) : [],
      vectorMode: true,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
