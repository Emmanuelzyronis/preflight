import { Home } from './pages/Home';

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
          Day 5 report UI is online
        </div>
        <Home />
      </section>
    </main>
  );
}
