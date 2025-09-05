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

---

# 🛠️ Frontend Build Notes

The `frontend/package.json` now includes Vite scripts:

- `npm run dev` → Start dev server (local testing)
- `npm run build` → Build production bundle (used by Render)
- `npm run preview` → Preview the build

On Render, use:
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

---

# 🧭 Frontend Routing

The frontend now uses **react-router-dom**:

- `/` → Dataset Selector
- `/dashboard` → Dashboard view

Navigation is provided by a simple top nav bar.

---

# 🔄 Dataset Flow

- User selects a dataset on `/`
- On submit → app navigates to `/dashboard`
- The Dashboard receives the selected dataset via navigation state

---

# 🔌 Dashboard Backend Integration

- Dashboard now auto-calls backend `/forecast/generate` when a dataset is selected.
- Request payload includes:
  - `dataset`: name from Dataset Selector
  - `target_column`: `"Arithmetic Mean"` (default for now)
  - `filters`: `{}` (empty object, extendable)
- Backend response is displayed in raw JSON on the Dashboard.

---

# 🎛️ Filter Selection

- Users can now enter a filter **key** and **value** in Dataset Selector.
  - Example: Key = `"State Name"`, Value = `"California"`
- These filters are passed to Dashboard and sent to backend in the forecast request.

---

# 📊 Dashboard Forecast Display

- Forecast results are now displayed in a clean **table format** instead of raw JSON.
- Table headers are auto-generated from backend response keys.
- Each forecast entry appears as a row in the table.

---

# 📈 Chart Visualization

- The Dashboard now includes a **line chart** using Recharts.
- X-axis → `date`
- Y-axis → `forecast`
- Displays trends alongside the forecast results table.

---

# 🏁 Frontend Entrypoint

- Added `frontend/index.html` as the Vite entrypoint.
- Added `frontend/src/main.jsx` to mount React app into `#root` div.
- These ensure Vite builds correctly on Render.

---

# ⚡ JSX Fix

- Removed old `App.js` file that caused Vite build errors.
- App is now fully in `App.jsx`.
- `main.jsx` imports `App.jsx` explicitly.

---

# 🔍 JSX File Scan

No additional `.js` files contained JSX.

---

# 🛑 Version Locking

- Locked Node.js version: **22.6.0**
- Locked Vite version: **5.2.0**
- This ensures stable builds on Render without breaking changes from newer releases.

---

# 🔒 Dependency Locking

The following dependencies are now locked to stable versions:
- **react**: 18.2.0
- **react-dom**: 18.2.0
- **react-router-dom**: 6.22.3
- **recharts**: 2.12.7

This prevents breaking changes from future releases.

---

# 📤 CSV Upload Feature

- Added **DataUpload.jsx** frontend component with:
  - Target DB selection
  - CSV file upload
  - Live progress updates via SSE

- Backend `/api/upload-csv` handles CSV ingestion
- Backend `/api/upload-status/{job_id}` streams real-time progress messages

