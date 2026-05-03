import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { bookingApi, stationApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './ClientDashboard.css'

export function ClientDashboardPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<any[]>([])
  const [stations, setStations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only load data if user is authenticated
    if (!user) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      try {
        const [bookingsData, stationsData] = await Promise.all([
          bookingApi.myBookings(),
          stationApi.list()
        ])
        setBookings(bookingsData)
        setStations(stationsData)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [user])

  const upcomingBookings = bookings.filter(b => {
    const bookingDateTime = new Date(`${b.bookingDate}T${b.startTime}`)
    return bookingDateTime > new Date() && b.status === 'confirmed'
  })

  const completedBookings = bookings.filter(b => b.status === 'completed')
  const totalSpent = bookings.reduce((sum, b) => {
    const station = stations.find(s => s.id === b.stationId)
    if (station && b.status === 'completed') {
      // Estimate: durationMinutes / 60 * pricePerKwh * average kW (assume 50kW)
      return sum + ((b.durationMinutes / 60) * station.pricePerKwh * 50)
    }
    return sum
  }, 0)

  const favoriteStations = stations
    .filter(s => s.averageRating && s.averageRating >= 4.5)
    .slice(0, 3)

  return (
    <div className="client-dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.fullName}!</h1>
          <p className="subtitle">Your EV Charging Dashboard</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card modern-card stat-primary">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{bookings.length}</div>
            <div className="stat-label">Total Bookings</div>
            <div className="stat-detail">
              {upcomingBookings.length} upcoming
            </div>
          </div>
        </div>

        <div className="stat-card modern-card stat-success">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-value">{completedBookings.length}</div>
            <div className="stat-label">Completed Sessions</div>
            <div className="stat-detail">
              All time
            </div>
          </div>
        </div>

        <div className="stat-card modern-card stat-info">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">${totalSpent.toFixed(2)}</div>
            <div className="stat-label">Total Spent</div>
            <div className="stat-detail">
              Estimated
            </div>
          </div>
        </div>

        <div className="stat-card modern-card stat-warning">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-value">{stations.length}</div>
            <div className="stat-label">Available Stations</div>
            <div className="stat-detail">
              In network
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/stations" className="action-btn btn btn-primary">
            <span className="action-icon">🔍</span>
            <span>Find Stations</span>
          </Link>
          <Link to="/bookings" className="action-btn btn btn-secondary">
            <span className="action-icon">📅</span>
            <span>My Bookings</span>
          </Link>
          <Link to="/stations?nearby=true" className="action-btn btn btn-outline">
            <span className="action-icon">📍</span>
            <span>Nearby Stations</span>
          </Link>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="section-card modern-card">
        <div className="section-header">
          <h2>Upcoming Bookings</h2>
          <Link to="/bookings" className="view-all-link">View All →</Link>
        </div>
        {loading && <p>Loading...</p>}
        {!loading && upcomingBookings.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p>No upcoming bookings</p>
            <Link to="/stations" className="btn btn-primary">Book a Station</Link>
          </div>
        )}
        {!loading && upcomingBookings.length > 0 && (
          <div className="bookings-list">
            {upcomingBookings.slice(0, 3).map((booking) => (
              <div key={booking.id} className="booking-item">
                <div className="booking-icon">⚡</div>
                <div className="booking-details">
                  <h3>{booking.stationName}</h3>
                  <p className="booking-time">
                    {new Date(booking.bookingDate).toLocaleDateString()} at {booking.startTime}
                  </p>
                  <p className="booking-duration">{booking.durationMinutes} minutes</p>
                </div>
                <span className="badge badge-success">{booking.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Rated Stations */}
      <div className="section-card modern-card">
        <div className="section-header">
          <h2>Top Rated Stations</h2>
          <Link to="/stations" className="view-all-link">View All →</Link>
        </div>
        {loading && <p>Loading...</p>}
        {!loading && favoriteStations.length === 0 && (
          <div className="empty-state">
            <p>No stations available yet</p>
          </div>
        )}
        {!loading && favoriteStations.length > 0 && (
          <div className="stations-grid">
            {favoriteStations.map((station) => (
              <div key={station.id} className="station-card">
                <div className="station-header">
                  <h3>{station.name}</h3>
                  <div className="station-rating">
                    ⭐ {station.averageRating?.toFixed(1)}
                  </div>
                </div>
                <p className="station-address">{station.address || 'Address not available'}</p>
                <div className="station-info">
                  <span className="info-item">💰 ${station.pricePerKwh}/kWh</span>
                  <span className="info-item">⚡ {station.availableSlots}/{station.totalSlots} slots</span>
                </div>
                <Link to="/stations" className="btn btn-sm btn-outline">View on Map</Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {completedBookings.length > 0 && (
        <div className="section-card modern-card">
          <div className="section-header">
            <h2>Recent Activity</h2>
          </div>
          <div className="activity-list">
            {completedBookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="activity-item">
                <div className="activity-icon">✓</div>
                <div className="activity-details">
                  <p className="activity-text">
                    Charged at <strong>{booking.stationName}</strong>
                  </p>
                  <p className="activity-date">
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
