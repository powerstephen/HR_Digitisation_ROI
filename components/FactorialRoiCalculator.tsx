"use client";

import { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

/* ---------- helpers ---------- */
const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);

type Driver = { key: string; label: string; effect: number; unit: "min_per_emp" | "hrs_per_mgr" };

/* Employee-side drivers (per employee, minutes / month) */
const EMP_DRIVERS: Driver[] = [
  { key: "leaveSelfServe",    label: "Leave requests self-serve",               effect: 10, unit: "min_per_emp" },
  { key: "timesheetReminders",label: "Timesheets auto-reminders",               effect: 5,  unit: "min_per_emp" },
  { key: "docESign",          label: "Document e-sign templates",               effect: 8,  unit: "min_per_emp" },
  { key: "onboardingKits",    label: "On/Offboarding templates & tasks",        effect: 12, unit: "min_per_emp" },
];

/* Manager-side drivers (per manager, hours / month) */
const MGR_DRIVERS: Driver[] = [
  { key: "okrMonthly",        label: "Managerial OKRs (monthly updates)",       effect: 0.75, unit: "hrs_per_mgr" },
  { key: "leaveApprovals",    label: "Faster leave approvals & visibility",     effect: 0.5,  unit: "hrs_per_mgr" },
  { key: "perfCycles",        label: "Performance cycles (avg monthly)",        effect: 0.5,  unit: "hrs_per_mgr" },
];

export default function FactorialRoiCalculator() {
  /* Wizard step 1..3 (default to 2 so you SEE the OKR box immediately) */
  const [step, setStep] = useState<number>(2);

  /* Pricing & team (Step 1) */
  const [currency, setCurrency] = useState<string>("EUR");
  const [employees, setEmployees] = useState<number>(150);
  const [pricePerEmployee, setPricePerEmployee] = useState<number>(8);
  const [oneTimeImplementation, setOneTimeImplementation] = useState<number>(0);

  /* HR admin base time (Step 1) */
  const [hrHourly, setHrHourly] = useState<number>(35);
  const [baseMinutesPerEmpPerMonth, setBaseMinutesPerEmpPerMonth] = useState<number>(40);

  /* Managers (Step 2) */
  const [managersEnabled, setManagersEnabled] = useState<boolean>(true);
  const [managerCount, setManagerCount] = useState<number>(12);
  const [managerHourly, setManagerHourly] = useState<number>(45);
  const [baseManagerHoursSavedPerMonth, setBaseManagerHoursSavedPerMonth] = useState<number>(2);

  const [otherSavingsMonthly, setOtherSavingsMonthly] = useState<number>(600);

  /* Drivers state (Step 2) */
  const [empDriverOn, setEmpDriverOn] = useState<Record<string, boolean>>({});
  const [mgrDriverOn, setMgrDriverOn] = useState<Record<string, boolean>>({ okrMonthly: true });

  /* Derived effects from drivers */
  const extraMinutesPerEmp = useMemo(
    () => EMP_DRIVERS.reduce((sum, d) => sum + (empDriverOn[d.key] ? d.effect : 0), 0),
    [empDriverOn]
  );
  const extraManagerHours = useMemo(
    () => MGR_DRIVERS.reduce((sum, d) => sum + (mgrDriverOn[d.key] ? d.effect : 0), 0),
    [mgrDriverOn]
  );

  const minutesSavedPerEmployeePerMonth = useMemo(
    () => baseMinutesPerEmpPerMonth + extraMinutesPerEmp,
    [baseMinutesPerEmpPerMonth, extraMinutesPerEmp]
  );
  const managerHoursSavedPerMonth = useMemo(
    () => baseManagerHoursSavedPerMonth + extraManagerHours,
    [baseManagerHoursSavedPerMonth, extraManagerHours]
  );

  /* Costs */
  const monthlySoftwareCost = useMemo(() => employees * pricePerEmployee, [employees, pricePerEmployee]);
  const annualSoftwareCost  = useMemo(() => monthlySoftwareCost * 12, [monthlySoftwareCost]);
  const annualTotalCostY1   = useMemo(() => annualSoftwareCost + oneTimeImplementation, [annualSoftwareCost, oneTimeImplementation]);

  /* Savings */
  const adminHoursSavedPerMonth = useMemo(
    () => (minutesSavedPerEmployeePerMonth / 60) * employees,
    [minutesSavedPerEmployeePerMonth, employees]
  );
  const adminSavingsMonthly = useMemo(() => adminHoursSavedPerMonth * hrHourly, [adminHoursSavedPerMonth, hrHourly]);

  const managerSavingsMonthly = useMemo(
    () => (managersEnabled ? managerCount * managerHoursSavedPerMonth * managerHourly : 0),
    [managersEnabled, managerCount, managerHoursSavedPerMonth, managerHourly]
  );

  const totalSavingsMonthly = useMemo(
    () => adminSavingsMonthly + managerSavingsMonthly + otherSavingsMonthly,
    [adminSavingsMonthly, managerSavingsMonthly, otherSavingsMonthly]
  );
  const totalSavingsAnnual = useMemo(() => totalSavingsMonthly * 12, [totalSavingsMonthly]);

  /* Results */
  const netBenefitY1 = useMemo(() => totalSavingsAnnual - annualTotalCostY1, [totalSavingsAnnual, annualTotalCostY1]);
  const netBenefitY2 = useMemo(() => totalSavingsAnnual - annualSoftwareCost, [totalSavingsAnnual, annualSoftwareCost]);

  const roiY1 = useMemo(() => (annualTotalCostY1 === 0 ? 0 : (netBenefitY1 / annualTotalCostY1) * 100), [netBenefitY1, annualTotalCostY1]);
  const roiY2 = useMemo(() => (annualSoftwareCost  === 0 ? 0 : (netBenefitY2  / annualSoftwareCost ) * 100), [netBenefitY2,  annualSoftwareCost]);

  /* Payback */
  const paybackMonths = useMemo(() => {
    const monthlyNet = totalSavingsMonthly - monthlySoftwareCost;
    if (monthlyNet <= 0) return Infinity;
    return oneTimeImplementation > 0 ? oneTimeImplementation / monthlyNet : 12 * (annualSoftwareCost / totalSavingsAnnual);
  }, [totalSavingsMonthly, monthlySoftwareCost, oneTimeImplementation, annualSoftwareCost, totalSavingsAnnual]);

  const chartData = useMemo(() => [
    { name: "Annual Savings", value: totalSavingsAnnual },
    { name: "Annual Cost (Y1)", value: annualTotalCostY1 },
    { name: "Annual Cost (Y2+)", value: annualSoftwareCost },
  ], [totalSavingsAnnual, annualTotalCostY1, annualSoftwareCost]);

  /* ---------- UI ---------- */
  const cardBorder = { border: "1px solid rgba(229,25,67,0.18)" }; // ALWAYS visible

  return (
    <div className="space-y-6">
      {/* Tabs / Stepper */}
      <div className="tabs mb-2">
        <button className={`tab ${step === 1 ? "tab-active" : "tab-inactive"}`} onClick={() => setStep(1)}>1. Company & Pricing</button>
        <button className={`tab ${step === 2 ? "tab-active" : "tab-inactive"}`} onClick={() => setStep(2)}>2. Drivers</button>
        <button className={`tab ${step === 3 ? "tab-active" : "tab-inactive"}`} onClick={() => setStep(3)}>3. Results</button>
      </div>

      {/* Slides */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6 space-y-4" style={cardBorder}>
            <h2 className="text-lg font-medium">Company & Pricing</h2>
            <SelectRow label="Currency" value={currency} onChange={setCurrency} options={["EUR","USD","GBP","AUD"]} />
            <NumberRow label="Employees" value={employees} onChange={setEmployees} min={1} step={1} />
            <NumberRow label={`Price / employee / month (${currency})`} value={pricePerEmployee} onChange={setPricePerEmployee} min={0} step={1} />
            <NumberRow label={`One-time implementation (${currency})`} value={oneTimeImplementation} onChange={setOneTimeImplementation} min={0} step={100} />
          </div>

          <div className="card p-6 space-y-4" style={cardBorder}>
            <h2 className="text-lg font-medium">HR Admin Time (baseline)</h2>
            <NumberRow label={`HR hourly cost (${currency})`} value={hrHourly} onChange={setHrHourly} min={0} step={1} />
            <SliderRow label="Minutes saved / employee / month (baseline)" value={baseMinutesPerEmpPerMonth} setValue={setBaseMinutesPerEmpPerMonth} min={0} max={120} step={5} suffix="min" />
            <p className="text-xs text-gray-600">
              You can enrich this on the next slide with specific drivers like e-sign, onboarding kits, etc.
            </p>
          </div>

          <div className="card p-6 space-y-3" style={cardBorder}>
            <h2 className="text-lg font-medium">At a Glance</h2>
            <SummaryRow label="Software cost (annual)">{fmt(annualSoftwareCost, currency)}</SummaryRow>
            {oneTimeImplementation > 0 && <SummaryRow label="One-time implementation (Y1)">{fmt(oneTimeImplementation, currency)}</SummaryRow>}
            <SummaryRow label="Total cost (Y1)"><strong>{fmt(annualTotalCostY1, currency)}</strong></SummaryRow>
            <div className="divider" />
            <SummaryRow label="Admin baseline (min/emp/mo)"><strong>{baseMinutesPerEmpPerMonth} min</strong></SummaryRow>
            <SummaryRow label="Managers enabled"><strong>{managersEnabled ? "Yes" : "No"}</strong></SummaryRow>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6 space-y-4" style={cardBorder}>
            <h2 className="text-lg font-medium">Employee Drivers</h2>
            {EMP_DRIVERS.map(d => (
              <CheckboxRow
                key={d.key}
                label={`${d.label} (+${d.effect} min/emp/mo)`}
                checked={!!empDriverOn[d.key]}
                onChange={(v) => setEmpDriverOn(s => ({...s, [d.key]: v}))}
              />
            ))}
            <div className="divider" />
            <SummaryRow label="Extra minutes/emp/mo from drivers">
              <strong>{extraMinutesPerEmp} min</strong>
            </SummaryRow>
            <SummaryRow label="Total minutes/emp/mo">
              <strong>{minutesSavedPerEmployeePerMonth} min</strong>
            </SummaryRow>
          </div>

          <div className="card p-6 space-y-4" style={cardBorder}>
            <h2 className="text-lg font-medium">Manager Drivers</h2>
            <ToggleRow label="Include manager time savings" checked={managersEnabled} onToggle={() => setManagersEnabled(s => !s)} />
            {managersEnabled && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NumberRow label="Managers" value={managerCount} onChange={setManagerCount} min={0} step={1} />
                  <NumberRow label={`Manager hourly cost (${currency})`} value={managerHourly} onChange={setManagerHourly} min={0} step={1} />
                </div>
                <SliderRow label="Manager hours saved / month (baseline)" value={baseManagerHoursSavedPerMonth} setValue={setBaseManagerHoursSavedPerMonth} min={0} max={10} step={0.5} suffix="h" />

                <div className="divider" />
                {MGR_DRIVERS.map(d => (
                  <CheckboxRow
                    key={d.key}
                    label={`${d.label} (+${d.effect} h/manager/mo)`}
                    checked={!!mgrDriverOn[d.key]}
                    onChange={(v) => setMgrDriverOn(s => ({...s, [d.key]: v}))}
                  />
                ))}
                <div className="divider" />
                <SummaryRow label="Extra hours/manager/mo from drivers">
                  <strong>{extraManagerHours.toFixed(2)} h</strong>
                </SummaryRow>
                <SummaryRow label="Total manager hours saved / month">
                  <strong>{managerHoursSavedPerMonth.toFixed(2)} h</strong>
                </SummaryRow>
              </>
            )}
          </div>

          <div className="card p-6 space-y-4" style={cardBorder}>
            <h2 className="text-lg font-medium">Other Savings</h2>
            <NumberRow label={`Other savings (monthly) (${currency})`} value={otherSavingsMonthly} onChange={setOtherSavingsMonthly} min={0} step={50} hint="Tool consolidation, error reduction, avoided fines, reduced overtime, etc." />
            <div className="divider" />
            <SummaryRow label="Admin savings (annual)">{fmt(adminSavingsMonthly * 12, currency)}</SummaryRow>
            {managersEnabled && <SummaryRow label="Manager savings (annual)">{fmt(managerSavingsMonthly * 12, currency)}</SummaryRow>}
            <SummaryRow label="Total savings (annual)"><strong>{fmt(totalSavingsAnnual, currency)}</strong></SummaryRow>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6 space-y-3" style={cardBorder}>
            <h2 className="text-lg font-medium">Costs</h2>
            <SummaryRow label="Software cost (annual)">{fmt(annualSoftwareCost, currency)}</SummaryRow>
            {oneTimeImplementation > 0 && <SummaryRow label="One-time implementation (Y1)">{fmt(oneTimeImplementation, currency)}</SummaryRow>}
            <SummaryRow label="Total cost (Y1)"><strong>{fmt(annualTotalCostY1, currency)}</strong></SummaryRow>
          </div>

          <div className="card p-6 space-y-3" style={cardBorder}>
            <h2 className="text-lg font-medium">Savings</h2>
            <SummaryRow label="Admin savings (annual)">{fmt(adminSavingsMonthly * 12, currency)}</SummaryRow>
            {managersEnabled && <SummaryRow label="Manager savings (annual)">{fmt(managerSavingsMonthly * 12, currency)}</SummaryRow>}
            <SummaryRow label="Other savings (annual)">{fmt(otherSavingsMonthly * 12, currency)}</SummaryRow>
            <SummaryRow label="Total savings (annual)"><strong>{fmt(totalSavingsAnnual, currency)}</strong></SummaryRow>
          </div>

          <div className="card p-6 space-y-3" style={cardBorder}>
            <h2 className="text-lg font-medium">Outcomes</h2>
            <SummaryRow label="Net benefit (Y1)"><strong>{fmt(netBenefitY1, currency)}</strong></SummaryRow>
            <SummaryRow label="Net benefit (Y2+)"><strong>{fmt(netBenefitY2, currency)}</SummaryRow>
            <SummaryRow label="ROI (Y1)"><strong>{Number.isFinite(roiY1) ? `${roiY1.toFixed(0)}%` : "—"}</strong></SummaryRow>
            <SummaryRow label="ROI (Y2+)"><strong>{Number.isFinite(roiY2) ? `${roiY2.toFixed(0)}%` : "—"}</strong></SummaryRow>
            <SummaryRow label="Payback period"><strong>{Number.isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} months` : "> 24 months (adjust assumptions)"}</SummaryRow>
          </div>

          <div className="card p-6 lg:col-span-3" style={cardBorder}>
            <h3 className="text-base font-medium mb-4">Cost vs Savings (Annual)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" hide />
                  <YAxis tickFormatter={(v) => fmt(v, currency)} width={100} />
                  <Tooltip formatter={(v: number) => fmt(v, currency)} />
                  <Bar dataKey="value" radius={[10,10,0,0]} fill="var(--brand-primary)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-wrap gap-3">
            <button className="btn" onClick={() => exportCSV({
              currency, employees, pricePerEmployee, oneTimeImplementation, hrHourly, minutesSavedPerEmployeePerMonth,
              managersEnabled, managerCount, managerHourly, managerHoursSavedPerMonth, otherSavingsMonthly,
              totals: { annualSoftwareCost, annualTotalCostY1, totalSavingsAnnual, netBenefitY1, netBenefitY2, roiY1, roiY2, paybackMonths }
            })}>
              Export CSV
            </button>
          </div>
        </div>
      )}

      {/* Wizard footer */}
      <div className="flex items-center justify-between">
        <button className="btn-ghost" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>
          ← Back
        </button>
        <div className="text-xs text-gray-500">Step {step} of 3</div>
        <button className="btn" onClick={() => setStep(s => Math.min(3, s + 1))} disabled={step === 3}>
          {step === 3 ? "Done" : "Next →"}
        </button>
      </div>
    </div>
  );
}

/* ---------- UI helpers ---------- */

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between text-sm py-1"><span className="text-gray-600">{label}</span><span>{children}</span></div>;
}

function NumberRow({ label, value, onChange, min = 0, step = 1, hint }: { label: string; value: number; onChange: (v: number) => void; min?: number; step?: number; hint?: string; }) {
  return (
    <div className="space-y-1">
      <label className="label">{label}</label>
      <input type="number" className="input" value={Number.isFinite(value) ? value : 0} onChange={(e) => onChange(Number(e.target.value))} min={min} step={step} />
      {hint && <div className="text-xs text-gray-500">{hint}</div>}
    </div>
  );
}

function SelectRow({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[]; }) {
  return (
    <div className="space-y-1">
      <label className="label">{label}</label>
      <select className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-left focus:outline-none" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function ToggleRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void; }) {
  return (
    <div className="flex items-center justify-between">
      <span className="label">{label}</span>
      <button onClick={onToggle} className={`h-6 w-11 rounded-full transition ${checked ? "bg-[var(--brand-secondary)]" : "bg-gray-300"}`} role="switch" aria-checked={checked} type="button">
        <span className={`block h-5 w-5 rounded-full bg-white shadow transform transition translate-y-0.5 ${checked ? "translate-x-6" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function SliderRow({ label, value, setValue, min = 0, max = 100, step = 1, suffix = "" }: { label: string; value: number; setValue: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string; }) {
  return (
    <div className="space-y-1">
      <label className="label">{label}</label>
      <input type="range" className="w-full accent-[var(--brand-secondary)]" min={min} max={max} step={step} value={value} onChange={(e) => setValue(Number(e.target.value))} />
      <div className="text-xs text-gray-600">{value} {suffix}</div>
    </div>
  );
}

function CheckboxRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void; }) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <input type="checkbox" className="h-4 w-4 rounded border-gray-300 accent-[var(--brand-secondary)]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-gray-700">{label}</span>
    </label>
  );
}

/* ---------- CSV export ---------- */
function exportCSV(data: any) {
  const rows: Array<[string, string]> = [
    ["Currency", data.currency],
    ["Employees", String(data.employees)],
    ["PricePerEmployee", String(data.pricePerEmployee)],
    ["OneTimeImplementation", String(data.oneTimeImplementation)],
    ["HRHourly", String(data.hrHourly)],
    ["MinutesSavedPerEmployeePerMonth", String(data.minutesSavedPerEmployeePerMonth)],
    ["ManagersEnabled", String(data.managersEnabled)],
    ["ManagerCount", String(data.managerCount)],
    ["ManagerHourly", String(data.managerHourly)],
    ["ManagerHoursSavedPerMonth", String(data.managerHoursSavedPerMonth)],
    ["OtherSavingsMonthly", String(data.otherSavingsMonthly)],
    ["AnnualSoftwareCost", String(Math.round(data.totals.annualSoftwareCost))],
    ["TotalCostY1", String(Math.round(data.totals.annualTotalCostY1))],
    ["TotalSavingsAnnual", String(Math.round(data.totals.totalSavingsAnnual))],
    ["NetBenefitY1", String(Math.round(data.totals.netBenefitY1))],
    ["NetBenefitY2", String(Math.round(data.totals.netBenefitY2))],
    ["ROIY1Percent", String(Math.round(data.totals.roiY1))],
    ["ROIY2Percent", String(Math.round(data.totals.roiY2))],
    ["PaybackMonths", String(Number.isFinite(data.totals.paybackMonths) ? data.totals.paybackMonths.toFixed(1) : ">24")],
  ];

  const header = "Metric,Value";
  const csv = [header, ...rows.map(([k, v]) => `${escapeCsv(k)},${escapeCsv(v)}`)].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "hr-digitisation-roi.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function escapeCsv(v: string) { const s = String(v ?? ""); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
