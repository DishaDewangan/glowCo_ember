# Atlas connection fix (required once)

Your MongoDB Atlas URL is saved, but Atlas is **blocking your IP**.

## Fix in 30 seconds

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Network Access** (left sidebar)
3. **Add IP Address** → **Allow Access from Anywhere**
4. Confirm (`0.0.0.0/0`) — required for Railway deployment too
5. Wait 1–2 minutes, then run:

```powershell
Set-Location "c:\Users\ASUS\Documents\xeno backup\glowco-ember\server"
npm run seed
```

You should see `Seed complete!` and 2000 customers in Atlas → Browse Collections.
