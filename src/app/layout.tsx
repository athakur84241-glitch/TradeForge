import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import { PublicLayout } from "@/components/public/public-layout";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const display = Manrope({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: {
    default: "TradeForge Workspace",
    template: "%s · TradeForge",
  },
  description: "A premium demo workspace for evaluation progress, account risk, and trading performance.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${sans.variable} ${display.variable} dark`}>
      <body>
        <PublicLayout>
          {children}
        </PublicLayout>
      </body>
    </html>
  );
}
