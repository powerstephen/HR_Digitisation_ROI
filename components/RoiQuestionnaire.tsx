"use client";

import { useMemo, useState } from "react";

type Currency = "EUR" | "USD" | "GBP" | "AUD";
type ModuleKey = "time" | "talent" | "payroll" | "performance" | "docs";
type Method = "manual" | "spreadsheets" | "multi" | "basic";

const FACTORIAL_RED = "#E51943";

const MODULES: Record<ModuleKey, { label: string; desc: string }> = {
  time: { label: "Time Management", desc: "Leave requests, timesheets, scheduling" },
  talent: { label: "Talent Management", desc: "Hiring, onboarding/offboarding" },
  payroll: { label: "Payroll", desc: "Payroll runs, corrections, compliance" },
  performance: { label: "Performance/OKRs", desc: "Goal tracking, reviews, feedback" },
  docs: { label: "Documents & e-sign", desc: "Templates, e-signature, document workflows" },
};

const METHOD_LABEL: Record<Method, string> = {
  manual: "Manual / Paper",
  spreadsheets: "Spreadsheets & Email",
  multi: "Multiple Disconnected Systems",
  basic: "Basic HRIS (limited automation)",
};

const TIME_SAVED = {
  time: {
    leavePerReqMin: { manual: 10, spreadsheets: 7, multi: 5, basic: 3 },
    timesheetPerSubmitMin: { manual: 3, spreadsheets: 2, multi: 1.5, basic: 1 },
  },
  talent: { perHireMin: { manual: 180, spreadsheets: 120, multi: 90, basic: 60 } },
  payroll: { perEmpPerRunMin: { manual: 6, spreadsheets: 4, multi: 3, basic: 2 } },
  performance: { perMgrPerMonthHours: { manual: 1.2, spreadsheets: 1.0, multi: 0.8, basic: 0.6 } },
  docs: { perDocMin: { manual: 12, spreadsheets: 8, multi: 6, basic: 4 } },
} as const;

const SPLIT = {
  time: { hr: 0.7, mgr: 0.3 },
  talent: { hr: 0.8, mgr: 0.2 },
  payroll: { hr: 0.9, mgr: 0.1 },
  performance: { hr: 0.2, mgr: 0.8 },
  docs: { hr: 0.7, mgr: 0.3 },
} as const;

const fmt = (n: number, currency: Currency) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function RoiQuestionnaire() {
  const [step, setStep] = useState<number>(1);

  // Step 1: Profile
  const [jobTitle, setJobTitle] = useState("HR Manager");
  const [industry, setIndustry] = useState("Technology");
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [employees, setEmployees] = useState(150);
  const [managers, setManagers] = useState(Math.max(1, Math.round(150 / 10)));
  const [hrHourly, setHrHourly] = useState(35);
  const [mgrHourly, setMgrHourly] = useState(45);
  const [pricePerEmployee, setPricePerEmployee] = useState(8);
  const [oneTimeImplementation, setOneTimeImplementation] = useState(0);

  // Step 2: Interests
  const [selectedMods, setSelectedMods] = useState<Record<ModuleKey, boolean>>({
    time: true, talent: true, payroll: true, performance: true, docs: true,
  });

  // Step 3: Methods
  const [methods, setMethods] = useState<Partial<Record<ModuleKey, Method>>>({
    time: "spreadsheets",
    talent: "spreadsheets",
    payroll: "spreadsheets",
    performance: "spreadsheets",
    docs: "spreadsheets",
  });

  // Step 4: Volumes
  const [leavePerEmpPerYear, setLeavePerEmpPerYear] = useState(12);
  const [timesheetsWeekly, setTimesheetsWeekly] = useState(true);
  const [hiresPerYear, setHiresPerYear] = useState(Math.round(employees * 0.2));
  const [payrollRunsPerMonth, setPayrollRunsPerMonth] = useState(1);
  const [perfCyclesPerYear, setPerfCyclesPerYear] = useState(1);
  const [docsPerEmpPerYear, setDocsPerEmpPerYear] = useState(3);
  const [otherSavingsMonthly, setOtherSavingsMonthly] = useState(600);

  // Costs
  const monthlySoftwareCost = useMemo(() => employees * pricePerEmployee, [employees, pricePerEmployee]);
  const annualSoftwareCost = useMemo(() => monthlySoftwareCost * 12, [monthlySoftwareCost]);
  const annualTotalCostY1 = useMemo(() => annualSoftwareCost + oneTimeImplementation, [annualSoftwareCost, oneTimeImplementation]);

  // Volume helpers
  const leaveReqsPerMonth = useMemo(() => (employees * leavePerEmpPerYear) / 12, [employees, leavePerEmpPerYear]);
  const timesheetSubmitsPerMonth = useMemo(() => employees * (timesheetsWeekly ? 4 : 1), [employees, timesheetsWeekly]);
  const payrollRunsPerYear = useMemo(() => clamp(payrollRunsPerMonth, 1, 4) * 12, [payrollRunsPerMonth]);

  // Hours saved by module
  const moduleHours = useMemo(() => {
    const out: Record<ModuleKey, { hrHours: number; mgrHours: number; totalHours: number }> = {
      time: { hrHours: 0, mgrHours: 0, totalHours: 0 },
      talent: { hrHours: 0, mgrHours: 0, totalHours: 0 },
      payroll: { hrHours: 0, mgrHours: 0, totalHours: 0 },
      performance: { hrHours: 0, mgrHours: 0, totalHours: 0 },
      docs: { hrHours: 0, mgrHours: 0, totalHours: 0 },
    };

    const add = (mod: ModuleKey, hours: number) => {
      const hrH = hours * SPLIT[mod].hr;
      const mgH = hours * SPLIT[mod].mgr;
      out[mod].hrHours += hrH;
      out[mod].mgrHours += mgH;
      out[mod].totalHours += hours;
    };

    const sel = (m: ModuleKey) => !!selectedMods[m];
    const methodOf = (m: ModuleKey) => methods[m];

    if (sel("time") && methodOf("time")) {
      const meth = methodOf("time") as Method;
      const leaveMin = TIME_SAVED.time.leavePerReqMin[meth];
      const tsMin = TIME_SAVED.time.timesheetPerSubmitMin[meth];
      const leaveHours = (leaveReqsPerMonth * leaveMin * 12) / 60;
      const tsHours = (timesheetSubmitsPerMonth * tsMin * 12) / 60;
      add("time", leaveHours + tsHours);
    }
    if (sel("talent") && methodOf("talent")) {
      const meth = methodOf("talent") as Method;
      add("talent", (hiresPerYear * TIME_SAVED.talent.perHireMin[meth]) / 60);
    }
    if (sel("payroll") && methodOf("payroll")) {
      const meth = methodOf("payroll") as Method;
      add("payroll", (employees * payrollRunsPerYear * TIME_SAVED.payroll.perEmpPerRunMin[meth]) / 60);
    }
    if (sel("performance") && methodOf("performance")) {
      const meth = methodOf("performance") as Method;
      add("performance", managers * TIME_SAVED.performance.perMgrPerMonthHours[meth] * 12 * (perfCyclesPerYear > 0 ? 1 : 0.5));
    }
    if (sel("docs") && methodOf("docs")) {
      const meth = methodOf("docs") as Method;
      add("docs", (employees * docsPerEmpPerYear * TIME_SAVED.docs.perDocMin[meth]) / 60);
    }
    return out;
  }, [
    selectedMods, methods, employees, managers, leaveReqsPerMonth,
    timesheetSubmitsPerMonth, hiresPerYear, payrollRunsPerYear, perfCyclesPerYear, docsPerEmpPerYear
  ]);

  const adminHoursYear = useMemo(() => Object.values(moduleHours).reduce((s, m) => s + m.hrHours, 0), [moduleHours]);
  const managerHoursYear = useMemo(() => Object.values(moduleHours).reduce((s, m) => s + m.mgrHours, 0), [moduleHours]);

  const adminSavingsAnnual = useMemo(() => adminHoursYear * hrHourly, [adminHoursYear, hrHourly]);
  const managerSavingsAnnual = useMemo(() => managerHoursYear * mgrHourly, [managerHoursYear, mgrHourly]);
  const otherSavingsAnnual = useMemo(() => otherSavingsMonthly * 12, [otherSavingsMonthly]);
  const totalSavingsAnnual = useMemo(() => adminSavingsAnnual + managerSavingsAnnual + otherSavingsAnnual, [
    adminSavingsAnnual, managerSavingsAnnual, otherSavingsAnnual,
  ]);

  const netBenefitY1 = useMemo(() => totalSavingsAnnual - annualTotalCostY1, [totalSavingsAnnual, annualTotalCostY1]);
  const netBenefitY2 = useMemo(() => totalSavingsAnnual - annualSoftwareCost, [totalSavingsAnnual, annualSoftwareCost]);

  const roiY1 = useMemo(() => (annualTotalCostY1 <= 0 ? 0 : (netBenefitY1 / annualTotalCostY1) * 100), [netBenefitY1, annualTotalCostY1]);
  const roiY2 = useMemo(() => (annualSoftwareCost <= 0 ? 0 : (netBenefitY2 / annualSoftwareCost) * 100), [netBenefitY2, annualSoftwareCost]);

  const paybackMonths = useMemo(() => {
    const monthlyNet = totalSavingsAnnual / 12 - monthlySoftwareCost;
    if (monthlyNet <= 0) return Infinity;
    return oneTimeImplementation > 0 ? oneTimeImplementation / monthlyNet : (annualSoftwareCost / totalSavingsAnnual) * 12;
  }, [totalSavingsAnnual, monthlySoftwareCost, oneTimeImplementation, annualSoftwareCost]);

  const painSignals = useMemo(() => {
    const s: string[] = [];
    (Object.keys(MODULES) as ModuleKey[]).forEach((k) => {
      if (!selectedMods[k]) return;
      const m = methods[k];
      if (!m) return;
      if (m === "manual") s.push(`${MODULES[k].label}: Manual processes`);
      if (m === "spreadsheets") s.push(`${MODULES[k].label}: Spreadsheets & email`);
      if (m === "multi") s.push(`${MODULES[k].label}: Too many disconnected tools`);
      if (k === "payroll" && (m === "manual" || m === "spreadsheets")) s.push("Payroll: compliance & errors risk");
      if (k === "performance" && (m === "manual" || m === "spreadsheets")) s.push("Performance: OKRs/reviews overhead");
    });
    return s.slice(0, 6);
  }, [selectedMods, methods]);

  const card = {
    border: "2px solid rgba(229,25,67,0.22)",
    borderRadius: 16,
    background: "white",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  } as const;

  const narrativeBullets = useMemo(() => {
    const bullets: string[] = [];
    if (selectedMods.time) bullets.push("Automate repetitive time tasks (leave, timesheets) with self-service and reminders.");
    if (selectedMods.talent) bullets.push("Standardize hiring & onboarding with templates and task flows.");
    if (selectedMods.docs) bullets.push("Create a single source of truth with templates and e-sign.");
    if (selectedMods.payroll) bullets.push("Reduce payroll prep & corrections; lower compliance risk.");
    if (selectedMods.performance) bullets.push("Streamline OKRs/reviews so managers coach more, admin less.");
    if (bullets.length < 4) bullets.push("Free HR to focus on higher-value, strategic initiatives.");
    return bullets.slice(0, 5);
  }, [selectedMods]);

  return (
    <div className="space-y-6">
      {/* Stepper + progress (red) */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 justify-center">
          <TabBtn active={step === 1} onClick={() => setStep(1)} label="1. Profile" />
          <TabBtn active={step === 2} onClick={() => setStep(2)} label="2. Interests" />
          <TabBtn active={step === 3} onClick={() => setStep(3)} label="3. Current Methods" />
          <TabBtn active={step === 4} onClick={() => setStep(4)} label="4. Volumes" />
          <TabBtn active={step === 5} onClick={() => setStep(5)} label="5. Results" />
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full"
            style={{
              width: `${(step / 5) * 100}%`,
              background: FACTORIAL_RED,
              transition: "width 240ms ease",
            }}
          />
        </div>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 space-y-4" style={card}>
            <h2 className="text-lg font-medium">Your Profile</h2>
            <Row label="Job title">
              <input
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </Row>
            <Row label="Industry">
              <select
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                {[
                  "Technology",
                  "Professional Services",
                  "Manufacturing",
                  "Retail",
                  "Healthcare",
                  "Hospitality",
                  "Education",
                  "Nonprofit",
                ].map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </Row>
            <Row label="Currency">
              <select
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
              >
                {(["EUR", "USD", "GBP", "AUD"] as Currency[]).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Row>
          </div>

          <div className="p-6 space-y-4" style={card}>
            <h2 className="text-lg font-medium">Team Size</h2>
            <Row label="Employees">
              <input
                type="number"
                min={1}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-right"
                value={employees}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setEmployees(v);
                  setManagers(Math.max(1, Math.round(v / 10)));
                }}
              />
            </Row>
            <Row label="Managers">
              <input
                type="number"
                min={1}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-right"
                value={managers}
                onChange={(e) => setManagers(Number(e.target.value))}
              />
            </Row>
          </div>

          <div className="p-6 space-y-4" style={card}>
            <h2 className="text-lg font-medium">Costs</h2>
            <Row label={`HR hourly (${currency})`}>
              <input
                type="number"
                min={0}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-right"
                value={hrHourly}
                onChange={(e) => setHrHourly(Number(e.target.value))}
              />
            </Row>
            <Row label={`Manager hourly (${currency})`}>
              <input
                type="number"
                min={0}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-right"
                value={mgrHourly}
                onChange={(e) => setMgrHourly(Number(e.target.value))}
              />
            </Row>
            <Row label={`Price per employee / month (${currency})`}>
              <input
                type="number"
                min={0}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-right"
                value={pricePerEmployee}
                onChange={(e) => setPricePerEmployee(Number(e.target.value))}
              />
            </Row>
            <Row label={`One-time implementation (${currency})`}>
              <input
                type="number"
                min={0}
                step={100}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-right"
                value={oneTimeImplementation}
                onChange={(e) => setOneTimeImplementation(Number(e.target.value))}
              />
            </Row>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(Object.keys(MODULES) as ModuleKey[]).map((k) => (
            <div key={k} className="p-6 space-y-3" style={card}>
              <h2 className="text-lg font-medium">{MODULES[k].label}</h2>
              <p className="text-sm text-gray-600">{MODULES[k].desc}</p>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={!!selectedMods[k]}
                  onChange={(e) => setSelectedMods((s) => ({ ...s, [k]: e.target.checked }))}
                />
                <span className="text-gray-800">Include in ROI</span>
              </label>
            </div>
          ))}
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(Object.keys(MODULES) as ModuleKey[])
            .filter((k) => selectedMods[k])
            .map((k) => (
              <div key={k} className="p-6 space-y-3" style={card}>
                <h2 className="text-lg font-medium">{MODULES[k].label}</h2>
                <p className="text-sm text-gray-600">How do you mostly manage this today?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(["manual", "spreadsheets", "multi", "basic"] as Method[]).map((m) => (
                    <label
                      key={m}
                      className={`flex gap-3 items-center rounded-xl border px-3 py-2 cursor-pointer ${
                        methods[k] === m ? "bg-white" : "bg-gray-50"
                      } border-gray-200`}
                    >
                      <input
                        type="radio"
                        name={`method-${k}`}
                        checked={methods[k] === m}
                        onChange={() => setMethods((s) => ({ ...s, [k]: m }))}
                      />
                      <span className="text-sm text-gray-800">{METHOD_LABEL[m]}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {selectedMods.time && (
            <div className="p-6 space-y-3" style={card}>
              <h2 className="text-lg font-medium">Time Management</h2>
              <Row label="Leave requests per employee / year">
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-right"
                  value={leavePerEmpPerYear}
                  onChange={(e) => setLeavePerEmpPerYear(Number(e.target.value))}
                />
              </Row>
              <Row label="Timesheets weekly?">
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={timesheetsWeekly}
                    onChange={(e) => setTimesheetsWeekly(e.target.checked)}
                  />
                  <span className="text-gray-700">Weekly submissions (≈4 per month)</span>
                </label>
              </Row>
            </div>
          )}

          {selectedMods.talent && (
            <div className="p-6 space-y-3" style={card}>
              <h2 className="text-lg font-medium">Talent</h2>
              <Row label="Hires per year">
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-right"
                  value={hiresPerYear}
                  onChange={(e) => setHiresPerYear(Number(e.target.value))}
                />
              </Row>
            </div>
          )}

          {selectedMods.payroll && (
            <div className="p-6 space-y-3" style={card}>
              <h2 className="text-lg font-medium">Payroll</h2>
              <Row label="Payroll runs per month">
                <input
                  type="number"
                  min={1}
                  max={4}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-right"
                  value={payrollRunsPerMonth}
                  onChange={(e) => setPayrollRunsPerMonth(Number(e.target.value))}
                />
              </Row>
            </div>
          )}

          {selectedMods.performance && (
            <div className="p-6 space-y-3" style={card}>
              <h2 className="text-lg font-medium">Performance / OKRs</h2>
              <Row label="Performance cycles per year">
                <input
                  type="number"
                  min={0}
                  max={4}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-right"
                  value={perfCyclesPerYear}
                  onChange={(e) => setPerfCyclesPerYear(Number(e.target.value))}
                />
              </Row>
            </div>
          )}

          {selectedMods.docs && (
            <div className="p-6 space-y-3" style={card}>
              <h2 className="text-lg font-medium">Documents & e-sign</h2>
              <Row label="Docs per employee / year">
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-right"
                  value={docsPerEmpPerYear}
                  onChange={(e) => setDocsPerEmpPerYear(Number(e.target.value))}
                />
              </Row>
            </div>
          )}

          <div className="p-6 space-y-3" style={card}>
            <h2 className="text-lg font-medium">Other Savings</h2>
            <Row label={`Other savings (monthly) (${currency})`}>
              <input
                type="number"
                min={0}
                step={50}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-right"
                value={otherSavingsMonthly}
                onChange={(e) => setOtherSavingsMonthly(Number(e.target.value))}
              />
            </Row>
            <p className="text-xs text-gray-600">
              Tool consolidation, reduced errors, avoided fines, overtime reduction, etc.
            </p>
          </div>
        </div>
      )}

      {/* STEP 5 */}
      {step === 5 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Headline Summary */}
          <div className="p-6 lg:col-span-3 space-y-3" style={{ ...card, borderColor: FACTORIAL_RED }}>
            <h2 className="text-xl font-semibold" style={{ color: FACTORIAL_RED }}>
              Headline Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Metric label="Total savings (annual)" value={fmt(totalSavingsAnnual, currency)} />
              <Metric label="ROI (Y1)" value={Number.isFinite(roiY1) ? `${roiY1.toFixed(0)}%` : "—"} />
              <Metric label="Payback period" value={Number.isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} months` : "> 24 months"} />
            </div>
            <ul className="list-disc pl-6 text-sm">
              {narrativeBullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>

          <div className="p-6 space-y-3" style={card}>
            <h2 className="text-lg font-medium">Costs</h2>
            <Summary label="Software cost (annual)">{fmt(annualSoftwareCost, currency)}</Summary>
            {oneTimeImplementation > 0 && (
              <Summary label="One-time implementation (Y1)">{fmt(oneTimeImplementation, currency)}</Summary>
            )}
            <Summary label="Total cost (Y1)">
              <strong>{fmt(annualTotalCostY1, currency)}</strong>
            </Summary>
          </div>

          <div className="p-6 space-y-3" style={card}>
            <h2 className="text-lg font-medium">Savings</h2>
            <Summary label="Admin hours saved (annual)">{adminHoursYear.toFixed(0)} h</Summary>
            <Summary label="Manager hours saved (annual)">{managerHoursYear.toFixed(0)} h</Summary>
            <div className="h-px bg-gray-200 my-1" />
            <Summary label="Admin savings (annual)">{fmt(adminSavingsAnnual, currency)}</Summary>
            <Summary label="Manager savings (annual)">{fmt(managerSavingsAnnual, currency)}</Summary>
            <Summary label="Other savings (annual)">{fmt(otherSavingsAnnual, currency)}</Summary>
            <Summary label="Total savings (annual)">
              <strong>{fmt(totalSavingsAnnual, currency)}</strong>
            </Summary>
          </div>

          <div className="p-6 space-y-3" style={card}>
            <h2 className="text-lg font-medium">Outcomes</h2>
            <Summary label="Net benefit (Y1)">
              <strong>{fmt(netBenefitY1, currency)}</strong>
            </Summary>
            <Summary label="Net benefit (Y2+)">
              <strong>{fmt(netBenefitY2, currency)}</strong>
            </Summary>
            <Summary label="ROI (Y1)">
              <strong>{Number.isFinite(roiY1) ? `${roiY1.toFixed(0)}%` : "—"}</strong>
            </Summary>
            <Summary label="ROI (Y2+)">
              <strong>{Number.isFinite(roiY2) ? `${roiY2.toFixed(0)}%` : "—"}</strong>
            </Summary>
            <Summary label="Payback period">
              <strong>
                {Number.isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} months` : "> 24 months (adjust assumptions)"}
              </strong>
            </Summary>
          </div>

          <div className="p-6 lg:col-span-3 space-y-3" style={card}>
            <h3 className="text-base font-medium">Top Pain Signals</h3>
            {painSignals.length === 0 ? (
              <div className="text-sm text-gray-600">
                No obvious red flags detected. Try marking modules as Manual/Spreadsheets to surface pain.
              </div>
            ) : (
              <ul className="list-disc pl-6 text-sm">
                {painSignals.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            )}
            <div className="text-xs text-gray-500">
              Why: time-saved heuristics are applied per module based on your current method & volumes.
            </div>

            <div className="pt-2">
              <button
                className="px-4 py-2 rounded-2xl text-white"
                style={{ background: FACTORIAL_RED }}
                onClick={() =>
                  exportCSV({
                    stepInputs: {
                      jobTitle,
                      industry,
                      currency,
                      employees,
                      managers,
                      hrHourly,
                      mgrHourly,
                      pricePerEmployee,
                      oneTimeImplementation,
                      selectedMods,
                      methods,
                      leavePerEmpPerYear,
                      timesheetsWeekly,
                      hiresPerYear,
                      payrollRunsPerMonth,
                      perfCyclesPerYear,
                      docsPerEmpPerYear,
                      otherSavingsMonthly,
                    },
                    derived: {
                      adminHoursYear,
                      managerHoursYear,
                      adminSavingsAnnual,
                      managerSavingsAnnual,
                      otherSavingsAnnual,
                      totalSavingsAnnual,
                      annualSoftwareCost,
                      annualTotalCostY1,
                      netBenefitY1,
                      netBenefitY2,
                      roiY1,
                      roiY2,
                      paybackMonths,
                    },
                    painSignals,
                  })
                }
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer nav */}
      <div className="flex items-center justify-between">
        <button
          className="px-4 py-2 rounded-2xl"
          style={{ background: "transparent", color: "#111827", border: "1px solid #e5e7eb" }}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          ← Back
        </button>
        <div className="text-xs text-gray-500">Step {step} of 5</div>
        <button
          className="px-4 py-2 rounded-2xl text-white"
          style={{ background: FACTORIAL_RED }}
          onClick={() => setStep((s) => Math.min(5, s + 1))}
          disabled={step === 5}
        >
          {step === 5 ? "Done" : "Next →"}
        </button>
      </div>
    </div>
  );
}

/* UI bits */
function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      className={`px-3 py-1.5 rounded-full text-sm ${active ? "bg-white border font-medium" : "bg-transparent border-transparent text-gray-600"}`}
      style={{ borderColor: "#e5e7eb", color: active ? FACTORIAL_RED : undefined }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
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
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-2xl font-semibold" style={{ color: FACTORIAL_RED }}>
        {value}
      </div>
    </div>
  );
}

/* CSV */
function exportCSV(data: any) {
  const rows: Array<[string, string]> = [];
  const pushObj = (prefix: string, obj: Record<string, any>) => {
    Object.entries(obj).forEach(([k, v]) => rows.push([`${prefix}.${k}`, String(v)]));
  };
  pushObj("Profile", {
    JobTitle: data.stepInputs.jobTitle,
    Industry: data.stepInputs.industry,
    Currency: data.stepInputs.currency,
    Employees: data.stepInputs.employees,
    Managers: data.stepInputs.managers,
    HRHourly: data.stepInputs.hrHourly,
    MgrHourly: data.stepInputs.mgrHourly,
    PricePerEmployee: data.stepInputs.pricePerEmployee,
    OneTimeImplementation: data.stepInputs.oneTimeImplementation,
  });
  pushObj("Interests", data.stepInputs.selectedMods);
  pushObj("Methods", data.stepInputs.methods);
  pushObj("Volumes", {
    LeavePerEmpPerYear: data.stepInputs.leavePerEmpPerYear,
    TimesheetsWeekly: data.stepInputs.timesheetsWeekly,
    HiresPerYear: data.stepInputs.hiresPerYear,
    PayrollRunsPerMonth: data.stepInputs.payrollRunsPerMonth,
    PerfCyclesPerYear: data.stepInputs.perfCyclesPerYear,
    DocsPerEmpPerYear: data.stepInputs.docsPerEmpPerYear,
    OtherSavingsMonthly: data.stepInputs.otherSavingsMonthly,
  });
  pushObj("Derived", {
    AdminHoursYear: Math.round(data.derived.adminHoursYear),
    ManagerHoursYear: Math.round(data.derived.managerHoursYear),
    AdminSavingsAnnual: Math.round(data.derived.adminSavingsAnnual),
    ManagerSavingsAnnual: Math.round(data.derived.managerSavingsAnnual),
    OtherSavingsAnnual: Math.round(data.derived.otherSavingsAnnual),
    TotalSavingsAnnual: Math.round(data.derived.totalSavingsAnnual),
    AnnualSoftwareCost: Math.round(data.derived.annualSoftwareCost),
    TotalCostY1: Math.round(data.derived.annualTotalCostY1),
    NetBenefitY1: Math.round(data.derived.netBenefitY1),
    NetBenefitY2: Math.round(data.derived.netBenefitY2),
    ROIY1Percent: Math.round(data.derived.roiY1),
    ROIY2Percent: Math.round(data.derived.roiY2),
    PaybackMonths: Number.isFinite(data.derived.paybackMonths) ? data.derived.paybackMonths.toFixed(1) : ">24",
  });
  rows.push(["PainSignals", data.painSignals.join(" | ")]);
  const header = "Metric,Value";
  const csv = [header, ...rows.map(([k, v]) => `${escapeCsv(k)},${escapeCsv(v)}`)].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "hr-digitisation-roi-questionnaire.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function escapeCsv(v: string) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
