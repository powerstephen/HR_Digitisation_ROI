"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const fmt = (n: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);

export default function FactorialRoiCalculator() {
  const [currency, setCurrency] = useState<string>("EUR");
  const [employees, setEmployees] = useState<number>(150);
  const [pricePerEmployee, setPricePerEmployee] = useState<number>(8);
  const [oneTimeImplementation, setOneTimeImplementation] = useState<number>(0);

  const [hrHourly, setHrHourly] = useState<number>(35);
  const [minutesSavedPerEmployeePerMonth, setMinutesSavedPerEmployeePerMonth] =
    useState<number>(40);

  const [managersEnabled, setManagersEnabled] = useState<boolean>(true);
  const [managerCount, setManagerCount] = useState<number>(12);
  const [managerHourly, setManagerHourly] = useState<number>(45);
  const [managerHoursSavedPerMonth, setManagerHoursSavedPerMonth] =
    useState<number>(2);

  const [otherSavingsMonthly, setOtherSavingsMonthly] = useState<number>(600);

  // Costs
  const monthlySoftwareCost = useMemo(
    () => employees * pricePerEmployee,
    [employees, pricePerEmployee]
  );
  const annualSoftwareCost = useMemo(
    () => monthlySoftwareCost * 12,
    [monthlySoftwareCost]
  );
  const annualTotalCostY1 = useMemo(
    () => annualSoftwareCost + oneTimeImplementation,
    [annualSoftwareCost, oneTimeImplementation]
  );

  // Savings
  const adminHoursSavedPerMonth = useMemo(
    () => (minutesSavedPerEmployeePerMonth / 60) * employees,
    [minutesSavedPerEmployeePerMonth, employees]
  );
  const adminSavingsMonthly = useMemo(
    () => adminHoursSavedPerMonth * hrHourly,
    [adminHoursSavedPerMonth, hrHourly]
  );

  const managerSavingsMonthly = useMemo(
    () =>
      managersEnabled
        ? managerCount * managerHoursSavedPerMonth * managerHourly
        : 0,
    [managersEnabled, managerCount, managerHoursSavedPerMonth, managerHourly]
  );

  const totalSavingsMonthly = useMemo(
    () => adminSavingsMonthly + managerSavingsMonthly + otherSavingsMonthly,
    [adminSavingsMonthly, managerSavingsMonthly, otherSavingsMonthly]
  );
  const totalSavingsAnnual = useMemo(
    () => totalSavingsMonthly * 12,
    [totalSavingsMonthly]
  );

  // Results
  const netBenefitY1 = useMemo(
    () => totalSavingsAnnual - annualTotalCostY1,
    [totalSavingsAnnual, annualTotalCostY1]
  );
  const netBenefitY2 = useMemo(
    () => totalSavingsAnnual - annualSoftwareCost,
    [totalSavingsAnnual, annualSoftwareCost]
  );

  const roiY1 = useMemo(
    () =>
      annualTotalCostY1 === 0 ? 0 : (netBenefitY1 / annualTotalCostY1) * 100,
    [netBenefitY1, annualTotalCostY1]
  );
  const roiY2 = useMemo(
    () =>
      annualSoftwareCost === 0 ? 0 : (netBenefitY2 / annualSoftwareCost) * 100,
    [netBenefitY2, annualSoftwareCost]
  );

  // Payback
  const paybackMonths = useMemo(() => {
    const monthlyNet = totalSavingsMonthly - monthlySoftwareCost;
    if (monthlyNet <= 0) return Infinity;
    return oneTimeImplementation > 0
      ? oneTimeImplementation / monthlyNet
      : 12 * (annualSoftwareCost / totalSavingsAnnual);
  }, [
    totalSavingsMonthly,
    monthlySoftwareCost,
    oneTimeImplementation,
    annualSoftwareCost,
    totalSavingsAnnual,
  ]);

  const chartData = useMemo(
    () => [
      { name: "Annual Savings", value: totalSavingsAnnual },
      { name: "Annual Cost (Y1)", value: annualTotalCostY1 },
      { name: "Annual Cost (Y2+)", value: annualSoftwareCost },
    ],
    [totalSavingsAnnual, annualTotalCostY1, annualSoftwareCost]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-medium">Team & Pricing</h2>

          <SelectRow
            label="Currency"
            value={currency}
            onChange={setCurrency}
            options={["EUR", "USD", "GBP", "AUD"]}
          />

          <NumberRow
            label="Employees"
            value={employees}
            onChange={setEmployees}
            min={1}
            step={1}
          />

          <NumberRow
            label={`Price / employee / month (${currency})`}
            value={pricePerEmployee}
            onChange={setPricePerEmployee}
            min={0}
            step={1}
          />

          <NumberRow
            label={`One-time implementation (${currency})`}
            value={oneTimeImplementation}
            onChange={setOneTimeImplementation}
            min={0}
            step={100}
          />

          <div className="divider" />

          <h3 className="text-sm font-medium text-gray-700">HR Admin Time</h3>

          <NumberRow
            label={`HR hourly cost (${currency})`}
            value={hrHourly}
            onChange={setHrHourly}
            min={0}
            step={1}
          />

          <SliderRow
            label="Minutes saved / employee / month"
            value={minutesSavedPerEmployeePerMonth}
            setValue={setMinutesSavedPerEmployeePerMonth}
            min={0}
            max={120}
            step={5}
            suffix="min"
          />
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-medium">Manager Time & Other Savings</h2>

          <ToggleRow
            label="Include manager time savings"
            checked={managersEnabled}
            onToggle={() => setManagersEnabled((s) => !s)}
          />

          {managersEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberRow
                label="Managers"
                value={managerCount}
                onChange={setManagerCount}
                min={0}
                step={1}
              />
              <NumberRow
                label={`Manager hourly cost (${currency})`}
                value={managerHourly}
                onChange={setManagerHourly}
                min={0}
                step={1}
              />
              <NumberRow
                label="Manager hours saved / month"
                value={managerHoursSavedPerMonth}
                onChange={setManagerHoursSavedPerMonth}
                min={0}
                step={0.5}
              />
            </div>
          )}

          <NumberRow
            label={`Other savings (monthly) (${currency})`}
            value={otherSavingsMonthly}
            onChange={setOtherSavingsMonthly}
            min={0}
            step={50}
            hint="Tool consolidation, error reduction, avoided fines, reduced overtime, etc."
          />
        </div>

        <div className="card p-6 space-y-3">
          <h2 className="text-lg font-medium">Summary</h2>

          <SummaryRow label="Software cost (annual)">
            {fmt(annualSoftwareCost, currency)}
          </SummaryRow>

          {oneTimeImplementation > 0 && (
            <SummaryRow label="One-time implementation (Y1)">
              {fmt(oneTimeImplementation, currency)}
            </SummaryRow>
          )}

          <SummaryRow label="Total cost (Y1)">
            <strong>{fmt(annualTotalCostY1, currency)}</strong>
          </SummaryRow>

          <div className="divider" />

          <SummaryRow label="Admin savings (annual)">
            {fmt(adminSavingsMonthly * 12, currency)}
          </SummaryRow>

          {managersEnabled && (
            <SummaryRow label="Manager savings (annual)">
              {fmt(managerSavingsMonthly * 12, currency)}
            </SummaryRow>
          )}

          <SummaryRow label="Other savings (annual)">
            {fmt(otherSavingsMonthly * 12, currency)}
          </SummaryRow>

          <SummaryRow label="Total savings (annual)">
            <strong>{fmt(totalSavingsAnnual, currency)}</strong>
          </SummaryRow>

          <div className="divider" />

          <SummaryRow label="Net benefit (Y1)">
            <strong>{fmt(netBenefitY1, currency)}</strong>
          </SummaryRow>

          <SummaryRow label="Net benefit (Y2+)">
            <strong>{fmt(netBenefitY2, currency)}</strong>
          </SummaryRow>

          <SummaryRow label="ROI (Y1)">
            <strong>
              {Number.isFinite(roiY1) ? `${roiY1.toFixed(0)}%` : "—"}
            </strong>
          </SummaryRow>

          <SummaryRow label="ROI (Y2+)">
            <strong>
              {Number.isFinite(roiY2) ? `${roiY2.toFixed(0)}%` : "—"}
            </strong>
          </SummaryRow>

          <SummaryRow label="Payback period">
            <strong>
              {Number.isFinite(paybackMonths)
                ? `${paybackMonths.toFixed(1)} months`
                : "> 24 months (adjust assumptions)"}
            </strong>
          </SummaryRow>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-base font-medium mb-4">Cost vs Savings (Annual)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" hide />
              <YAxis tickFormatter={(v) => fmt(v, currency)} width={100} />
              <Tooltip formatter={(v: number) => fmt(v, currency)} />
              <Bar
                dataKey="value"
                radius={[10, 10, 0, 0]}
                fill="var(--brand-primary)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="btn"
          onClick={() =>
            exportCSV({
              currency,
              employees,
              pricePerEmployee,
              oneTimeImplementation,
              hrHourly,
              minutesSavedPerEmployeePerMonth,
              managersEnabled,
              managerCount,
              managerHourly,
              managerHoursSavedPerMonth,
              otherSavingsMonthly,
              totals: {
                annualSoftwareCost,
                annualTotalCostY1,
                totalSavingsAnnual,
                netBenefitY1,
                netBenefitY2,
                roiY1,
                roiY2,
                paybackMonths,
              },
            })
          }
        >
          Export CSV
        </button>
      </div>
    </div>
  );
}

/* ---------- UI helpers ---------- */

function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-gray-600">{label}</span>
      <span>{children}</span>
    </div>
  );
}

function NumberRow({
  label,
  value,
  onChange,
  min = 0,
  step = 1,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="label">{label}</label>
      <input
        type="number"
        className="input"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        step={step}
      />
      {hint && <div className="text-xs text-gray-500">{hint}</div>}
    </div>
  );
}

function SelectRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-1">
      <label className="label">{label}</label>
      <select
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="label">{label}</span>
      <button
        onClick={onToggle}
        className={`h-6 w-11 rounded-full transition ${
          checked ? "bg-[var(--brand-secondary)]" : "bg-gray-300"
        }`}
        role="switch"
        aria-checked={checked}
        type="button"
      >
        <span
          className={`block h-5 w-5 rounded-full bg-white shadow transform transition translate-y-0.5 ${
            checked ? "translate-x-6" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function SliderRow({
  label,
  value,
  setValue,
  min = 0,
  max = 100,
  step = 1,
  suffix = "",
}: {
  label: string;
  value: number;
  setValue: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="label">{label}</label>
      <input
        type="range"
        className="w-full accent-[var(--brand-secondary)]"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <div className="text-xs text-gray-600">
        {value} {suffix}
      </div>
    </div>
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
    [
      "MinutesSavedPerEmployeePerMonth",
      String(data.minutesSavedPerEmployeePerMonth),
    ],
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
    [
      "PaybackMonths",
      String(
        Number.isFinite(data.totals.paybackMonths)
          ? data.totals.paybackMonths.toFixed(1)
          : ">24"
      ),
    ],
  ];

  const header = "Metric,Value";
  const csv = [header, ...rows.map(([k, v]) => `${escapeCsv(k)},${escapeCsv(v)}`)].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "factorial-roi.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function escapeCsv(v: string) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
