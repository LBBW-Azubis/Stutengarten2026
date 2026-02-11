import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Login from './Login'
import Dashboard from './Dashboard'

function DebugLocation() {
  const loc = useLocation()
  return (
    <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>
      current path: <code>{loc.pathname}</code>
    </div>
  )
}

function NoMatch() {
  const loc = useLocation()
  return (
    <div style={{ textAlign: 'center', marginTop: 40 }}>
      <h2>Kein Route-Match</h2>
      <p>Aktueller Pfad: <code>{loc.pathname}</code></p>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <header style={{ textAlign: 'center', padding: '12px 0' }}>
        <strong>Stutengarten</strong>
      </header>

      <DebugLocation />

      <nav className="app-nav">
        {/* Navigation Links */}
        <Link to="/" aria-current="page">Login</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      {/* Die eigentlichen Seiten */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </Router>
  )
}
