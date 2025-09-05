import pandas as pd
from fastapi import APIRouter
from backend.services.forecast import generate_classical_forecasts

router = APIRouter()

@router.post("/generate")
def generate_forecast(dataset: str, target_column: str, filters: dict = None):
    df = pd.read_csv(f"data/{dataset}")
    if filters:
        for key, value in filters.items():
            if key in df.columns:
                df = df[df[key] == value]
    df = df[["DATE", target_column]].rename(columns={target_column: "VALUE"})
    forecast_df = generate_classical_forecasts(df)
    output_file = f"data/output_{dataset}"
    forecast_df.to_csv(output_file, index=False)
    return {"message": f"Forecast generated: {output_file}"}
