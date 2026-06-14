# Deployment Guide — Ember (GlowCo)

Complete steps to connect MongoDB Atlas and deploy frontend + backend.

---

## Part 1: MongoDB Atlas (15 min)

### Step 1 — Create account & cluster
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up (free)
3. Create a **free M0 cluster** (AWS, region closest to you e.g. Mumbai `ap-south-1`)
4. Cluster name: `Cluster0` (default is fine)

### Step 2 — Create database user
1. Left sidebar → **Database Access** → **Add New Database User**
2. Authentication: **Password**
3. Username: `glowco_admin` (or anything)
4. Password: generate a strong password → **save it**
5. Privileges: **Read and write to any database**
6. Click **Add User**

### Step 3 — Allow network access
1. Left sidebar → **Network Access** → **Add IP Address**
2. For development: click **Allow Access from Anywhere** (`0.0.0.0/0`)
   - Required for Railway deployment (IPs change)
3. Click **Confirm**

### Step 4 — Get connection string
1. Left sidebar → **Database** → **Connect** on your cluster
2. Choose **Drivers** → Node.js → version 5.5 or later
3. Copy the connection string:
   ```
   mongodb+srv://glowco_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password (URL-encode special chars: `@` → `%40`, `#` → `%23`)
5. Add database name before `?`:
   ```
   mongodb+srv://glowco_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/glowco-ember?retryWrites=true&w=majority
   ```

### Step 5 — Update local `.env` and seed
1. Open `server/.env`
2. Set:
   ```env
   MONGODB_URI=mongodb+srv://glowco_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/glowco-ember?retryWrites=true&w=majority
   ```
3. Seed Atlas database:
   ```powershell
   Set-Location "c:\Users\ASUS\Documents\xeno backup\glowco-ember\server"
   npm run seed
   ```
4. Verify in Atlas → **Browse Collections** → you should see `customers`, `orders`, `products`, etc.

---

## Part 2: Deploy CRM Backend (Railway)

### Step 1 — Push code to GitHub
```powershell
cd "c:\Users\ASUS\Documents\xeno backup\glowco-ember"
git init
git add .
git commit -m "feat: initial Ember GlowCo CRM monorepo"
```
Create a repo on GitHub and push (use GitHub website → New repository → copy commands).

### Step 2 — Create Railway project (CRM service)
1. Go to [railway.app](https://railway.app) → sign up with GitHub
2. **New Project** → **Deploy from GitHub repo** → select your repo
3. Click the service → **Settings**:
   - **Root Directory**: `server`
   - **Start Command**: `npm start`
4. **Variables** tab — add:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | your Atlas connection string |
| `ANTHROPIC_API_KEY` | your Anthropic key |
| `PORT` | `3000` |
| `STUB_SERVICE_URL` | `http://localhost:3001` *(update after stub deploy)* |
| `CRM_CALLBACK_URL` | `https://YOUR-CRM-SERVICE.up.railway.app` *(after first deploy)* |
| `CLIENT_URL` | `https://YOUR-APP.vercel.app` *(after frontend deploy)* |
| `DEMO_MODE` | `true` *(set `false` when Anthropic credits are active)* |
| `NODE_TLS_REJECT_UNAUTHORIZED` | `0` |

5. **Settings** → **Networking** → **Generate Domain**
6. Copy the URL e.g. `https://glowco-crm-production.up.railway.app`

### Step 3 — Update CRM_CALLBACK_URL
Go back to Variables → set `CRM_CALLBACK_URL` to your CRM Railway URL → redeploy.

---

## Part 3: Deploy Stub Service (Railway)

1. In the same Railway project → **+ New Service** → **GitHub Repo** → same repo
2. **Settings**:
   - **Root Directory**: `stub`
   - **Start Command**: `npm start`
3. **Variables**:

| Variable | Value |
|----------|-------|
| `PORT` | `3001` |
| `CRM_CALLBACK_URL` | `https://YOUR-CRM-SERVICE.up.railway.app` |

4. **Generate Domain** → copy stub URL e.g. `https://glowco-stub-production.up.railway.app`

### Link CRM ↔ Stub
Go to **CRM service** variables → update:
```
STUB_SERVICE_URL=https://YOUR-STUB-SERVICE.up.railway.app
```
Redeploy CRM.

---

## Part 4: Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → sign up with GitHub
2. **Add New Project** → import your GitHub repo
3. **Configure**:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://YOUR-CRM-SERVICE.up.railway.app` |

5. Click **Deploy**
6. Copy your Vercel URL e.g. `https://glowco-ember.vercel.app`

### Final CORS update
Go to Railway **CRM service** → update:
```
CLIENT_URL=https://YOUR-APP.vercel.app
```
Redeploy CRM.

---

## Part 5: Verify Production

1. Open your Vercel URL
2. Try: *"Who bought moisturiser but never sunscreen?"*
3. Agent should segment → draft → respond
4. Say *"Send draft A"* → switch to Analytics tab
5. Stats should update within 30–60 seconds

Health checks:
- `https://YOUR-CRM.up.railway.app/health` → `{ "status": "ok" }`
- `https://YOUR-STUB.up.railway.app/health` → `{ "status": "ok" }`

---

## Part 6: Anthropic API Credits

Your API key is saved in `server/.env`. If you see infinite loading:
- Both keys tested returned **"credit balance too low"**
- App runs in **demo mode** (`DEMO_MODE=true`) — real DB tools, template messages
- To use real Claude: add credits at [console.anthropic.com](https://console.anthropic.com) → set `DEMO_MODE=false` on Railway → redeploy

---

## Environment Variable Cheat Sheet

### server/.env (local)
```env
MONGODB_URI=mongodb+srv://...
ANTHROPIC_API_KEY=sk-ant-...
PORT=3000
STUB_SERVICE_URL=http://localhost:3001
CRM_CALLBACK_URL=http://localhost:3000
CLIENT_URL=http://localhost:5173
DEMO_MODE=true
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### stub/.env (local)
```env
PORT=3001
CRM_CALLBACK_URL=http://localhost:3000
```

### client/.env (local)
```env
VITE_API_URL=http://localhost:3000
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| MongoDB connection failed | Check password URL-encoding, IP whitelist `0.0.0.0/0` |
| CORS error in browser | Set `CLIENT_URL` on CRM to exact Vercel URL |
| Agent infinite loading | Check `ANTHROPIC_API_KEY`; use `DEMO_MODE=true` as fallback |
| Analytics empty | Launch a campaign first via agent chat |
| Stub callbacks not updating | Verify `CRM_CALLBACK_URL` on stub points to CRM Railway URL |
| SSL certificate error (Windows) | `NODE_TLS_REJECT_UNAUTHORIZED=0` on CRM service |

---

## Submission Checklist

- [ ] MongoDB Atlas seeded (2000 customers visible in Atlas UI)
- [ ] CRM deployed on Railway with public URL
- [ ] Stub deployed on Railway with public URL
- [ ] Frontend deployed on Vercel with public URL
- [ ] Full demo flow works on production URL
- [ ] 5–6 min walkthrough video recorded
- [ ] GitHub repo with meaningful commit history
