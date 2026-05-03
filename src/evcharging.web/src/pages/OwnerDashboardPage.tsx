import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { stationApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { Station } from '../types/models'
import './OwnerDashboard.css'

export function OwnerDashboardPage() {
  const { user } = useAuth()
  const [stations, setStations] = useState<Station[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stationsData, bookingsData] = await Promise.all([
          stationApi.myStations(),
          stationApi.myStationsBookings()
        ])
        setStations(stationsData)
        setBookings(bookingsData)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [])

  const approvedStations = stations.filter(s => s.isApproved)
  const pendingStations = stations.filter(s => !s.isApproved)
  const totalSlots = stations.reduce((sum, s) => sum + s.totalSlots, 0)
  const availableSlots = stations.reduce((sum, s) => sum + s.availableSlots, 0)
  const todayBookings = bookings.filter(b => {
    const today = new Date().toISOString().split('T')[0]
    return b.bookingDate === today
  })

  return (
    <div className="owner-dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.fullName}!</h1>
          <p className="subtitle">{user?.businessName || 'Station Owner Dashboard'}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card modern-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <div className="stat-value">{stations.length}</div>
            <div className="stat-label">Total Stations</div>
            <div className="stat-detail">
              {approvedStations.length} approved, {pendingStations.length} pending
            </div>
          </div>
        </div>

        <div className="stat-card modern-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{bookings.length}</div>
            <div className="stat-label">Total Bookings</div>
            <div className="stat-detail">
              {todayBookings.length} today
            </div>
          </div>
        </div>

        <div className="stat-card modern-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-value">{totalSlots}</div>
            <div className="stat-label">Total Slots</div>
            <div className="stat-detail">
              {availableSlots} available
            </div>
          </div>
        </div>

        <div className="stat-card modern-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-value">
              {stations.length > 0 
                ? (stations.reduce((sum, s) => sum + (s.averageRating || 0), 0) / stations.length).toFixed(1)
                : '0.0'}
            </div>
            <div className="stat-label">Avg Rating</div>
            <div className="stat-detail">
              {stations.reduce((sum, s) => sum + s.reviewCount, 0)} reviews
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/owner/stations" className="action-btn btn btn-primary">
            <span className="action-icon">🏢</span>
            <span>Manage Stations</span>
          </Link>
          <Link to="/owner/bookings" className="action-btn btn btn-secondary">
            <span className="action-icon">📅</span>
            <span>View Bookings</span>
          </Link>
          <Link to="/owner/stations" className="action-btn btn btn-outline">
            <span className="action-icon">➕</span>
            <span>Add New Station</span>
          </Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="recent-section modern-card">
        <div className="section-header">
          <h2>Recent Bookings</h2>
          <Link to="/owner/bookings" className="view-all-link">View All →</Link>
        </div>
        {loading && <p>Loading...</p>}
        {!loading && bookings.length === 0 && (
          <div className="empty-state">
            <p>No bookings yet. Your stations will appear here once customers start booking.</p>
          </div>
        )}
        {!loading && bookings.length > 0 && (
          <div className="table-wrap">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Station</th>
                  <th>Customer</th>
                  <th>Date & Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((booking) => (
                  <tr key={booking.id}>
                    <td><strong>{booking.stationName}</strong></td>
                    <td>
                      {booking.userName}
                      <br />
                      <small style={{ color: '#6b7280' }}>{booking.userEmail}</small>
                    </td>
                    <td>
                      {booking.bookingDate}
                      <br />
                      <small style={{ color: '#6b7280' }}>{booking.startTime}</small>
                    </td>
                    <td>{booking.durationMinutes} min</td>
                    <td>
                      <span className={`badge badge-${booking.status === 'confirmed' ? 'success' : 'warning'}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Approvals Alert */}
      {pendingStations.length > 0 && (
        <div className="alert alert-warning">
          <strong>⏳ Pending Approval:</strong> You have {pendingStations.length} station(s) waiting for admin approval.
        </div>
      )}
    </div>
  )
}
