-- Insert 15 EV Charging Stations in Karachi City
-- These stations are pre-approved and ready for booking

-- Note: Run this script directly in your Supabase SQL Editor
-- Or use: psql -h db.dclkevefgegivbrkppth.supabase.co -U postgres -d postgres -f insert-karachi-stations.sql

-- 1. Clifton Beach Charging Hub
INSERT INTO charging_stations (
    id, name, address, latitude, longitude, price_per_kwh, 
    total_slots, available_slots, owner_id, is_approved, 
    working_hours_start, working_hours_end, created_at
) VALUES (
    gen_random_uuid(),
    'Clifton Beach Charging Hub',
    'Sea View, Clifton Block 8, Karachi',
    24.8138,
    67.0299,
    12.50,
    15,
    15,
    NULL,
    true,
    '06:00:00',
    '23:00:00',
    CURRENT_TIMESTAMP
);

-- 2. Saddar Express Charge
INSERT INTO charging_stations (
    id, name, address, latitude, longitude, price_per_kwh, 
    total_slots, available_slots, owner_id, is_approved, 
    working_hours_start, working_hours_end, created_at
) VALUES (
    gen_random_uuid(),
    'Saddar Express Charge',
    'Empress Market, Saddar Town, Karachi',
    24.8607,
    67.0099,
    10.00,
    8,
    8,
    NULL,
    true,
    '07:00:00',
    '22:00:00',
    CURRENT_TIMESTAMP
);

-- 3. Gulshan-e-Iqbal Power Station
INSERT INTO charging_stations (
    id, name, address, latitude, longitude, price_per_kwh, 
    total_slots, available_slots, owner_id, is_approved, 
    working_hours_start, working_hours_end, created_at
) VALUES (
    gen_random_uuid(),
    'Gulshan-e-Iqbal Power Station',
    'Block 13-D, Gulshan-e-Iqbal, Karachi',
    24.9207,
    67.0927,
    11.00,
    12,
    12,
    NULL,
    true,
    '08:00:00',
    '20:00:00',
    CURRENT_TIMESTAMP
);

-- 4. DHA Phase 5 EV Hub
INSERT INTO charging_stations (
    id, name, address, latitude, longitude, price_per_kwh, 
    total_slots, available_slots, owner_id, is_approved, 
    working_hours_start, working_hours_end, created_at
) VALUES (
    gen_random_uuid(),
    'DHA Phase 5 EV Hub',
    'Khayaban-e-Mujahid, DHA Phase 5, Karachi',
    24.8103,
    67.0589,
    15.00,
    20,
    20,
    NULL,
    true,
    '00:00:00',
    '23:59:59',
    CURRENT_TIMESTAMP
);

-- 5. Malir Cantt Quick Charge
INSERT INTO charging_stations (
    id, name, address, latitude, longitude, price_per_kwh, 
    total_slots, available_slots, owner_id, is_approved, 
    working_hours_start, working_hours_end, created_at
) VALUES (
    gen_random_uuid(),
    'Malir Cantt Quick Charge',
    'Malir Cantonment, Karachi',
    24.9436,
    67.2060,
    9.50,
    10,
    10,
    NULL,
    true,
    '06:00:00',
    '22:00:00',
    CURRENT_TIMESTAMP
);

-- 6. Korangi Industrial Charging Point
INSERT INTO charging_stations (
    id, name, address, latitude, longitude, price_per_kwh, 
    total_slots, available_slots, owner_id, is_approved, 
    working_hours_start, working_hours_end, created_at
) VALUES (
    gen_random_uuid(),
    'Korangi Industrial Charging Point',
    'Korangi Industrial Area, Karachi',
    24.8607,
    67.1011,
    8.50,
    25,
    25,
    NULL,
    true,
    '00:00:00',
    '23:59:59',
    CURRENT_TIMESTAMP
);

-- 7. Bahria Town EV Station
INSERT INTO charging_stations (
    id, name, address, latitude, longitude, price_per_kwh, 
    total_slots, available_slots, owner_id, is_approved, 
    working_hours_start, working_hours_end, created_at
) VALUES (
    gen_random_uuid(),
    'Bahria Town EV Station',
    'Precinct 10, Bahria Town, Karachi',
    24.9056,
    67.1878,
    13.00,
    18,
    18,
    NULL,
    true,
    '07:00:00',
    '23:00:00',
    CURRENT_TIMESTAMP
);

-- 8. North Nazimabad Charge Hub
INSERT INTO charging_stations (
    id, name, address, latitude, longitude, price_per_kwh, 
    total_slots, available_slots, owner_id, is_approved, 
    working_hours_start, working_hours_end, created_at
) VALUES (
    gen_random_uuid(),
    'North Nazimabad Charge Hub',
    'Block L, North Nazimabad, Karachi',
    24.9270,
    67.0333,
    10.50,
    14,
    14,
    NULL,
    true,
    '08:00:00',
    '21:00:00',
    CURRENT_TIMESTAMP
);

-- 9. Tariq Road Shopping District Charger
INSERT INTO charging_stations (
    id, name, address, latitude, longitude, price_per_kwh, 
    total_slots, available_slots, owner_id, is_approved, 
    working_hours_start, working_hours_end, created_at
) VALUES (
    gen_random_uuid(),
    'Tariq Road Shopping District Charger',
    'Tariq Road, PECHS, Karachi',
    24.8700,
    67.0600,
    12.00,
    10,
    10,
    NULL,
    true,
    '09:00:00',
    '23:00:00',
    CURRENT_TIMESTAMP
);

-- 10. Karachi Airport EV Parking
INSERT INTO charging_stations (
    id, name, address, latitude, longitude, price_per_kwh, 
    total_slots, available_slots, owner_id, is_approved, 
    working_hours_start, working_hours_end, created_at
) VALUES (
    gen_random_uuid(),
    'Karachi Airport EV Parking',
    'Jinnah International Airport, Karachi',
    24.9065,
    67.1608,
    16.00,
    30,
    30,
    NULL,
    true,
    '00:00:00',
    '23:59:59',
    CURRENT_TIMESTAMP
);

-- 11. Clifton Cantonment Fast Charge
INSERT INTO charging_stations (
    id, name, address, latitude, longitude, price_per_kwh, 
    total_slots, available_slots, owner_id, is_approved, 
    working_hours_start, working_hours_end, created_at
) VALUES (
    gen_random_uuid(),
    'Clifton Cantonment Fast Charge',
    'Khayaban-e-Rahat, Clifton Cantt, Karachi',
    24.8256,
    67.0363,
    14.00,
    12,
    12,
    NULL,
    true,
    '07:00:00',
    '22:00:00',
    CURRENT_TIMESTAMP
);

-- 12. Shahrah-e-Faisal Business Hub Charger
INSERT INTO charging_stations (
    id, name, address, latitude, longitude, price_per_kwh, 
    total_slots, available_slots, owner_id, is_approved, 
    working_hours_start, working_hours_end, created_at
) VALUES (
    gen_random_uuid(),
    'Shahrah-e-Faisal Business Hub Charger',
    'Shahrah-e-Faisal, Near Metropole Hotel, Karachi',
    24.8700,
    67.0700,
    11.50,
    16,
    16,
    NULL,
    true,
    '06:00:00',
    '23:00:00',
    CURRENT_TIMESTAMP
);

-- 13. Lyari Express Charging
INSERT INTO charging_stations (
    id, name, address, latitude, longitude, price_per_kwh, 
    total_slots, available_slots, owner_id, is_approved, 
    working_hours_start, working_hours_end, created_at
) VALUES (
    gen_random_uuid(),
    'Lyari Express Charging',
    'Lyari Expressway, Karachi',
    24.8700,
    66.9900,
    9.00,
    8,
    8,
    NULL,
    true,
    '07:00:00',
    '21:00:00',
    CURRENT_TIMESTAMP
);

-- 14. Port Qasim Industrial Charger
INSERT INTO charging_stations (
    id, name, address, latitude, longitude, price_per_kwh, 
    total_slots, available_slots, owner_id, is_approved, 
    working_hours_start, working_hours_end, created_at
) VALUES (
    gen_random_uuid(),
    'Port Qasim Industrial Charger',
    'Port Qasim Authority, Karachi',
    24.7833,
    67.3500,
    10.00,
    22,
    22,
    NULL,
    true,
    '00:00:00',
    '23:59:59',
    CURRENT_TIMESTAMP
);

-- 15. Scheme 33 Residential Charging
INSERT INTO charging_stations (
    id, name, address, latitude, longitude, price_per_kwh, 
    total_slots, available_slots, owner_id, is_approved, 
    working_hours_start, working_hours_end, created_at
) VALUES (
    gen_random_uuid(),
    'Scheme 33 Residential Charging',
    'Scheme 33, Gulzar-e-Hijri, Karachi',
    24.9300,
    67.1100,
    11.00,
    10,
    10,
    NULL,
    true,
    '08:00:00',
    '20:00:00',
    CURRENT_TIMESTAMP
);

-- Verify insertion
SELECT 
    name, 
    address, 
    latitude, 
    longitude, 
    price_per_kwh, 
    total_slots,
    is_approved,
    working_hours_start,
    working_hours_end
FROM charging_stations 
WHERE address LIKE '%Karachi%'
ORDER BY name;
