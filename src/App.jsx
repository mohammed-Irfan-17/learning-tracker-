import './App.css'

/**
 * App.jsx – root component.
 *
 * Stage 0: Displays a placeholder landing screen.
 * Future stages will add routing (React Router) and render
 * the Dashboard, LogEntry, and Reports pages here.
 */
function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <span className="app-header__logo">📚</span>
          <h1 className="app-header__title">Personal Learner Tracker</h1>
          <span className="app-header__badge">v0.1 – Stage 0</span>
        </div>
      </header>

      <main className="app-main">
        <section className="hero">
          <h2 className="hero__heading">Project Setup Complete</h2>
          <p className="hero__sub">
            React&nbsp;+&nbsp;Vite&nbsp;+&nbsp;Recharts scaffold is ready.
            Features will be added stage by stage.
          </p>

          <div className="hero__stack">
            {[
              { label: 'React',     ver: '19',  icon: '⚛️' },
              { label: 'Vite',      ver: '8',   icon: '⚡' },
              { label: 'Recharts',  ver: '3',   icon: '📊' },
              { label: 'Plain CSS', ver: '—',   icon: '🎨' },
            ].map(({ label, ver, icon }) => (
              <div key={label} className="stack-card">
                <span className="stack-card__icon">{icon}</span>
                <span className="stack-card__label">{label}</span>
                <span className="stack-card__ver">{ver}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>Stage&nbsp;0&nbsp;·&nbsp;Setup&nbsp;only&nbsp;·&nbsp;No features yet</p>
      </footer>
    </div>
  )
}

export default App
