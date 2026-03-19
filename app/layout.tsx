import type { Metadata } from "next";
import { Merriweather, Source_Serif_4, Inter } from "next/font/google";
import { ProgressBar } from "@/components/ProgressBar";
import { Telemetry } from "@/components/Telemetry";
import "./globals.css";

const headingFont = Merriweather({
  variable: "--font-heading",
  weight: ["300", "400", "700", "900"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const bodyFont = Source_Serif_4({
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const uiFont = Inter({
  variable: "--font-ui",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Lumen Gentium | Nghiên Cứu Thần Học",
    template: "%s | Lumen Gentium",
  },
  description:
    "Bản đọc học thuật chuyên sâu về Hiến Chế Tín Lý Lumen Gentium với giao diện tạp chí thần học hiện đại.",
  keywords: [
    "Lumen Gentium",
    "Vatican II",
    "Thần học Công giáo",
    "Nghiên cứu học thuật",
    "Giáo hội học",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "article",
    url: "/",
    title: "Lumen Gentium | Nghiên Cứu Thần Học",
    description:
      "Trang đọc học thuật về bối cảnh lịch sử, chuyển dịch thần học và tầm ảnh hưởng đương đại của Lumen Gentium.",
    siteName: "Lumen Gentium Journal",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumen Gentium | Nghiên Cứu Thần Học",
    description:
      "Nền tảng đọc học thuật theo phong cách tạp chí cho báo cáo chuyên sâu về Lumen Gentium.",
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
    <html lang="vi">
      <body
        className={`${headingFont.variable} ${bodyFont.variable} ${uiFont.variable} selection:bg-gold/30 font-body antialiased`}
      >
        <a href="#main-content" className="skip-link">
          Bỏ qua đến nội dung chính
        </a>
        <ProgressBar />
        {children}
        <Telemetry />
      </body>
    </html>
  );
}
