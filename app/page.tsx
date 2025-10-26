import dynamic from "next/dynamic";

// 👇 NEW name & path so it can't use an old chunk
const RoiQuestionnaire = dynamic(() => import("../components/RoiQuestionnaire"), {
  ssr: false,
});

export default function Page() {
  return (
    <main className="min-h-screen">
      {/* VISUAL MARKER */}
      <div style={{background:"#E51943", color:"white", textAlign:"center", padding:"8px 12px"}}>
        <strong>QUESTIONNAIRE BUILD v2</strong> — if you can read this, the new code is LIVE
      </div>

      <section className="mx-auto max-w-6xl p-6 md:p-10">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{color:"#E51943"}}>
            HR Digitisation ROI — Questionnaire
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            Guided questions → defensible time & cost savings.
          </p>
        </header>

        <RoiQuestionnaire />

        <footer className="py-10 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} ROI demo.
        </footer>
      </section>
    </main>
  );
}
