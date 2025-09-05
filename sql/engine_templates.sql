-- ============================
-- TSF Engine Table Templates
-- ============================

-- Replace INSTANCE and [S] with specific values when deploying

-- Historical Instance Table
CREATE TABLE {INSTANCE}_HISTORICAL_F (...);

-- Seasonal Relatives Table
CREATE TABLE {S}_{INSTANCE}_SR (...);

-- Engine Forecast Container
CREATE TABLE {S}_{INSTANCE}_ENGINE (...);

-- Final Forecast Outputs
CREATE TABLE {S}_{INSTANCE}_TSF_Q_FINAL (...);
CREATE TABLE {S}_{INSTANCE}_TSF_M_FINAL (...);
