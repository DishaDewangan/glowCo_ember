# 🔥 Ember — GlowCo AI-Native CRM

> Tell it your goal. It builds the campaign.

Ember is an AI-native CRM built for GlowCo, a fictional D2C skincare brand.

Instead of manually creating customer segments, drafting campaign messages, and launching campaigns through multiple screens, marketers simply describe their goal in natural language.

The AI agent then:

* Identifies the target audience
* Explains audience characteristics
* Generates personalized campaign messages
* Recommends the best communication channel
* Launches campaigns
* Tracks delivery and engagement metrics

The result is a conversational CRM where the primary interface is an AI agent rather than forms and dashboards.

---

## Live Demo

🌐 Live Application: https://glow-co-ember.vercel.app

📄 Detailed Documentation: https://github.com/DishaDewangan/glowCo_ember/blob/main/Ember_GlowCo_Project_Documentation%20(1).docx

---

## ✨ Features

### Conversational Campaign Creation

Create campaigns using plain English.

Example:

```text
Find customers whose moisturiser has probably run out and haven't reordered.
```

The agent automatically:

* Creates a segment
* Explains the audience
* Drafts messages
* Recommends a channel
* Launches the campaign

---

### AI Agent Workflow

The agent can perform multi-step reasoning using tool calling.

Example workflow:

```text
segment_customers
        ↓
explain_audience
        ↓
draft_message
        ↓
launch_campaign
        ↓
get_campaign_stats
```

---

### Smart Customer Segmentation

Supports segmentation using:

* Purchase history
* Order frequency
* Average spend
* Skin type
* Preferred channel
* Product ownership
* Cohort date
* Routine completeness

Example:

```text
Who bought moisturiser but never sunscreen?
```

---

### Campaign Analytics

Track:

* Sent
* Delivered
* Opened
* Clicked
* Converted

Open rates are calculated using delivered messages rather than total sent messages.

---

### Async Delivery Simulation

A separate Stub Service simulates messaging providers such as:

* WhatsApp
* SMS
* Email
* RCS

The CRM launches campaigns asynchronously and receives delivery events through callback APIs.

---

## 🏗️ Architecture

```text
React + Vite Frontend (:5173)
            │
            ▼
CRM Service (Express :3000)
            │
    ┌───────┴────────┐
    ▼                ▼
MongoDB Atlas    Stub Service (:3001)

                     │
                     ▼
              Delivery Callbacks
```

### Architecture Highlights

* Separate CRM and Stub services
* Streaming AI responses using Server-Sent Events
* MongoDB Atlas with denormalized customer profiles
* Idempotent callback processing
* Batched campaign launches
* Real-time analytics dashboard

---

## 🤖 Agent Tools

| Tool               | Purpose                                  |
| ------------------ | ---------------------------------------- |
| segment_customers  | Build MongoDB query from filter criteria |
| explain_audience   | Generate audience summary                |
| draft_message      | Generate campaign content using Claude   |
| launch_campaign    | Launch campaigns through Stub Service    |
| get_campaign_stats | Retrieve campaign performance metrics    |

---

## 🧪 Demo Prompts

Try these prompts in the chat interface:

### Reorder Campaign

```text
Find customers whose moisturiser has probably run out — bought 35+ days ago and haven't reordered.
```

### Sunscreen Gap

```text
Who bought moisturiser but never sunscreen?
```

### Dry Skin Upsell

```text
Which customers have dry skin but never bought serum?
```

### Campaign Performance

```text
How did the last campaign perform?
```

---

## 📊 Pre-Built Segments

The seed data includes several discoverable customer segments:

* Routine Completers
* Lapsed Reorderers
* One-Product Buyers
* New Customers
* High-Value Loyalists
* Dry Skin, No Serum
* Sunscreen Gap

---

## 🗄️ Database Design

Collections:

* Customer
* Order
* Product
* Segment
* Campaign
* Communication

Customer documents include denormalized fields:

* totalOrders
* avgSpend
* lastOrderDate
* productsPurchased
* routineCompletenessScore

This allows segmentation queries without joins.

---

## 🔌 API Endpoints

| Method | Endpoint                | Description           |
| ------ | ----------------------- | --------------------- |
| POST   | /api/agent/chat         | Streaming AI chat     |
| POST   | /api/customers/bulk     | Bulk customer ingest  |
| GET    | /api/campaigns          | Campaign listing      |
| GET    | /api/analytics/overview | Dashboard analytics   |
| POST   | /crm/receipts           | Delivery callbacks    |
| POST   | /stub/send              | Stub message delivery |

---

## ⚙️ Quick Start

### Prerequisites

* Node.js 18+
* MongoDB Atlas or local MongoDB
* Anthropic API Key

### Install Dependencies

```bash
cd server && npm install
cd ../stub && npm install
cd ../client && npm install
```

### Configure Environment

```bash
cp server/.env.example server/.env
cp stub/.env.example stub/.env
cp client/.env.example client/.env
```

Required variables:

```env
MONGODB_URI=
ANTHROPIC_API_KEY=
CLIENT_URL=
CRM_BASE_URL=
STUB_BASE_URL=
VITE_API_URL=
```

### Seed Database

```bash
cd server
npm run seed
```

Creates:

* 2,000 customers
* ~8,500 orders
* Product catalogue
* Pre-built customer segments

### Run Services

CRM

```bash
cd server && npm run dev
```

Stub

```bash
cd stub && npm run dev
```

Frontend

```bash
cd client && npm run dev
```

Open:

```text
http://localhost:5173
```

---

## 🚢 Deployment

### Production Stack

| Layer        | Platform         |
| ------------ | ---------------- |
| Frontend     | Vercel           |
| CRM Service  | Railway / Render |
| Stub Service | Railway / Render |
| Database     | MongoDB Atlas    |

After deployment:

* Configure CLIENT_URL on CRM
* Configure VITE_API_URL on Frontend
* Configure callback URLs for Stub Service

See `DEPLOYMENT.md` for complete instructions.

---

## 🎯 Key Design Decisions

* MongoDB chosen for flexible segmentation queries
* Denormalized customer fields for fast lookups
* Separate Stub Service to mirror real-world messaging providers
* Fire-and-forget delivery architecture
* Idempotent callback processing using unique stubMessageId
* Batched campaign launches to prevent request spikes
* Streaming AI responses using Vercel AI SDK

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* Recharts

### Backend

* Node.js
* Express
* MongoDB Atlas
* Mongoose
* Zod

### AI

* Claude Sonnet
* Vercel AI SDK

### Deployment

* Vercel
* Railway / Render
* MongoDB Atlas

---

## 👩‍💻 Author

Disha Dewangan

Built for the Xeno Engineering Internship Assignment.
