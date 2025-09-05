import pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.holtwinters import SimpleExpSmoothing

def generate_classical_forecasts(df: pd.DataFrame):
    df = df.set_index("DATE")
    series = df["VALUE"]
    results = pd.DataFrame(index=df.index)
    # ARIMA
    try:
        arima_model = ARIMA(series, order=(1,1,1)).fit()
        results["ARIMA"] = arima_model.fittedvalues
    except Exception as e:
        results["ARIMA"] = None
    # SES
    try:
        ses_model = SimpleExpSmoothing(series).fit()
        results["SES"] = ses_model.fittedvalues
    except Exception as e:
        results["SES"] = None
    # HWES
    try:
        hwes_model = ExponentialSmoothing(series, trend="add", seasonal=None).fit()
        results["HWES"] = hwes_model.fittedvalues
    except Exception as e:
        results["HWES"] = None
    results = results.reset_index()
    return results
