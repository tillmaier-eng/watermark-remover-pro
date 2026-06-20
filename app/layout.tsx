import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://watermarkremoverpro.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Watermark Remover Pro — Remove Watermarks with AI",
    template: "%s | Watermark Remover Pro",
  },
  description: "Remove watermarks, logos, timestamps, and unwanted text from images in seconds. AI-powered, free to try, privacy-first.",
  keywords: ["watermark remover", "remove watermark", "AI watermark removal", "logo remover", "image cleaner"],
  authors: [{ name: "Watermark Remover Pro" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Watermark Remover Pro",
    title: "Watermark Remover Pro — AI Watermark Removal",
    description: "Clean images in seconds. Free to try.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Watermark Remover Pro",
    description: "Remove watermarks with AI",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body
        className="min-h-full flex flex-col bg-zinc-950 text-white"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}