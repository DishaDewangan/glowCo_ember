import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import HowItWorksPage from './pages/HowItWorksPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import SegmentsPage from './pages/SegmentsPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import './App.css';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/agent', label: 'Agent' },
  { to: '/segments', label: 'Segments' },
  { to: '/analytics', label: 'Analytics' },
];

export default function App() {
  const location = useLocation();
  const isAgent = location.pathname === '/agent';

  return (
    <div className="app">
      <header className="app-header">
        <NavLink to="/" className="brand">
          <span className="brand-leaf">🌿</span>
          <div>
            <h1>Ember</h1>
            <span className="brand-sub">by GlowCo</span>
          </div>
        </NavLink>
        <nav className="nav">
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className={`app-main ${isAgent ? 'app-main--chat' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/agent" element={<ChatPage />} />
          <Route path="/segments" element={<SegmentsPage />} />
          <Route path="/analytics" element={<DashboardPage />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>Ember — AI-native CRM for GlowCo · 2,000 customers · MongoDB Atlas</p>
      </footer>
    </div>
  );
}
