import React from 'react';
import { Link } from 'react-router-dom';
import './SegmentsPage.css';

const API_URL = import.meta.env.VITE_API_URL || '';

const SEGMENT_INFO = {
  routine_completers: 'Bought cleanser, moisturiser, and serum — full routine',
  lapsed_reorderers: 'Repeat buyers who haven\'t ordered in 45–90 days',
  one_product_buyers: 'Only bought from one product category',
  new_customers: 'Joined in the last 30 days',
  high_value_loyalists: '5+ orders with avg spend above ₹900',
  dry_skin_no_serum: 'Dry skin but never bought serum — upsell opportunity',
  sunscreen_gap: 'Bought moisturiser but never sunscreen — routine gap',
  moisturiser_reorder: 'Moisturiser likely running out (35+ days since purchase)',
};

export default function SegmentsPage() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetch(`${API_URL}/api/segments`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load segments');
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container segments-page">
      <div className="page-header">
        <h1>Customer Segments</h1>
        <p>
          Ember discovers these audiences by querying MongoDB — skin type, products
          purchased, order recency, and spend. Ask the agent to find any of these.
        </p>
      </div>

      {loading && <p className="loading-text">Loading segments from Atlas...</p>}
      {error && <p className="error-text">{error}</p>}

      {data && (
        <>
          <div className="total-banner card">
            <span className="total-num">{data.totalCustomers.toLocaleString()}</span>
            <span className="total-label">total customers in database</span>
          </div>

          <div className="segments-grid">
            {data.segments.map((seg) => (
              <div key={seg._id} className="segment-card card">
                <div className="segment-header">
                  <h3>{seg.name.replace(/_/g, ' ')}</h3>
                  <span className="segment-count">{seg.customerCount} customers</span>
                </div>
                <p className="segment-desc">
                  {SEGMENT_INFO[seg.name] || seg.description}
                </p>
                <span className="segment-source">
                  {seg.createdBy === 'agent' ? '🤖 Agent-created' : '📦 Pre-built'}
                </span>
              </div>
            ))}
          </div>

          <div className="segments-cta card">
            <h3>Want to create a custom segment?</h3>
            <p>
              Just ask the agent. Try: "Find customers with oily skin who bought cleanser
              but not moisturiser" — Ember builds the MongoDB query automatically.
            </p>
            <Link to="/agent" className="btn btn-primary">
              Open Agent →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
