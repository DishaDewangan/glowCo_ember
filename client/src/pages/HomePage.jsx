import { Link } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">AI-Native CRM · Skincare Edition</span>
          <h1>Tell it your goal.<br />It builds the campaign.</h1>
          <p className="hero-desc">
            Ember is GlowCo's AI marketing agent. Instead of forms and dropdowns, you
            describe what you want in plain English — and Ember finds the right customers,
            writes personalised messages, and launches campaigns for you.
          </p>
          <div className="hero-actions">
            <Link to="/agent" className="btn btn-primary">
              Try the Agent →
            </Link>
            <Link to="/how-it-works" className="btn btn-secondary">
              How it works
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <p className="hero-prompt">"Find customers whose moisturiser ran out 35+ days ago"</p>
            <div className="hero-steps">
              <span>🔍 Segment</span>
              <span>✍️ Draft</span>
              <span>📤 Send</span>
              <span>📊 Track</span>
            </div>
          </div>
        </div>
      </section>

      <section className="about-glowco">
        <h2>What is GlowCo?</h2>
        <p>
          GlowCo is a D2C Indian skincare brand selling cleansers, serums, moisturisers,
          sunscreens, and face masks. We have <strong>2,000 customers</strong> with real order
          history, skin types, and purchase patterns — all stored in MongoDB Atlas.
        </p>
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-num">2,000</span>
            <span className="stat-label">Customers</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">7,100+</span>
            <span className="stat-label">Orders</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">7</span>
            <span className="stat-label">Smart Segments</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">4</span>
            <span className="stat-label">Channels</span>
          </div>
        </div>
      </section>

      <section className="quick-start">
        <h2>What should you do?</h2>
        <div className="steps-grid">
          <div className="step-card">
            <span className="step-num">1</span>
            <h3>Go to Agent</h3>
            <p>Type a campaign goal in natural language. Try: "Who bought moisturiser but never sunscreen?"</p>
            <Link to="/agent">Open Agent →</Link>
          </div>
          <div className="step-card">
            <span className="step-num">2</span>
            <h3>Review & Send</h3>
            <p>Ember finds your audience, drafts 2 message variants, and recommends WhatsApp or email.</p>
            <Link to="/agent">Start chatting →</Link>
          </div>
          <div className="step-card">
            <span className="step-num">3</span>
            <h3>Watch Analytics</h3>
            <p>See delivery, opens, clicks, and failures update live as messages are processed.</p>
            <Link to="/analytics">View Analytics →</Link>
          </div>
        </div>
      </section>

      <section className="demo-prompts">
        <h2>Try these demo prompts</h2>
        <div className="prompts-list">
          {[
            'Find customers whose moisturiser has probably run out — bought 35+ days ago.',
            'Which customers have dry skin but never bought serum?',
            'Who bought moisturiser but never sunscreen? Their routine has a gap.',
            'Show me high-value loyalists with 5+ orders and avg spend above ₹900.',
          ].map((p) => (
            <div key={p} className="prompt-item">
              <span>💬</span>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
