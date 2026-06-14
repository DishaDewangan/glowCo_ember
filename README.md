# Ember 🔥

**AI-Native CRM for D2C Brands**

Ember is a conversational CRM built for GlowCo, a fictional skincare brand.

Instead of manually creating segments, drafting messages, and launching campaigns through forms, marketers simply describe their goal in natural language.

The AI agent identifies the audience, generates campaign content, launches campaigns, and provides performance insights through a chat interface.

> "Find customers whose moisturiser has probably run out and send them a reminder."

Ember handles the rest.

---

## Live Demo

🌐 Live Application: https://glow-co-ember.vercel.app

📄 Detailed Documentation: https://github.com/DishaDewangan/glowCo_ember/blob/main/Ember_GlowCo_Project_Documentation%20(1).docx

---

## Key Features

### Conversational Campaign Creation

Create campaigns using plain English instead of forms and filters.

Example:

```text
Find customers who bought moisturiser 35+ days ago and haven't reordered.
```

The agent automatically:

* Segments customers
* Explains the audience
* Drafts personalized messages
* Recommends a communication channel
* Launches the campaign

---

### AI Agent with Tool Calling

The agent uses five backend tools:

| Tool               | Purpose                            |
| ------------------ | ---------------------------------- |
| segment_customers  | Build customer segments            |
| explain_audience   | Summarize audience characteristics |
| draft_message      | Generate campaign content          |
| launch_campaign    | Create and launch campaigns        |
| get_campaign_stats | Retrieve campaign analytics        |

---

### Smart Customer Segmentation

Supports filtering using:

* Purchase history
* Order frequency
* Spend range
* Skin type
* Preferred channel
* Product ownership
* Cohort date

Example:

```text
Customers who bought moisturiser but never sunscreen
```

---

### Campaign Analytics

Track:

* Sent
* Delivered
* Opened
* Clicked
* Converted

Open rates are calculated using delivered messages rather than total sent messages for more accurate reporting.

---

### Async Delivery Simulation

A separate Stub Service simulates real-world messaging providers.

Supported channels:

* WhatsApp
* SMS
* Email
* RCS

The CRM launches campaigns asynchronously and receives delivery events through callback APIs.

---

## Architecture

```text
React + Vite (Frontend)
           │
           ▼
Express CRM Service
           │
 ┌─────────┴─────────┐
 ▼                   ▼
MongoDB Atlas    Stub Service

                      │
                      ▼
             Delivery Callbacks
```

### Tech Stack

Frontend

* React
* Vite
* Tailwind CSS
* Recharts
* Vercel AI SDK

Backend

* Node.js
* Express
* MongoDB Atlas
* Mongoose
* Zod

AI

* Claude Sonnet
* Vercel AI SDK

Deployment

* Vercel
* Render
* MongoDB Atlas

---

## Project Structure

```text
client/
├── components/
├── pages/

server/
├── agent/
├── models/
├── routes/
├── services/

stub/
├── routes/
├── services/

scripts/
└── seed.js
```

---

## Database Design

Main collections:

* Customer
* Order
* Product
* Segment
* Campaign
* Communication

Customer documents contain denormalized fields such as:

* totalOrders
* avgSpend
* lastOrderDate
* productsPurchased
* routineCompletenessScore

This enables fast segmentation queries without joins.

---

## Example Workflow

### Step 1

User types:

```text
Find customers whose moisturiser has probably run out.
```

### Step 2

Agent creates a segment.

```text
612 customers found.
```

### Step 3

Agent drafts campaign messages.

### Step 4

Campaign launches through the Stub Service.

### Step 5

Callbacks update delivery statistics.

### Step 6

Dashboard displays performance metrics.

---

## Running Locally

### Clone Repository

```bash
git clone https://github.com/DishaDewangan/glowCo_ember.git
cd glowCo_ember
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create:

```bash
.env
```

Required variables:

```env
MONGODB_URI=
ANTHROPIC_API_KEY=
CRM_BASE_URL=
STUB_BASE_URL=
```

### Start CRM Service

```bash
npm run dev
```

### Start Stub Service

```bash
npm run dev:stub
```

### Start Frontend

```bash
npm run dev:web
```

### Seed Database

```bash
npm run seed
```

---

## Design Decisions

* MongoDB chosen for flexible customer segmentation
* Denormalized customer fields for faster queries
* Separate Stub Service to mimic real messaging providers
* Idempotent callback handling using unique stubMessageId
* Batch campaign sending to avoid request spikes
* Streaming AI responses using Server-Sent Events

---

## Future Improvements

* Multi-user authentication
* RBAC support
* Real WhatsApp/SMS integrations
* Queue-based campaign processing
* A/B testing workflows
* Automated campaign scheduling

---

## Author

Disha Dewangan

Built as part of the Xeno Engineering Internship Assignment.
