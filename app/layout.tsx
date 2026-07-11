import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/auth/SessionContext";
import { getSession } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // metadataBase: new URL("https://etfdayschool.vercel.app"),
  title: {
    default: "EFT Day Care School | Quality Early Childhood Education",
    template: "%s | EFT Day Care School",
  },
  description:
    "EFT Day Care School provides quality early childhood education, elementary, and junior high school education in Ghana. Enroll your child today for a bright future.",
  keywords: [
    "day care",
    "school in Ghana",
    "early childhood education",
    "elementary school",
    "junior high school",
    "best school in Ghana",
    "EFT Day Care School",
    "quality education",
  ],
  authors: [{ name: "EFT Day Care School" }],
  creator: "EFT Day Care School",
  publisher: "EFT Day Care School",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  category: "education",
  classification: "Educational Institution",
  referrer: "origin-when-cross-origin",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  return (
    <html lang="en" dir="ltr" data-scroll-behavior="smooth">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EFT School" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
       <SessionProvider initialUser={session?.user ?? null}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
