import Dashboard from '../components/Dashboard.jsx';
import './DashboardPage.css';

export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Campaign Analytics</h1>
        <p>
          Live delivery and engagement metrics. Open rate is calculated against
          delivered messages, not sent.
        </p>
      </div>
      <Dashboard />
    </div>
  );
}
