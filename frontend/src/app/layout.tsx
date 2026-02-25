import type { Metadata, Viewport } from "next";
import { Space_Grotesk as SpaceGrotesk, DM_Sans as DMSans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { NavBar } from "@/components/NavBar";

const spaceGrotesk = SpaceGrotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const dmSans = DMSans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
  ],
};

export const metadata: Metadata = {
  title: "TaskFlow - AI-Powered Task Management",
  description: "Manage your tasks with natural language. AI-powered chatbot that understands what you need.",
  applicationName: "TaskFlow",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TaskFlow",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning prevents errors from browser extensions
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${dmSans.variable} font-sans`} suppressHydrationWarning>
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
