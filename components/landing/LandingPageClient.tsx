import Image from "next/image"
import Link from "next/link"
import SiteNavbar from "@/components/shared/SiteNavbar"

const quickInfo = [
  { label: "প্রতিষ্ঠান কোড", value: "৫৯০৬০" },
  { label: "প্রতিষ্ঠিত", value: "২০০৮" },
  { label: "ধরন", value: "সরকারি" },
  { label: "শিক্ষার্থী", value: "প্রায় ৪২০০+" },
]

const departments = [
  "কম্পিউটার সায়েন্স অ্যান্ড টেকনোলজি",
  "ইলেকট্রনিক্স",
  "আরএসি (RAC)",
  "ফুড টেকনোলজি",
  "নন-টেক বিভাগ",
]

const facilities = [
  "ল্যাব: ১৭টি",
  "ওয়ার্কশপ: ১১টি",
  "ক্লাসরুম: ১৬টি",
  "লাইব্রেরি: ১টি",
  "জব প্লেসমেন্ট সেল: ১টি",
  "হোস্টেল: ২টি",
]

export default function LandingPageClient() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SiteNavbar actionLabel="চ্যাটবট ব্যবহার করুন" actionHref="/chat" />

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-8 pt-6 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:pt-10">
        <div className="order-2 md:order-1">
          <p className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            সরকারি কারিগরি শিক্ষাপ্রতিষ্ঠান
          </p>
          <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">কিশোরগঞ্জ পলিটেকনিক ইনস্টিটিউটে স্বাগতম</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            বাংলাদেশ কারিগরি শিক্ষা বোর্ড (BTEB) অধিভুক্ত এই প্রতিষ্ঠানটি ৪ বছর মেয়াদী ডিপ্লোমা-ইন-ইঞ্জিনিয়ারিং
            শিক্ষা কার্যক্রম পরিচালনা করে। আধুনিক ল্যাব, ওয়ার্কশপ, লাইব্রেরি, জব প্লেসমেন্ট এবং ব্যবহারিক শিক্ষার উপর
            বিশেষ গুরুত্ব দেওয়া হয়।
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {quickInfo.map((item) => (
              <article key={item.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="mt-1 text-sm font-bold sm:text-base">{item.value}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="order-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:order-2">
          <Image
            src="/banner.webp"
            alt="কিশোরগঞ্জ পলিটেকনিক ইনস্টিটিউট ব্যানার"
            width={1200}
            height={800}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">বিভাগসমূহ</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {departments.map((item) => (
              <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">ক্যাম্পাস সুবিধা</h2>
          <ul className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
            {facilities.map((item) => (
              <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold">গুরুত্বপূর্ণ তথ্য</h2>
          <div className="mt-4 grid gap-4 text-sm leading-7 text-slate-700 md:grid-cols-2">
            <div>
              <p>
                <span className="font-semibold">অবস্থান:</span> করিমগঞ্জ, কিশোরগঞ্জ
              </p>
              <p>
                <span className="font-semibold">ইমেইল:</span> kishorepoly08@gmail.com
              </p>
              <p>
                <span className="font-semibold">ওয়েবসাইট:</span>{" "}
                <a
                  href="https://kishoreganj.polytech.gov.bd/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 underline"
                >
                  kishoreganj.polytech.gov.bd
                </a>
              </p>
            </div>
            <div>
              <p>
                <span className="font-semibold">শিক্ষাক্রম:</span> ডিপ্লোমা-ইন-ইঞ্জিনিয়ারিং (৮ সেমিস্টার)
              </p>
              <p>
                <span className="font-semibold">বোর্ড:</span> বাংলাদেশ কারিগরি শিক্ষা বোর্ড (BTEB)
              </p>
              <p>
                <span className="font-semibold">মন্ত্রণালয়:</span> শিক্ষা মন্ত্রণালয় (কারিগরি ও মাদ্রাসা বিভাগ)
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6">
        <div className="rounded-2xl bg-slate-900 px-5 py-8 text-center text-white sm:px-8">
          <h3 className="text-xl font-bold sm:text-2xl">এআই চ্যাটবট দিয়ে ইনস্টিটিউটের তথ্য জানুন</h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
            ভর্তি, বিভাগ, শিক্ষক, নোটিশ, রুটিনসহ যেকোনো তথ্য বাংলায় জেনে নিন।
          </p>
          <Link
            href="/chat"
            className="mt-5 inline-flex rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            এখনই চ্যাট শুরু করুন
          </Link>
        </div>
      </section>
    </main>
  )
}
