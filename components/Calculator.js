"use client";

import { useMemo, useState } from "react";

const initial = {
  age: 25,
  horizon: 10,
  investmentReturn: 12,
  price: 10000000,
  down: 20,
  loanRate: 8.5,
  tenure: 20,
  buyCost: 7,
  appreciation: 6,
  maintenance: 1,
  propertyTaxInsurance: 25000,
  rent: 30000,
  rentIncrease: 10,
  renterMisc: 5000,
  unusedCashReturn: 12,
  investmentDiscipline: 0,
};

const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);

const pct = (n) => `${Number(n).toFixed(1)}%`;

function pmt(rate, nper, pv) {
  if (!nper) return 0;
  if (rate === 0) return pv / nper;
  return (rate * pv) / (1 - Math.pow(1 + rate, -nper));
}

function loanBalance(annualRate, monthsElapsed, tenureYears, loan, emi) {
  if (monthsElapsed >= tenureYears * 12) return 0;
  const r = annualRate / 12;
  if (r === 0) return Math.max(0, loan - emi * monthsElapsed);
  return Math.max(
    0,
    loan * Math.pow(1 + r, monthsElapsed) -
      emi * ((Math.pow(1 + r, monthsElapsed) - 1) / r)
  );
}

function calculate(v) {
  const horizon = Math.max(1, Math.min(30, Math.round(Number(v.horizon) || 1)));
  const price = Math.max(0, Number(v.price) || 0);
  const down = Math.max(0, Math.min(1, Number(v.down) / 100 || 0));
  const annualRate = Math.max(0, Number(v.loanRate) / 100 || 0);
  const tenure = Math.max(1, Number(v.tenure) || 1);
  const propertyGrowth = Number(v.appreciation) / 100 || 0;
  const maintenance = Math.max(0, Number(v.maintenance) / 100 || 0);
  const tax = Math.max(0, Number(v.propertyTaxInsurance) || 0);
  const buyCost = Math.max(0, Number(v.buyCost) / 100 || 0);
  const monthlyRent = Math.max(0, Number(v.rent) || 0);
  const rentGrowth = Number(v.rentIncrease) / 100 || 0;
  const renterMisc = Math.max(0, Number(v.renterMisc) || 0);
  const investmentReturn = Number(v.investmentReturn) / 100 || 0;
  const unusedCashReturn = Number(v.unusedCashReturn) / 100 || 0;
  const discipline = Math.max(0, Number(v.investmentDiscipline) || 0);

  const loan = price * (1 - down);
  const emi = pmt(annualRate / 12, tenure * 12, loan);
  const initialCash = price * down + price * buyCost;

  let portfolio = initialCash * (1 + unusedCashReturn);
  const rows = [];

  for (let year = 1; year <= 30; year++) {
    const propertyValue = price * Math.pow(1 + propertyGrowth, year);
    const balance = loanBalance(
      annualRate,
      year * 12,
      tenure,
      loan,
      emi
    );
    const annualEmi = year <= tenure ? emi * 12 : 0;
    const maintenanceTax = propertyValue * maintenance + tax;
    const annualRent =
      monthlyRent * 12 * Math.pow(1 + rentGrowth, year - 1);
    const rentCost = annualRent + renterMisc;
    const buyCostAnnual = annualEmi + maintenanceTax;
    const difference =
      rentCost - buyCostAnnual + discipline * 12;

    if (year === 1) {
      portfolio = portfolio + difference;
    } else {
      portfolio = portfolio * (1 + investmentReturn) + difference;
    }

    rows.push({
      year,
      propertyValue,
      balance,
      equity: propertyValue - balance,
      annualEmi,
      maintenanceTax,
      annualRent,
      rentCost,
      buyCostAnnual,
      difference,
      portfolio,
    });
  }

  const result = rows[horizon - 1];

  return {
    loan,
    emi,
    initialCash,
    rows,
    result,
    gap: result.portfolio - result.equity,
  };
}

function Field({ label, suffix, value, onChange, min = 0, max, step = 1 }) {
  return (
    <div className="field">
      <label>
        <span>{label}</span>
        {suffix ? <span>{suffix}</span> : null}
      </label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Chart({ rows, horizon }) {
  const width = 760;
  const height = 250;
  const padX = 42;
  const padY = 24;
  const max = Math.max(
    1,
    ...rows.map((r) => Math.max(r.equity, r.portfolio))
  ) * 1.08;

  const x = (i) => padX + (width - padX - 18) * (i / (rows.length - 1));
  const y = (value) =>
    height - padY - ((height - padY * 2) * Math.max(0, value)) / max;

  const path = (key) =>
    rows
      .map((r, i) => `${i ? "L" : "M"} ${x(i).toFixed(1)} ${y(r[key]).toFixed(1)}`)
      .join(" ");

  const selectedX = x(horizon - 1);

  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img"
      aria-label="Buy equity and rent portfolio over thirty years">
      {[0, 1, 2, 3].map((i) => {
        const yy = padY + ((height - padY * 2) * i) / 3;
        return (
          <line key={i} x1={padX} y1={yy} x2={width - 18} y2={yy}
            stroke="#000" strokeWidth="1" opacity="0.18" />
        );
      })}
      <path d={path("equity")} fill="none" stroke="#000" strokeWidth="5" />
      <path d={path("portfolio")} fill="none" stroke="#0b57d0" strokeWidth="5" />
      <line x1={selectedX} y1="12" x2={selectedX} y2={height - 20}
        stroke="#0b57d0" strokeWidth="2" strokeDasharray="7 6" />
      <text x={padX} y={height - 4} fontSize="11" fontFamily="DM Mono">1Y</text>
      <text x={width - 45} y={height - 4} fontSize="11" fontFamily="DM Mono">30Y</text>
      <text x={Math.min(selectedX + 7, width - 80)} y="20"
        fontSize="11" fontFamily="DM Mono" fontWeight="700">
        {horizon}Y
      </text>
    </svg>
  );
}

export default function Calculator() {
  const [values, setValues] = useState(initial);

  const model = useMemo(() => calculate(values), [values]);

  const update = (key) => (value) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const { result, gap, loan, emi, initialCash } = model;
  const rentWins = gap > 0;

  return (
    <section className="shell">
      <div className="layout">
        <div className="panel">
          <div className="panelHead">
            <h2>INPUTS</h2>
            <span>EDIT THE MODEL</span>
          </div>
          <div className="form">
            <div className="group">
              <div className="groupTitle">01 / PERSONAL & TIME</div>
              <div className="fields">
                <Field label="Current age" suffix="YEARS" value={values.age}
                  onChange={update("age")} min={18} max={80} />
                <Field label="Analysis horizon" suffix="YEARS" value={values.horizon}
                  onChange={update("horizon")} min={1} max={30} />
                <Field label="Investment return" suffix="% / YEAR"
                  value={values.investmentReturn} onChange={update("investmentReturn")}
                  min={0} max={50} step={0.1} />
              </div>
            </div>

            <div className="group">
              <div className="groupTitle">02 / BUYING A PROPERTY</div>
              <div className="fields">
                <Field label="Property price today" suffix="₹" value={values.price}
                  onChange={update("price")} min={0} step={100000} />
                <Field label="Down payment" suffix="%"
                  value={values.down} onChange={update("down")} min={0} max={100} step={0.5} />
                <Field label="Home loan interest" suffix="% / YEAR"
                  value={values.loanRate} onChange={update("loanRate")} min={0} max={50} step={0.1} />
                <Field label="Loan tenure" suffix="YEARS"
                  value={values.tenure} onChange={update("tenure")} min={1} max={40} />
                <Field label="Buying transaction costs" suffix="%"
                  value={values.buyCost} onChange={update("buyCost")} min={0} max={30} step={0.5} />
                <Field label="Property appreciation" suffix="% / YEAR"
                  value={values.appreciation} onChange={update("appreciation")} min={-20} max={50} step={0.1} />
                <Field label="Maintenance" suffix="% / YEAR"
                  value={values.maintenance} onChange={update("maintenance")} min={0} max={20} step={0.1} />
                <Field label="Property tax + insurance" suffix="₹ / YEAR"
                  value={values.propertyTaxInsurance}
                  onChange={update("propertyTaxInsurance")} min={0} step={1000} />
              </div>
            </div>

            <div className="group">
              <div className="groupTitle">03 / RENTING</div>
              <div className="fields">
                <Field label="Monthly rent today" suffix="₹"
                  value={values.rent} onChange={update("rent")} min={0} step={1000} />
                <Field label="Annual rent increase" suffix="% / YEAR"
                  value={values.rentIncrease} onChange={update("rentIncrease")}
                  min={-20} max={50} step={0.5} />
                <Field label="Renter insurance + misc." suffix="₹ / YEAR"
                  value={values.renterMisc} onChange={update("renterMisc")} min={0} step={1000} />
              </div>
            </div>

            <div className="group">
              <div className="groupTitle">04 / RENT-SIDE INVESTING</div>
              <div className="fields">
                <Field label="Return on unused down payment" suffix="% / YEAR"
                  value={values.unusedCashReturn} onChange={update("unusedCashReturn")}
                  min={0} max={50} step={0.1} />
                <Field label="Monthly investment discipline" suffix="₹ / MONTH"
                  value={values.investmentDiscipline}
                  onChange={update("investmentDiscipline")} min={0} step={1000} />
              </div>
            </div>

            <div className="note">
              <strong>MODEL FIDELITY:</strong> Salary growth and inflation appear
              in the original workbook, but they do not feed into its formulas.
              They are intentionally excluded from this calculation so the web
              version stays faithful to the supplied model.
            </div>
          </div>
        </div>

        <div className="results">
          <div className="verdict">
            <div className="eyebrow">MODELED RESULT · {values.horizon} YEARS</div>
            <h2>{rentWins ? "RENT + INVEST" : "BUY"}</h2>
            <p>
              {money(Math.abs(gap))} higher modeled financial value at the
              selected horizon under these assumptions.
            </p>
          </div>

          <div className="metrics">
            <div className="metric">
              <div className="metricLabel">BUY · HOME EQUITY</div>
              <div className="metricValue">{money(result.equity)}</div>
            </div>
            <div className="metric">
              <div className="metricLabel">RENT · PORTFOLIO</div>
              <div className="metricValue">{money(result.portfolio)}</div>
            </div>
            <div className="metric">
              <div className="metricLabel">PROPERTY VALUE</div>
              <div className="metricValue">{money(result.propertyValue)}</div>
            </div>
            <div className="metric">
              <div className="metricLabel">LOAN BALANCE</div>
              <div className="metricValue">{money(result.balance)}</div>
            </div>
            <div className="metric">
              <div className="metricLabel">MONTHLY EMI</div>
              <div className="metricValue">{money(emi)}</div>
            </div>
            <div className="metric">
              <div className="metricLabel">INITIAL CASH TO BUY</div>
              <div className="metricValue">{money(initialCash)}</div>
            </div>
          </div>

          <div className="chartBox">
            <div className="chartTitle">
              <span>FINANCIAL VALUE · 30 YEAR VIEW</span>
              <span>SELECTED: {values.horizon}Y</span>
            </div>
            <Chart rows={model.rows} horizon={Number(values.horizon) || 1} />
            <div className="legend">
              <div className="legendItem"><span className="legendLine" /> BUY EQUITY</div>
              <div className="legendItem"><span className="legendLine blue" /> RENT + INVEST</div>
            </div>
          </div>

          <div className="note">
            <strong>IMPORTANT:</strong> This is a mathematical comparison, not
            a recommendation. The workbook model does not include every real
            estate or tax cost. Use the assumptions to explore sensitivity
            rather than treating one output as a guaranteed outcome.
          </div>
        </div>
      </div>
    </section>
  );
}
