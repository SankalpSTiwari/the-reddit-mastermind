import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reddit Mastermind | Content Calendar Generator",
  description: "Generate natural, engaging Reddit content calendars for organic marketing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-surface-950 text-surface-100">
        {children}
      </body>
    </html>
  );
}
