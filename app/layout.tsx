export const metadata = {
  title: "HR Digitisation ROI",
  description: "Questionnaire-driven ROI model for HR teams",
  icons: {
    icon: "/favicon.jpeg",
    shortcut: "/favicon.jpeg",
    apple: "/favicon.jpeg",
  },
  // If you add the file below in /public, keep this; otherwise delete the line.
  manifest: "/site.webmanifest",
};

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
