-- Base schema for TSF Demo Engine

CREATE TABLE IF NOT EXISTS forecasts (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    value FLOAT,
    arima FLOAT,
    ses FLOAT,
    hwes FLOAT
);

-- ============================
-- TSF Engine Core Extensions
-- ============================

-- Historical Table for instance forecasts
CREATE TABLE IF NOT EXISTS INSTANCE_HISTORICAL_F (
    date DATE PRIMARY KEY,
    value FLOAT,
    qmv FLOAT,
    mmv FLOAT,
    arima_q FLOAT,
    arima_m FLOAT,
    ses_q FLOAT,
    ses_m FLOAT,
    hwes_q FLOAT,
    hwes_m FLOAT
);

-- Seasonal Relatives Table
CREATE TABLE IF NOT EXISTS ME_S_MR30_INSTANCE_SR (
    date DATE PRIMARY KEY,
    value FLOAT,
    qmv FLOAT,
    mmv FLOAT,
    s_qsr FLOAT,
    s_msr FLOAT,
    s_fqsr_a1 FLOAT,
    s_fmsr_a1 FLOAT
);

-- Engine Final Forecasts (Quarterly)
CREATE TABLE IF NOT EXISTS ME_S_MR30_INSTANCE_TSF_Q_FINAL (
    date DATE PRIMARY KEY,
    forecast FLOAT,
    model TEXT
);

-- Engine Final Forecasts (Monthly)
CREATE TABLE IF NOT EXISTS ME_S_MR30_INSTANCE_TSF_M_FINAL (
    date DATE PRIMARY KEY,
    forecast FLOAT,
    model TEXT
);
