import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

const redditSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-reddit-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Reddit Mastermind | Content Calendar Generator",
  description:
    "Generate natural, engaging Reddit content calendars for organic marketing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={redditSans.variable}>
      <body className="antialiased bg-surface-950 text-surface-100 font-sans">
        {children}
      </body>
    </html>
  );
}
