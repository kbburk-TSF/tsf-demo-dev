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
