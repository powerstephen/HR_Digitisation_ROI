"use client";

import { useState } from "react";

/** This minimal version avoids charts & heavy libs to guarantee a clean compile.
    Once this is live, we’ll layer back the calculations & Recharts. */

export default function FactorialRoiCalculator() {
  const [step, setStep] = useState<number>(2); // default to 2 so you SEE the OKR checkbox

  // simple working state
  const [currency, setCurrency] = useState<string>("EUR");
  const [employees, setEmployees] = useState<number>(150);
  const [okr, setOkr] = useState<boolean>(true);

  const cardBorder = {
    border: "2px solid rgba(229,25,67,0.25)",
    borderRadius: "16px",
    background: "white",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)"
  } as const;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 justify-center">
        <button
          className={`px-3 py-1.5 rounded-full text-sm ${step===1?"bg-white border":"bg-transparent border-transparent text-gray-500"}`}
          style={{borderColor:"#e5e7eb"}}
          onClick={() => setStep(1)}
        >1. Company & Pricing</button>
        <button
          className={`px-3 py-1.5 rounded-full text-sm ${step===2?"bg-white border":"bg-transparent border-transparent text-gray-500"}`}
          style={{borderColor:"#e5e7eb"}}
          onClick={() => setStep(2)}
        >2. Drivers</button>
        <button
          className={`px-3 py-1.5 rounded-full text-sm ${step===3?"bg-white border":"bg-transparent border-transparent text-gray-500"}`}
          style={{borderColor:"#e5e7eb"}}
          onClick={() => setStep(3)}
        >3. Results</button>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 space-y-4" style={cardBorder}>
            <h2 className="text-lg font-medium">Company & Pricing</h2>
            <Row label="Currency">
              <select
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-left"
                value={currency}
                onChange={(e)=>setCurrency(e.target.value)}
              >
                <option>EUR</option><option>USD</option><option>GBP</option><option>AUD</option>
              </select>
            </Row>
            <Row label="Employees">
              <input
                type="number"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-right"
                value={employees}
                onChange={(e)=>setEmployees(Number(e.target.value))}
                min={1}
              />
            </Row>
          </div>

          <div className="p-6 space-y-4" style={cardBorder}>
            <h2 className="text-lg font-medium">HR Admin Time (baseline)</h2>
            <p className="text-sm text-gray-600">We’ll add the detailed sliders after we confirm this build.</p>
          </div>

          <div className="p-6 space-y-3" style={cardBorder}>
            <h2 className="text-lg font-medium">At a Glance</h2>
            <Summary label="Currency">{currency}</Summary>
            <Summary label="Employees"><strong>{employees}</strong></Summary>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 space-y-4" style={cardBorder}>
            <h2 className="text-lg font-medium">Employee Drivers</h2>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
              <span className="text-gray-700">Leave requests self-serve</span>
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
              <span className="text-gray-700">Document e-sign templates</span>
            </label>
          </div>

          <div className="p-6 space-y-4" style={cardBorder}>
            <h2 className="text-lg font-medium">Manager Drivers</h2>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={okr}
                onChange={(e)=>setOkr(e.target.checked)}
              />
              <span className="text-gray-700">Managerial OKRs (monthly updates)</span>
            </label>
            <p className="text-xs text-gray-600">
              (This box is ON by default so you can see it working.)
            </p>
          </div>

          <div className="p-6 space-y-4" style={cardBorder}>
            <h2 className="text-lg font-medium">Other Savings</h2>
            <p className="text-sm text-gray-600">We’ll add “Other savings” inputs in the next iteration.</p>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 space-y-3" style={cardBorder}>
            <h2 className="text-lg font-medium">Costs</h2>
            <Summary label="(placeholder)">Coming next</Summary>
          </div>
          <div className="p-6 space-y-3" style={cardBorder}>
            <h2 className="text-lg font-medium">Savings</h2>
            <Summary label="(placeholder)">Coming next</Summary>
          </div>
          <div className="p-6 space-y-3" style={cardBorder}>
            <h2 className="text-lg font-medium">Outcomes</h2>
            <Summary label="(placeholder)">Coming next</Summary>
          </div>
        </div>
      )}

      {/* Wizard footer */}
      <div className="flex items-center justify-between">
        <button
          className="px-4 py-2 rounded-2xl"
          style={{background:"transparent", color:"#111827", border:"1px solid #e5e7eb"}}
          onClick={() => setStep(s => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          ← Back
        </button>
        <div className="text-xs text-gray-500">Step {step} of 3</div>
        <button
          className="px-4 py-2 rounded-2xl text-white"
          style={{background:"#E51943"}}
          onClick={() => setStep(s => Math.min(3, s + 1))}
          disabled={step === 3}
        >
          {step === 3 ? "Done" : "Next →"}
        </button>
      </div>
    </div>
  );
}

/* --- tiny helpers --- */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-700">{label}</label>
      {children}
    </div>
  );
}
function Summary({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-gray-600">{label}</span>
      <span>{children}</span>
    </div>
  );
}
