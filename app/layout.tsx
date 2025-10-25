import "./globals.css";
import type { Metadata } from "next";
import { Fira_Sans } from "next/font/google";

const fira = Fira_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "HR Digitisation ROI",
  description: "Estimate payback, savings and ROI.",
  // favicon auto-detected from app/icon.jpg if you add it
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={fira.className}>{children}</body>
    </html>
  );
}
