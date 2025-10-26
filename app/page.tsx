import dynamic from "next/dynamic";

// Import the component you have
const RoiQuestionnaire = dynamic(() => import("../components/RoiQuestionnaire"), {
  ssr: false,
});

export default function Page() {
  return (
    <main className="min-h-screen">
      {/* (Removed the red banner per your request) */}

      <section className="mx-auto max-w-6xl p-6 md:p-10">
        <header className="mb-8 flex items-center justify-between">
          <h1
            className="text-3xl md:text-4xl font-semibold tracking-tight"
            style={{ color: "#E51943" }}
          >
            HR Digitisation — Business Case Builder
          </h1>
          {/* Logo top-right */}
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
