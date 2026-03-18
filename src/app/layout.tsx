import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Devroast",
  description: "Drop your code and get roasted.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetBrainsMono.variable}>
      <body>
        <header className="w-full border-b border-border-primary bg-bg-page">
          <div className="flex h-14 items-center justify-between px-10 font-mono">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-[20px] font-bold text-accent-green">
                &gt;
              </span>
              <span className="text-[18px] font-medium text-text-primary">
                devroast
              </span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/leaderboard"
                className="text-[13px] text-text-secondary"
              >
                leaderboard
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
