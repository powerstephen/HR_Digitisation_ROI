import Image from "next/image";
import dynamic from "next/dynamic";

const FactorialRoiCalculator = dynamic(
  () => import("../components/FactorialRoiCalculator"),
  { ssr: false }
);

export default function Page() {
  return (
    <main className="min-h-screen">
      {/* Top bar with logo (right) */}
      <div className="w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/50 border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-factorial-red" />
            <span className="text-sm font-semibold tracking-wide text-factorial-ink/80">
              ROI Demo
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Powered by</span>
            <Image
              src="/logo.jpg"
              width={28}
              height={28}
              alt="Logo"
              className="rounded-md ring-1 ring-gray-200"
              priority
            />
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl p-6 md:p-10">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-factorial-red">
            HR Digitisation ROI Calculator
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            Plug in your assumptions to estimate payback, annual savings and ROI.
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
