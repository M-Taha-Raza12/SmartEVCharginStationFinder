# ⚡ Smart EV Charging Station Finder

A full-stack web application for finding, booking, and managing EV charging stations with AI-powered recommendations.

[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)

## 🌟 Features

### For Clients
- 🗺️ **Interactive Map** - Find charging stations on OpenStreetMap with real-time availability
- 📅 **Smart Booking** - Reserve charging slots with flexible time slots
- 🧠 **AI Recommendations** - Get optimal station suggestions based on location and budget
- ⭐ **Favorites** - Save your favorite charging stations for quick access
- 💰 **Wallet System** - Manage payments and top-ups seamlessly
- 📊 **Charging History** - Track your charging sessions and analytics
- 🔔 **Notifications** - Get updates on bookings and station availability
- ⭐ **Reviews** - Rate and review charging stations

### For Station Owners
- ⚙️ **Station Management** - Add and manage your charging stations
- 📊 **Booking Overview** - View all bookings for your stations
- 💼 **Business Dashboard** - Track your station performance and revenue

### For Administrators
- 👥 **User Management** - Manage all users and their permissions
- 🏢 **Station Approval** - Approve or reject new station submissions
- 📊 **System Analytics** - View system-wide statistics and insights
- 🔍 **Review Moderation** - Manage user reviews and ratings

## 🛠️ Technology Stack

**Backend:**
- ASP.NET Core 10.0
- Entity Framework Core
- PostgreSQL (Supabase)
- JWT Authentication
- Groq AI Integration

**Frontend:**
- React 19
- TypeScript
- Vite
- React Router
- Leaflet (OpenStreetMap)
- Axios

**Database:**
- Supabase (PostgreSQL)
- In-memory database for local development

## 📋 Prerequisites

- [.NET 10.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [Supabase Account](https://supabase.com/) (for production)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/M-Taha-Raza12/SmartEVCharginStationFinder.git
cd SmartEVCharginStationFinder
```

### 2. Start Backend

```bash
cd src/EvCharging.Api
dotnet run
```

Backend will be available at: http://localhost:5183

### 3. Start Frontend

```bash
cd src/EvCharging.Web
npm install
npm run dev
```

Frontend will be available at: http://localhost:5173

### 4. Login

Use these test accounts:

| Role | Email | Password |
|------|-------|----------|
| Client | `client@test.com` | `Client@123` |
| Owner | `owner@test.com` | `Owner@123` |
| SuperAdmin | `admin123@gmail.com` | `Admin@123` |

## 📁 Project Structure

```
SmartEVCharginStationFinder/
├── src/
│   ├── EvCharging.Api/              # ASP.NET Core Backend
│   │   ├── Controllers/             # API endpoints
│   │   ├── Models/                  # Database models
│   │   ├── Services/                # Business logic (JWT, AI)
│   │   ├── Data/                    # DbContext & Seeder
│   │   └── Dtos/                    # Data transfer objects
│   └── EvCharging.Web/              # React Frontend
│       ├── src/
│       │   ├── components/          # Reusable components
│       │   ├── pages/               # Page components
│       │   ├── services/            # API client
│       │   ├── context/             # React context (Auth)
│       │   └── types/               # TypeScript types
│       └── public/                  # Static assets
├── scripts/                         # Database & deployment scripts
├── supabase-setup.sql              # Database schema
├── DEPLOYMENT_GUIDE.md             # Detailed deployment guide
└── README.md                        # This file
```

## 🗄️ Database Setup

### Local Development

The app uses an in-memory database by default for local development. No setup required!

### Production (Supabase)

1. Create a Supabase project
2. Run the SQL script:

```bash
# Copy contents of supabase-setup.sql
# Paste in Supabase SQL Editor
# Click "Run"
```

3. Update connection string in `appsettings.json`

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

## 🌐 Deployment

### Quick Deploy

**Backend:** Deploy to [Railway](https://railway.app), [Render](https://render.com), or [Azure](https://azure.microsoft.com)

**Frontend:** Deploy to [Vercel](https://vercel.com), [Netlify](https://netlify.com), or [Azure Static Web Apps](https://azure.microsoft.com/services/app-service/static/)

### Environment Variables

**Backend:**
```env
ConnectionStrings__DefaultConnection=<your-supabase-connection-string>
Jwt__Secret=<your-jwt-secret>
Groq__ApiKey=<your-groq-api-key>
```

**Frontend:**
```env
VITE_API_BASE_URL=<your-backend-url>/api
```

See `DEPLOY_NOW.md` for step-by-step deployment instructions.

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Stations
- `GET /api/stations` - List all stations (with filters)
- `POST /api/stations` - Create station (Owner)
- `PUT /api/stations/{id}` - Update station (Owner)
- `DELETE /api/stations/{id}` - Delete station (Owner)

### Bookings
- `GET /api/bookings/user` - Get user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Cancel booking

### Reviews
- `GET /api/reviews/station/{id}` - Get station reviews
- `POST /api/reviews` - Create review
- `DELETE /api/reviews/{id}` - Delete review

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - List all users
- `PUT /api/admin/stations/{id}/approve` - Approve station

See full API documentation in `DEPLOYMENT_GUIDE.md`.

## 🧪 Testing

### Run Backend Tests
```bash
cd src/EvCharging.Api
dotnet test
```

### Run Frontend Tests
```bash
cd src/EvCharging.Web
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **M Taha Raza** - [GitHub](https://github.com/M-Taha-Raza12)

## 🙏 Acknowledgments

- OpenStreetMap for map tiles
- Groq AI for recommendation engine
- Supabase for database hosting
- React and .NET communities

## 📞 Support

For support, email your-email@example.com or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Payment gateway integration
- [ ] Real-time charging status
- [ ] Route planning with charging stops
- [ ] Multi-language support
- [ ] Dark mode

## 📊 Screenshots

### Client Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Station Map
![Map](docs/screenshots/map.png)

### Booking System
![Booking](docs/screenshots/booking.png)

---

**Built with ❤️ using ASP.NET Core, React, and AI**

⚡ **Happy Charging!** ⚡
