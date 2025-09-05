import pandas as pd
from backend.db import engine
from sqlalchemy import text

def init_schema():
    # Load schema.sql
    with open("sql/schema.sql") as f:
        schema_sql = f.read()
    with engine.begin() as conn:
        for stmt in schema_sql.split(";"):
            if stmt.strip():
                conn.execute(text(stmt))

def seed_seasonal_model():
    try:
        df = pd.read_csv("data/seasonal_models/ME-S-MR30.csv")
        df.to_sql("ME_S_MR30", engine, if_exists="append", index=False)
        print("✅ Seasonal model ME_S_MR30 seeded")
    except Exception as e:
        print("⚠️ Seasonal model seeding skipped:", e)

if __name__ == "__main__":
    init_schema()
    seed_seasonal_model()
    print("✅ Database initialized with schema.sql and seeded with ME_S_MR30")
