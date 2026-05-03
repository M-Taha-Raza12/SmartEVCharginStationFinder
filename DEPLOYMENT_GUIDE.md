# 🚀 Deployment Guide - Supabase Setup

## Current Status

✅ **Local Development:** Working with in-memory database
⚠️ **Supabase:** Connection failing locally due to DNS issues
✅ **Deployment Ready:** Will work when deployed to a server

---

## 📋 Supabase Setup Steps

### Step 1: Create Database Tables

Go to your Supabase dashboard and run this SQL:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'Client',
    business_name VARCHAR(150),
    contact_details TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Charging stations table
CREATE TABLE IF NOT EXISTS charging_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    address TEXT,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    price_per_kwh DECIMAL(6,2) NOT NULL,
    total_slots INT NOT NULL,
    available_slots INT NOT NULL,
    owner_id UUID,
    is_approved BOOLEAN DEFAULT false,
    working_hours_start TIME,
    working_hours_end TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    station_id UUID,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    station_id UUID,
    booking_id UUID,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info',
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    station_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, station_id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    booking_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'PKR',
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    transaction_id VARCHAR(200),
    payment_gateway VARCHAR(50),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    balance DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'PKR',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallet transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    related_entity_id UUID,
    related_entity_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Charging sessions table
CREATE TABLE IF NOT EXISTS charging_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL,
    user_id UUID NOT NULL,
    station_id UUID NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    energy_consumed DECIMAL(10,2) DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    start_battery_level INT,
    end_battery_level INT,
    peak_power DECIMAL(10,2),
    average_power DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 2: Create Test Users

```sql
-- Insert test users (passwords are hashed with BCrypt)
INSERT INTO users (id, full_name, email, password_hash, role, is_active) VALUES
('1e5a73cc-8cb7-47b6-baac-96f77743d4a0', 'Test Client', 'client@test.com', '$2a$11$YourHashedPasswordHere', 'Client', true),
('2f6b84dd-9dc8-58c7-cbbd-a7088854e5b1', 'Test Owner', 'owner@test.com', '$2a$11$YourHashedPasswordHere', 'Owner', true),
('3a7c95ee-aed9-69d8-dcce-b8099965f6c2', 'Super Admin', 'admin123@gmail.com', '$2a$11$YourHashedPasswordHere', 'SuperAdmin', true)
ON CONFLICT (email) DO NOTHING;
```

**Note:** You'll need to hash the passwords. Use the register endpoint to create users instead.

### Step 3: Insert Sample Stations

```sql
-- Run the SQL from scripts/insert-karachi-stations.sql
```

---

## 🌐 Deployment Options

### Option 1: Deploy to Azure

**Backend (Azure App Service):**
1. Create Azure App Service (ASP.NET Core 10.0)
2. Set environment variables:
   - `ConnectionStrings__DefaultConnection` = Your Supabase connection string
   - `Jwt__Secret` = Your JWT secret
   - `Groq__ApiKey` = Your Groq API key
3. Deploy from Visual Studio or GitHub Actions

**Frontend (Azure Static Web Apps):**
1. Create Azure Static Web App
2. Set environment variable:
   - `VITE_API_BASE_URL` = Your backend URL
3. Deploy from GitHub

### Option 2: Deploy to Vercel/Netlify

**Backend:** Deploy to Railway, Render, or Fly.io
**Frontend:** Deploy to Vercel or Netlify

### Option 3: Deploy to VPS (DigitalOcean, AWS EC2)

1. Install .NET 10.0 SDK
2. Install Node.js 18+
3. Clone repository
4. Set environment variables
5. Run with PM2 or systemd

---

## 🔧 Environment Variables

### Backend (.env or appsettings.json)

```
ConnectionStrings__DefaultConnection=Host=db.dclkevefgegivbrkppth.supabase.co;Database=postgres;Username=postgres;Password=YdwTH5ccSSxPAxhs;Port=5432;SSL Mode=Require;Trust Server Certificate=true

Jwt__Secret=your-super-secret-jwt-key-change-this-in-production-min-32-chars-long
Jwt__Issuer=evcharging-api
Jwt__Audience=evcharging-client
Jwt__ExpiryMinutes=120

Groq__ApiKey=your-groq-api-key-here
Groq__Model=openai/gpt-oss-120b

Cors__AllowedOrigins__0=https://your-frontend-url.com
```

### Frontend (.env)

```
VITE_API_BASE_URL=https://your-backend-url.com/api
```

---

## 📦 Build Commands

### Backend

```bash
cd src/EvCharging.Api
dotnet publish -c Release -o ./publish
```

### Frontend

```bash
cd src/EvCharging.Web
npm install
npm run build
```

---

## ✅ Deployment Checklist

- [ ] Supabase tables created
- [ ] Test users created (via register endpoint)
- [ ] Sample stations inserted
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Environment variables set
- [ ] CORS configured
- [ ] Test login works
- [ ] Test all features

---

## 🐛 Troubleshooting

### Backend can't connect to Supabase

**Check:**
- Connection string is correct
- Supabase project is active
- IP whitelist (if enabled) includes your server IP

### Frontend can't reach backend

**Check:**
- `VITE_API_BASE_URL` is correct
- CORS is configured with frontend URL
- Backend is running and accessible

### Login not working

**Check:**
- JWT secret is set
- Users exist in database
- Password hashing is correct

---

## 📞 Quick Deploy (Recommended)

**For fastest deployment:**

1. **Use Railway.app for backend:**
   - Connect GitHub repo
   - Set environment variables
   - Deploy automatically

2. **Use Vercel for frontend:**
   - Connect GitHub repo
   - Set `VITE_API_BASE_URL`
   - Deploy automatically

3. **Supabase is already set up!**
   - Just run the SQL scripts above

---

**Your app is ready to deploy!** 🚀

**Current local setup works with in-memory database for testing.**
**When deployed to a server, it will automatically connect to Supabase!**
