import Image from "next/image";
import dynamic from "next/dynamic";

const FactorialRoiCalculator = dynamic(
  () => import("../components/FactorialRoiCalculator"),
  { ssr: false }
);

export default function Page() {
  return (
    <main className="min-h-screen">
      {/* VISUAL MARKER */}
      <div style={{background:"#E51943", color:"white", textAlign:"center", padding:"8px 12px"}}>
        <strong>MINIMAL WIZARD v1</strong> — if you can read this, the new code is LIVE
      </div>

      {/* Top bar with logo (right) */}
      <div className="w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full" style={{background:"#E51943"}} />
            <span className="text-sm font-semibold tracking-wide text-black/70">
              ROI Demo
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Powered by</span>
            {/* Use favicon.jpg to avoid missing /logo.jpg */}
            <img
              src="/favicon.jpg"
              width={28}
              height={28}
              alt="Logo"
              style={{ borderRadius: 6, border: "1px solid #e5e7eb"}}
            />
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl p-6 md:p-10">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{color:"#E51943"}}>
            HR Digitisation ROI Calculator
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            Minimal build to confirm wiring. Tabs + content only.
          </p>
        </header>

        <FactorialRoiCalculator />

        <footer className="py-10 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} ROI demo.
        </footer>
      </section>
    </main>
  );
}
