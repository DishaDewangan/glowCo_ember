# How to View Your Data in MongoDB Atlas

Your GlowCo data lives in the **`glowco-ember`** database on Atlas.

## Step-by-step

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and log in
2. Click your cluster **Cluster0**
3. Click **Browse Collections** (green button)
4. Select database: **`glowco-ember`**
5. You'll see these collections:

| Collection | What's inside |
|------------|---------------|
| `customers` | 2,000 customers — name, skin type, products, spend |
| `orders` | ~7,100 orders with products and amounts |
| `products` | 8 GlowCo skincare products |
| `segments` | Pre-built + agent-created audience segments |
| `campaigns` | Launched campaigns with embedded stats |
| `communications` | Per-recipient message delivery status |

## Quick checks

- **customers** → look for `skinType`, `productsPurchased`, `totalOrders`
- **segments** → find `sunscreen_gap` (~521 customers)
- **campaigns** → after running agent, see `stats.sent`, `stats.delivered`

## Re-seed if empty

```powershell
cd server
npm run seed
```

Wait for `Seed complete!` then refresh Browse Collections.
