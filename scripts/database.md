🗄️ Database Design & SQL Queries
Smart EV Charging Station Finder & Booking System (Supabase - PostgreSQL)
📌 Overview

This document defines the database schema and SQL queries for the EV Charging Station system.
The database is hosted on Supabase using PostgreSQL.

🧱 1. Database Schema
🔹 1.1 Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'user' or 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
🔹 1.2 Charging Stations Table
CREATE TABLE charging_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    address TEXT,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    price_per_kwh DECIMAL(6,2) NOT NULL,
    total_slots INT NOT NULL,
    available_slots INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
🔹 1.3 Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    station_id UUID REFERENCES charging_stations(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed', -- confirmed, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
🔹 1.4 Reviews Table (Optional but Recommended)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    station_id UUID REFERENCES charging_stations(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
🔗 2. Relationships
One User → Many Bookings
One Charging Station → Many Bookings
One User → Many Reviews
One Station → Many Reviews
🧪 3. Sample Data (Optional)
INSERT INTO charging_stations (name, address, latitude, longitude, price_per_kwh, total_slots, available_slots)
VALUES 
('EV Station A', 'Main Road, City', 24.8607, 67.0011, 50.00, 10, 6),
('EV Station B', 'Block 5, City', 24.8615, 67.0099, 45.00, 8, 3);
🔍 4. Core Queries
🔹 4.1 Get All Charging Stations
SELECT * FROM charging_stations;
🔹 4.2 Find Nearby Stations (Basic)
SELECT *,
       (ABS(latitude - 24.8607) + ABS(longitude - 67.0011)) AS distance
FROM charging_stations
ORDER BY distance ASC;
🔹 4.3 Search Stations by Name
SELECT * FROM charging_stations
WHERE name ILIKE '%station%';
🔹 4.4 Filter by Price
SELECT * FROM charging_stations
WHERE price_per_kwh <= 50;
🔌 5. Booking Queries
🔹 5.1 Create Booking
INSERT INTO bookings (user_id, station_id, booking_date, start_time, duration_minutes)
VALUES ('USER_ID', 'STATION_ID', '2026-04-25', '14:00', 60);
🔹 5.2 Check Availability
SELECT available_slots 
FROM charging_stations
WHERE id = 'STATION_ID';
🔹 5.3 Update Slots After Booking
UPDATE charging_stations
SET available_slots = available_slots - 1
WHERE id = 'STATION_ID' AND available_slots > 0;
🔹 5.4 Cancel Booking
UPDATE bookings
SET status = 'cancelled'
WHERE id = 'BOOKING_ID';
🔹 5.5 Restore Slot After Cancellation
UPDATE charging_stations
SET available_slots = available_slots + 1
WHERE id = 'STATION_ID';
🔹 5.6 Get User Bookings
SELECT b.*, cs.name AS station_name
FROM bookings b
JOIN charging_stations cs ON b.station_id = cs.id
WHERE b.user_id = 'USER_ID';
⭐ 6. Review Queries
🔹 Add Review
INSERT INTO reviews (user_id, station_id, rating, comment)
VALUES ('USER_ID', 'STATION_ID', 5, 'Great service!');
🔹 Get Reviews for Station
SELECT * FROM reviews
WHERE station_id = 'STATION_ID';
⚡ 7. Advanced Queries (Optional but Impressive)
🔹 Top Rated Stations
SELECT cs.name, AVG(r.rating) AS avg_rating
FROM charging_stations cs
JOIN reviews r ON cs.id = r.station_id
GROUP BY cs.name
ORDER BY avg_rating DESC;
🔹 Most Booked Stations
SELECT cs.name, COUNT(b.id) AS total_bookings
FROM charging_stations cs
JOIN bookings b ON cs.id = b.station_id
GROUP BY cs.name
ORDER BY total_bookings DESC;
🔐 8. Security Notes
Always hash passwords before storing
Use Supabase Row Level Security (RLS) for access control
Restrict direct table access from frontend