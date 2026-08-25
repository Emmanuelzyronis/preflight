import { Report } from './pages/Report';

export function App() {
  return (
    <main className="app-shell">
      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">STRK20 privacy simulator</p>
        <h1 id="page-title">Preflight</h1>
        <p className="summary">
          Inspect what a shielded transaction could reveal before you sign it.
        </p>
        <div className="status" role="status">
          <span className="status-dot" aria-hidden="true" />
          Day 1 scaffold is online
        </div>
        <Report modeled={false} />
      </section>
    </main>
  );
}
