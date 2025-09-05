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
