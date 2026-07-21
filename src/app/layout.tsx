import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const display = Manrope({ subsets: ["latin"], variable: "--font-display" });
export const metadata: Metadata = { title: "TradeForge Design System", description: "TradeForge foundational interface system" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className="dark"><body className={`${sans.variable} ${display.variable}`}>{children}</body></html>; }
