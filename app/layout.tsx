export const metadata = {
  title: "HR Digitisation — Business Case Builder",
  description: "Questionnaire-driven ROI model for HR teams",
  icons: {
    icon: "/favicon.jpeg",
    shortcut: "/favicon.jpeg",
    apple: "/favicon.jpeg",
  },
  // If you don't have /public/site.webmanifest, remove this line.
  manifest: "/site.webmanifest",
};

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#fafafa", color: "#111827" }}>{children}</body>
    </html>
  );
}
