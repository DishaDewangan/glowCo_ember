import React from 'react';
import CampaignStats from './CampaignStats.jsx';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || '';
const REFRESH_INTERVAL = 5000;

export default function Dashboard() {
  const [campaigns, setCampaigns] = React.useState([]);
  const [selectedId, setSelectedId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [lastUpdated, setLastUpdated] = React.useState(null);

  const fetchCampaigns = React.useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/analytics/overview`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCampaigns(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  React.useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchCampaigns]);

  const selected = campaigns.find((c) => c.id === selectedId);

  if (loading) {
    return <div className="dashboard-loading">Loading campaigns...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Campaign Analytics</h2>
          <p className="dashboard-sub">
            Live delivery and engagement metrics. Auto-refreshes every 5s.
          </p>
        </div>
        {lastUpdated && (
          <span className="last-updated">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {campaigns.length === 0 ? (
        <div className="dashboard-empty">
          <p>No campaigns yet.</p>
          <p>Launch a campaign through the Agent to see analytics here.</p>
        </div>
      ) : (
        <div className="dashboard-grid">
          <div className="campaign-list">
            <h3>Campaigns</h3>
            {campaigns.map((c) => (
              <button
                key={c.id}
                className={`campaign-item ${selectedId === c.id ? 'active' : ''}`}
                onClick={() => setSelectedId(c.id)}
              >
                <div className="campaign-item-name">{c.name}</div>
                <div className="campaign-item-meta">
                  <span className={`status status-${c.status}`}>{c.status}</span>
                  <span>{c.channel}</span>
                  <span>{c.stats?.sent || 0} sent</span>
                </div>
              </button>
            ))}
          </div>

          <div className="campaign-detail">
            {selected ? (
              <>
                <div className="detail-header">
                  <div>
                    <h3>{selected.name}</h3>
                    <p>
                      Segment: {selected.segmentName} ({selected.segmentSize} customers) ·{' '}
                      {selected.channel}
                    </p>
                  </div>
                  <span className={`status status-${selected.status}`}>
                    {selected.status}
                  </span>
                </div>
                <CampaignStats stats={selected.stats} />
              </>
            ) : (
              <p>Select a campaign to view stats.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
