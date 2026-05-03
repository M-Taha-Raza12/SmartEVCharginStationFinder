import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { stationApi } from '../services/api'
import './Profile.css'

export function ProfilePage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      if (user?.role === 'Owner') {
        try {
          const [stations, bookings] = await Promise.all([
            stationApi.myStations(),
            stationApi.myStationsBookings()
          ])
          setStats({
            totalStations: stations.length,
            approvedStations: stations.filter(s => s.isApproved).length,
            totalBookings: bookings.length,
            totalSlots: stations.reduce((sum, s) => sum + s.totalSlots, 0),
            averageRating: stations.length > 0 
              ? (stations.reduce((sum, s) => sum + (s.averageRating || 0), 0) / stations.length).toFixed(1)
              : '0.0'
          })
        } catch (error) {
          console.error('Failed to load stats:', error)
        }
      }
      setLoading(false)
    }
    void loadStats()
  }, [user])

  if (!user) {
    return null
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.fullName.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h1>{user.fullName}</h1>
          <p className="profile-email">{user.email}</p>
          <span className={`role-badge role-${user.role.toLowerCase()}`}>
            {user.role === 'SuperAdmin' ? '👑 Super Admin' : 
             user.role === 'Owner' ? '🏢 Station Owner' : 
             '👤 Client'}
          </span>
        </div>
      </div>

      <div className="profile-content">
        {/* Account Information */}
        <div className="profile-card modern-card">
          <h2>Account Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Full Name</span>
              <span className="info-value">{user.fullName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email Address</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Account Type</span>
              <span className="info-value">{user.role}</span>
            </div>
            {user.businessName && (
              <div className="info-item">
                <span className="info-label">Business Name</span>
                <span className="info-value">{user.businessName}</span>
              </div>
            )}
            <div className="info-item">
              <span className="info-label">Account Status</span>
              <span className="info-value">
                <span className="status-badge status-active">✓ Active</span>
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Member Since</span>
              <span className="info-value">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Owner Stats */}
        {user.role === 'Owner' && !loading && stats && (
          <div className="profile-card modern-card">
            <h2>Business Statistics</h2>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-icon">🏢</div>
                <div className="stat-details">
                  <div className="stat-value">{stats.totalStations}</div>
                  <div className="stat-label">Total Stations</div>
                  <div className="stat-sublabel">{stats.approvedStations} approved</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-icon">📅</div>
                <div className="stat-details">
                  <div className="stat-value">{stats.totalBookings}</div>
                  <div className="stat-label">Total Bookings</div>
                  <div className="stat-sublabel">All time</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-icon">⚡</div>
                <div className="stat-details">
                  <div className="stat-value">{stats.totalSlots}</div>
                  <div className="stat-label">Total Slots</div>
                  <div className="stat-sublabel">Across all stations</div>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-icon">⭐</div>
                <div className="stat-details">
                  <div className="stat-value">{stats.averageRating}</div>
                  <div className="stat-label">Average Rating</div>
                  <div className="stat-sublabel">Customer satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Info */}
        {user.role === 'SuperAdmin' && (
          <div className="profile-card modern-card">
            <h2>Administrator Access</h2>
            <div className="admin-info">
              <p>You have full administrative access to the ChargePilot platform.</p>
              <ul>
                <li>✓ Manage all users and stations</li>
                <li>✓ Approve or reject station registrations</li>
                <li>✓ View system-wide analytics</li>
                <li>✓ Moderate reviews and bookings</li>
              </ul>
            </div>
          </div>
        )}

        {/* Client Info */}
        {user.role === 'Client' && (
          <div className="profile-card modern-card">
            <h2>Your Activity</h2>
            <div className="client-info">
              <p>Welcome to ChargePilot! As a client, you can:</p>
              <ul>
                <li>🔍 Search and discover charging stations</li>
                <li>📅 Book charging slots at your convenience</li>
                <li>⭐ Rate and review stations</li>
                <li>🗺️ View stations on an interactive map</li>
              </ul>
            </div>
          </div>
        )}

        {/* Security Tips */}
        <div className="profile-card modern-card">
          <h2>Security & Privacy</h2>
          <div className="security-tips">
            <div className="tip-item">
              <span className="tip-icon">🔒</span>
              <div className="tip-content">
                <strong>Strong Password</strong>
                <p>Use a unique, strong password for your account</p>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🚪</span>
              <div className="tip-content">
                <strong>Logout on Shared Devices</strong>
                <p>Always log out when using public or shared computers</p>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🔐</span>
              <div className="tip-content">
                <strong>Protect Your Data</strong>
                <p>Never share your login credentials with anyone</p>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">📧</span>
              <div className="tip-content">
                <strong>Email Verification</strong>
                <p>Keep your email address up to date for important notifications</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
