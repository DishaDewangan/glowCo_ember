import { Link } from 'react-router-dom';
import './HowItWorksPage.css';

const FEATURES = [
  {
    icon: '💬',
    title: 'Agent Chat',
    page: '/agent',
    what: 'The entire product is a conversation. No campaign builder forms.',
    how: 'Type your goal → Ember segments customers, drafts messages, and launches campaigns using 5 internal tools.',
  },
  {
    icon: '📥',
    title: 'Data Ingestion',
    page: '/segments',
    what: '2,000 GlowCo customers with orders, skin type, and purchase history.',
    how: 'Bulk JSON API + seed script populates MongoDB Atlas. Customer stats are denormalized for fast queries.',
  },
  {
    icon: '🎯',
    title: 'Segment Engine',
    page: '/segments',
    what: 'Find audiences by skin type, products bought, order recency, spend, and more.',
    how: 'Agent produces a filter object → MongoDB query runs safely. No SQL injection — just plain JSON criteria.',
  },
  {
    icon: '📤',
    title: 'Campaign Launcher',
    page: '/agent',
    what: 'Sends personalised WhatsApp/SMS/email messages to entire segments.',
    how: 'CRM batches 50 messages at a time → separate stub service simulates delivery → callbacks update stats.',
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    page: '/analytics',
    what: 'Live campaign funnel: Sent → Delivered → Opened → Clicked → Converted.',
    how: 'Read-only dashboard auto-refreshes every 5 seconds. Open rate = opened ÷ delivered (not sent).',
  },
  {
    icon: '✍️',
    title: 'Message Drafting',
    page: '/agent',
    what: 'AI writes 2 personalised message variants based on audience skin profile.',
    how: 'Claude reads segment data (skin types, channels, spend) and drafts WhatsApp-friendly copy with promo codes.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="page-container how-page">
      <div className="page-header">
        <h1>How Ember Works</h1>
        <p>
          Ember kills the campaign builder UI. You describe a goal; the AI agent runs
          the full lifecycle using internal tools. Here's what each piece does.
        </p>
      </div>

      <div className="architecture-box card">
        <h3>Architecture</h3>
        <div className="arch-flow">
          <span>You (marketer)</span>
          <span className="arrow">→</span>
          <span>Ember Agent</span>
          <span className="arrow">→</span>
          <span>MongoDB</span>
          <span className="arrow">→</span>
          <span>Stub Channel</span>
          <span className="arrow">→</span>
          <span>Analytics</span>
        </div>
        <p className="arch-note">
          Two separate Express services: CRM (port 3000) and Stub (port 3001). The stub
          simulates WhatsApp/SMS delivery and calls back with results.
        </p>
      </div>

      <div className="features-grid">
        {FEATURES.map((f) => (
          <div key={f.title} className="feature-card card">
            <span className="feature-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <div className="feature-block">
              <strong>What it is</strong>
              <p>{f.what}</p>
            </div>
            <div className="feature-block">
              <strong>How it works</strong>
              <p>{f.how}</p>
            </div>
            <Link to={f.page} className="feature-link">
              Try it →
            </Link>
          </div>
        ))}
      </div>

      <div className="not-built card">
        <h3>What we didn't build (on purpose)</h3>
        <ul>
          <li>Multi-user auth — single marketer session for clean scope</li>
          <li>Real WhatsApp API — stub is swappable with Twilio/WATI</li>
          <li>Customer edit screens — data flows from Shopify/order system</li>
          <li>A/B test UI — data model supports it, UI doesn't</li>
        </ul>
      </div>
    </div>
  );
}
