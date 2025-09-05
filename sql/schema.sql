CREATE TABLE air_quality (
    id SERIAL PRIMARY KEY,
    date_local DATE NOT NULL,
    parameter_name TEXT NOT NULL,
    arithmetic_mean FLOAT NOT NULL,
    local_site_name TEXT,
    state_name TEXT,
    county_name TEXT,
    city_name TEXT,
    cbsa_name TEXT
);
