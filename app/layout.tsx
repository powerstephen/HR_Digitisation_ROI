import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Factorial ROI Calculator",
  description: "Estimate payback, savings and ROI for Factorial HR.",
  icons: { icon: "/favicon.jpg" } // put a small JPEG at /public/favicon.jpg
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-factorial-ink antialiased">{children}</body>
    </html>
  );
}
