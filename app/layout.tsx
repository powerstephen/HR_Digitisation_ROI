import "./globals.css";
import type { Metadata } from "next";
import { Fira_Sans } from "next/font/google";

// Factorial uses a geometric grotesk; Fira Sans is a clean, close-enough Google font.
const fira = Fira_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Factorial ROI Calculator",
  description: "Estimate payback, savings and ROI for Factorial HR.",
  // Let Next auto-detect /app/icon.jpg (added in step 3)
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fira.className} bg-white text-factorial-ink antialiased`}>
        {children}
      </body>
    </html>
  );
}
