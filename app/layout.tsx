import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "../components/AuthProvider";
import GoogleOneTap from "../components/GoogleOneTap";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://multipurpose-ai.vercel.app"),
  title: {
    default: "Multipurpose AI | Image, Email and SEO Content Studio",
    template: "%s | Multipurpose AI",
  },
  description:
    "Multipurpose AI helps you generate visuals, email copy, and SEO-ready content in one fast workspace.",
  keywords: [
    "AI content generator",
    "SEO content",
    "email writer",
    "image generation",
    "marketing automation",
    "Multipurpose AI",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Multipurpose AI | Image, Email and SEO Content Studio",
    description:
      "Create visual assets, persuasive emails, and search-friendly content from one AI workspace.",
    url: "https://multipurpose-ai.vercel.app",
    siteName: "Multipurpose AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Multipurpose AI",
    description:
      "All-in-one AI workspace for images, emails, and SEO content.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <GoogleOneTap />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
