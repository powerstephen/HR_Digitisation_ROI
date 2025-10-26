export const metadata = {
  title: "HR Digitisation ROI",
  description: "Questionnaire-driven ROI model for HR teams",
  icons: {
    icon: "/favicon.jpeg",
    shortcut: "/favicon.jpeg",
    apple: "/favicon.jpeg",
  },
  // If you keep /public/site.webmanifest, keep this line; otherwise remove it
  manifest: "/site.webmanifest",
};

import "./globals.css"; // <- ensure Tailwind + global styles load

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#fafafa", color: "#111827" }}>
        {children}
      </body>
    </html>
  );
}
