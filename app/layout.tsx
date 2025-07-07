import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { InstallPrompt } from "@/components/install-prompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vif.today"),
  title: "vif",
  description: "vif is a natural language todo list you wish you had.",
  openGraph: {
    siteName: "vif",
    url: "https://vif.today",
  },
  keywords: ["vif", "todo", "list", "natural language", "todo list"],
  authors: [{ name: "Zaid", url: "https://zaidmukaddam.com" }],
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    {
      color: "#0A0A0A",
      media: "(prefers-color-scheme: dark)",
    },
    {
      color: "#ffffff",
      media: "(prefers-color-scheme: light)",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <InstallPrompt />
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
