import "./globals.css";
import type { Metadata } from "next";
import { Fira_Sans } from "next/font/google";

const fira = Fira_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Factorial ROI Calculator",
  description: "Estimate payback, savings and ROI for Factorial HR."
  // Favicon provided by app/icon.jpg automatically
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fira.className} bg-factorial-mist text-factorial-ink antialiased`}>
        {children}
      </body>
    </html>
  );
}
