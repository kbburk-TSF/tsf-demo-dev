import pandas as pd
from sqlalchemy import text
from backend.db import engine

def load_historical_instance(instance_name: str, forecast_df: pd.DataFrame):
    """
    Load classical forecasts into [INSTANCE]_HISTORICAL_F
    """
    table_name = f"{instance_name}_HISTORICAL_F"
    forecast_df.to_sql(table_name, engine, if_exists="replace", index=False)

def compute_seasonal_relatives(instance_name: str):
    """
    Join historical forecasts with seasonal model ME_S_MR30
    Compute QSR, MSR, FQSR, FMSR values
    """
    with engine.begin() as conn:
        conn.execute(text(f"""
        INSERT INTO ME_S_MR30_{instance_name}_SR (date, value, qmv, mmv, s_qsr, s_msr)
        SELECT h.date,
               h.value,
               h.qmv,
               h.mmv,
               (AVG(h.value) OVER (PARTITION BY sm.quarter_code) / h.qmv) AS s_qsr,
               (AVG(h.value) OVER (PARTITION BY sm.quarter_month_code) / h.mmv) AS s_msr
        FROM {instance_name}_HISTORICAL_F h
        JOIN ME_S_MR30 sm ON h.date = sm.date;
        """))
