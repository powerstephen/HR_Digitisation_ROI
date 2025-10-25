import dynamic from "next/dynamic";

const FactorialRoiCalculator = dynamic(
  () => import("../components/FactorialRoiCalculator"),
  { ssr: false } // recharts needs client-side rendering
);

export default function Page() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-6xl p-6 md:p-10">
        <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Factorial ROI Calculator
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-2">
              Plug in your assumptions to estimate payback, annual savings and ROI.
            </p>
          </div>
          <div className="rounded-full bg-[var(--brand-primary)] px-4 py-1 text-white text-sm">
            Factorial palette
          </div>
        </header>

        <FactorialRoiCalculator />

        <footer className="py-10 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} ROI demo. Not affiliated with Factorial.
        </footer>
      </section>
    </main>
  );
}
