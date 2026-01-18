import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import Noise from "@/components/Noise";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Branch Tracker | Stacked Diffs",
  description: "Track and manage your stacked diffs across projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${firaCode.variable} font-sans antialiased`}>
        {/* Subtle noise texture overlay */}
        <Noise
          patternSize={150}
          patternScaleX={1}
          patternScaleY={1}
          patternRefreshInterval={2}
          patternAlpha={15}
        />
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
