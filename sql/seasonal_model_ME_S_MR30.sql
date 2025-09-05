-- Seasonal Model: ME-S-MR30

CREATE TABLE IF NOT EXISTS ME_S_MR30 (
    date DATE PRIMARY KEY,
    model_code TEXT,
    quarter_code TEXT,
    quarter_month_code TEXT,
    year_quarter_month_code TEXT,
    p1_k FLOAT,
    p2_k FLOAT,
    p3_k FLOAT,
    q_p1_k FLOAT,
    q_p2_k FLOAT,
    q_p3_k FLOAT,
    qm_p1_k FLOAT,
    qm_p2_k FLOAT,
    qm_p3_k FLOAT
);
