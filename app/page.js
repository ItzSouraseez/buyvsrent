import "./globals.css";
import Calculator from "../components/Calculator";

export default function Home() {
  return (
    <main className="page">
      <nav className="nav">
        <div className="logo">BUY<span>vs</span>RENT.IN</div>
        <div className="navTag">INDIA · FINANCIAL MODEL · 2026</div>
      </nav>

      <header className="hero">
        <div className="kicker">THE QUESTION THAT COSTS CRORES</div>
        <h1>
          BUY A HOME.<br />
          OR <span className="blue">RENT?</span>
        </h1>
        <p>
          Stop comparing EMI with rent. Model the cash, loan, property
          appreciation and investment opportunity cost across the years that
          actually matter to you.
        </p>
      </header>

      <Calculator />

      <footer className="footer">
        This calculator is a web implementation of the supplied “BUY vs RENT —
        India | 20s / Early 30s” spreadsheet model. It is an educational
        financial model, not personalized financial advice. Taxes, selling
        costs and several other real-world variables are not included unless
        explicitly shown in the inputs.
      </footer>
    </main>
  );
}
