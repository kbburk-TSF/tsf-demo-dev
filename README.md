# TSF Demo App

This demo implements a simplified **Targeted Seasonal Forecast Engine**.

## Datasets
- Air Quality (realistic schema: Date Local, Parameter Name, Arithmetic Mean, Location filters)
- Finance (dummy data)
- Flight (dummy data)

## Seasonal Model
- Includes one real seasonal model: `ME_S_MR30`

## Workflow
1. User selects dataset, filters, and target variable.
2. Backend standardizes into `DATE, VALUE`.
3. Classical forecasts (ARIMA, SES, HWES) are generated.
4. Seasonal model integration applies adjustments (future step).

---

# 🚀 Render Deployment Notes

When deploying to Render:

1. Create a **Postgres Database** service on Render.
2. Copy its `DATABASE_URL` into your Web Service environment variables.
3. The backend now auto-runs `init_db.py` on startup, which loads `sql/schema.sql`
   into the database so you don’t have to paste schema manually.
4. Suggested Start Command for Render Web Service:

```
pip install -r requirements.txt && python backend/init_db.py && uvicorn backend.main:app --host 0.0.0.0 --port 10000
```

---

# 🌱 Database Seeding

On Render startup, the backend will:
1. Apply the schema from `sql/schema.sql`
2. Auto-import seasonal model data from `data/seasonal_models/ME-S-MR30.csv`

This ensures your TSF Engine demo always has:
- Schema tables created
- Seasonal model seeded with initial values

---

# 🚀 Render Start Command

Use this as your Web Service start command on Render to ensure pip is up-to-date and DB is initialized:

```
pip install --upgrade pip && pip install -r requirements.txt && python backend/init_db.py && uvicorn backend.main:app --host 0.0.0.0 --port 10000
```

---

# ⚙️ Database Connection

This backend now reads `DATABASE_URL` from environment variables.

On Render:
1. Go to your Web Service → Environment → Add Environment Variable
2. Key: `DATABASE_URL`
3. Value: copy the **Internal Database URL** from your Render Postgres service
   (e.g. `postgresql://tsf_user:tsf_pass@dpg-xxxxx:5432/tsf_demo`)

No hardcoded `localhost` connections are used anymore.

---

# 🩺 Health Check Endpoint

The backend exposes a simple health check:

```
GET /health
→ {"status": "ok"}
```

Use this in Render to confirm the service is running.

---

# 🌐 Frontend Deployment (React + Vite)

On Render:
1. Create a **Static Site** service.
2. Root Directory: `frontend`
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. Add Environment Variable (to point to backend API):
   ```
   VITE_API_URL=https://tsf-demo-backend.onrender.com
   ```

This will serve the React dashboard that connects to your backend.
