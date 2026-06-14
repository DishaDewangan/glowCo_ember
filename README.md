# Ember — GlowCo AI-Native CRM

**Tell it your goal. It builds the campaign.**

Ember is an AI-agent CRM for D2C skincare brands. Marketers describe campaign goals in natural language; Ember segments customers, drafts personalised messages, launches campaigns, and reports performance — all through conversation.

## Architecture

```
CRM Service (Express, :3000)  ←→  Stub Service (Express, :3001)
         ↓
    MongoDB Atlas
         ↑
React + Vite Frontend (:5173)
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Anthropic API key

### 1. Install dependencies

```bash
cd server && npm install
cd ../stub && npm install
cd ../client && npm install
```

### 2. Configure environment

```bash
# server/.env
cp server/.env.example server/.env
# Set MONGODB_URI and ANTHROPIC_API_KEY

# stub/.env
cp stub/.env.example stub/.env

# client/.env
cp client/.env.example client/.env
```

### 3. Seed the database

```bash
cd server
npm run seed
```

This creates 2,000 GlowCo customers, ~8,500 orders, 8 products, and 7 pre-built segments.

### 4. Run all services

```bash
# Terminal 1 — CRM
cd server && npm run dev

# Terminal 2 — Stub
cd stub && npm run dev

# Terminal 3 — Frontend
cd client && npm run dev
```

Open http://localhost:5173

## Demo Prompts

1. **Reorder campaign:** "Find customers whose moisturiser has probably run out — bought 35+ days ago, no reorder."
2. **Skin-specific upsell:** "Which customers have dry skin but never bought serum?"
3. **Sunscreen gap:** "Who bought moisturiser but never sunscreen?"
4. **Stats review:** "How did the last campaign perform?"

## Agent Tools

| Tool | Purpose |
|------|---------|
| `segment_customers` | Build MongoDB query from filter criteria |
| `draft_message` | Generate 2 message variants via Claude |
| `launch_campaign` | Batch send to stub channel service |
| `get_campaign_stats` | Return delivery/engagement metrics |
| `explain_audience` | Plain-English audience profile |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/agent/chat` | Streaming agent chat |
| POST | `/api/customers/bulk` | Bulk customer/order ingest |
| GET | `/api/campaigns` | List campaigns |
| GET | `/api/analytics/overview` | Dashboard data |
| POST | `/crm/receipts` | Stub delivery callbacks |
| POST | `/stub/send` | Stub message queue |

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for full MongoDB Atlas + Railway + Vercel steps.

Quick summary:
- **Database:** MongoDB Atlas M0 (free)
- **CRM + Stub:** Railway (two services, root dirs `server/` and `stub/`)
- **Frontend:** Vercel (root dir `client/`)

Set `CLIENT_URL` on CRM and `VITE_API_URL` on Vercel after deploy.

## What I Didn't Build

- Multi-user auth (single marketer session)
- Real WhatsApp/SMS (stub is swappable)
- Customer profile editing
- Skin quiz onboarding
- A/B test UI

## Stack

React + Vite · Express · MongoDB + Mongoose · Vercel AI SDK · Claude Sonnet · Recharts
