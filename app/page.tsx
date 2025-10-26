import dynamic from "next/dynamic";

// Import the component you actually have: RoiQuestionnaire.tsx
const RoiQuestionnaire = dynamic(
  () => import("../components/RoiQuestionnaire"),
  { ssr: false }
);

export default function Page() {
  return (
    <main className="min-h-screen">
      {/* Visible canary so you know the new build is live */}
      <div
        style={{
          background: "#E51943",
          color: "white",
          textAlign: "center",
          padding: "8px 12px",
        }}
      >
        <strong>QUESTIONNAIRE BUILD — RED STEPPER (matching RoiQuestionnaire.tsx)</strong>
      </div>

      <section className="mx-auto max-w-6xl p-6 md:p-10">
        <header className="mb-8 flex items-center justify-between">
          <h1
            className="text-3xl md:text-4xl font-semibold tracking-tight"
            style={{ color: "#E51943" }}
          >
            HR Digitisation ROI — Questionnaire
          </h1>
          {/* Show your favicon as a small logo in the header */}
          <img
            src="/favicon.jpeg"
            alt="ROI Demo Logo"
            width={40}
            height={40}
            style={{ display: "block", borderRadius: 8 }}
          />
        </header>

        <RoiQuestionnaire />

        <footer className="py-10 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} ROI demo.
        </footer>
      </section>
    </main>
  );
}
