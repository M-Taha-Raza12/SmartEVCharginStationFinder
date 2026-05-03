import { useEffect, useState } from 'react'
import { adminApi, stationApi } from '../services/api'
import type { DashboardStats, AdminUser, Station } from '../types/models'

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [pendingStations, setPendingStations] = useState<Station[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'stations' | 'bookings' | 'reviews'>('overview')
  const [userFilter, setUserFilter] = useState<string>('')
  const [bookings, setBookings] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])

  const loadDashboard = async () => {
    try {
      const data = await adminApi.getDashboard()
      setStats(data)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    }
  }

  const loadUsers = async (role?: string) => {
    try {
      const data = await adminApi.getUsers(role)
      setUsers(data)
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const loadPendingStations = async () => {
    try {
      const data = await adminApi.getPendingStations()
      setPendingStations(data)
    } catch (error) {
      console.error('Failed to load pending stations:', error)
    }
  }

  const loadBookings = async () => {
    try {
      const data = await adminApi.getAllBookings()
      setBookings(data)
    } catch (error) {
      console.error('Failed to load bookings:', error)
    }
  }

  const loadReviews = async () => {
    try {
      const data = await adminApi.getAllReviews()
      setReviews(data)
    } catch (error) {
      console.error('Failed to load reviews:', error)
    }
  }

  useEffect(() => {
    void loadDashboard()
    void loadUsers()
    void loadPendingStations()
  }, [])

  useEffect(() => {
    if (activeTab === 'bookings') {
      void loadBookings()
    } else if (activeTab === 'reviews') {
      void loadReviews()
    }
  }, [activeTab])

  const toggleUserActive = async (id: string) => {
    try {
      await adminApi.toggleUserActive(id)
      await loadUsers(userFilter || undefined)
      await loadDashboard()
      alert('User status updated!')
    } catch (error) {
      alert('Failed to update user status.')
    }
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      await adminApi.deleteUser(id)
      await loadUsers(userFilter || undefined)
      await loadDashboard()
      alert('User deleted successfully!')
    } catch (error) {
      alert('Failed to delete user.')
    }
  }

  const approveStation = async (id: string) => {
    try {
      await adminApi.approveStation(id)
      await loadPendingStations()
      await loadDashboard()
      alert('Station approved!')
    } catch (error) {
      alert('Failed to approve station.')
    }
  }

  const rejectStation = async (id: string) => {
    if (!confirm('Are you sure you want to reject and remove this station?')) return

    try {
      await adminApi.rejectStation(id)
      await loadPendingStations()
      await loadDashboard()
      alert('Station rejected and removed.')
    } catch (error) {
      alert('Failed to reject station.')
    }
  }

  const deleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      await adminApi.deleteReview(id)
      await loadReviews()
      alert('Review deleted!')
    } catch (error) {
      alert('Failed to delete review.')
    }
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>🛡️ Super Admin Dashboard</h1>
        <div className="tab-buttons">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            Overview
          </button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            Users
          </button>
          <button className={activeTab === 'stations' ? 'active' : ''} onClick={() => setActiveTab('stations')}>
            Stations {pendingStations.length > 0 && <span className="badge">{pendingStations.length}</span>}
          </button>
          <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>
            Bookings
          </button>
          <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>
            Reviews
          </button>
        </div>
      </div>

      {activeTab === 'overview' && stats && (
        <section className="stats-grid">
          <div className="stat-card glass">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers}</p>
            <small>{stats.activeUsers} active</small>
          </div>
          <div className="stat-card glass">
            <h3>Clients</h3>
            <p className="stat-number">{stats.totalClients}</p>
          </div>
          <div className="stat-card glass">
            <h3>Station Owners</h3>
            <p className="stat-number">{stats.totalOwners}</p>
          </div>
          <div className="stat-card glass">
            <h3>Total Stations</h3>
            <p className="stat-number">{stats.totalStations}</p>
          </div>
          <div className="stat-card glass">
            <h3>Pending Approval</h3>
            <p className="stat-number">{stats.pendingStations}</p>
          </div>
          <div className="stat-card glass">
            <h3>Total Bookings</h3>
            <p className="stat-number">{stats.totalBookings}</p>
          </div>
        </section>
      )}

      {activeTab === 'users' && (
        <section className="glass panel">
          <div className="panel-header">
            <h2>User Management</h2>
            <select value={userFilter} onChange={(e) => { setUserFilter(e.target.value); void loadUsers(e.target.value || undefined) }}>
              <option value="">All Users</option>
              <option value="Client">Clients</option>
              <option value="Owner">Owners</option>
              <option value="SuperAdmin">Super Admins</option>
            </select>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Business</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td><span className="role-badge">{user.role}</span></td>
                    <td>{user.businessName || '-'}</td>
                    <td>
                      <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      {user.role !== 'SuperAdmin' && (
                        <>
                          <button type="button" onClick={() => void toggleUserActive(user.id)}>
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button type="button" onClick={() => void deleteUser(user.id)} className="danger">
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'stations' && (
        <section className="glass panel">
          <h2>Pending Station Approvals</h2>
          {pendingStations.length === 0 && <p>No pending stations.</p>}
          {pendingStations.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Price</th>
                    <th>Slots</th>
                    <th>Working Hours</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingStations.map((station) => (
                    <tr key={station.id}>
                      <td>{station.name}</td>
                      <td>{station.address || 'N/A'}</td>
                      <td>Rs {station.pricePerKwh}/kWh</td>
                      <td>{station.totalSlots}</td>
                      <td>
                        {station.workingHoursStart && station.workingHoursEnd
                          ? `${station.workingHoursStart} - ${station.workingHoursEnd}`
                          : 'Not set'}
                      </td>
                      <td>
                        <button type="button" onClick={() => void approveStation(station.id)} className="success">
                          ✓ Approve
                        </button>
                        <button type="button" onClick={() => void rejectStation(station.id)} className="danger">
                          ✗ Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === 'bookings' && (
        <section className="glass panel">
          <h2>All Bookings</h2>
          {bookings.length === 0 && <p>No bookings yet.</p>}
          {bookings.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Station</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        {booking.user.fullName}
                        <br />
                        <small>{booking.user.email}</small>
                      </td>
                      <td>{booking.station.name}</td>
                      <td>{booking.bookingDate}</td>
                      <td>{booking.startTime}</td>
                      <td>{booking.durationMinutes} min</td>
                      <td>
                        <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === 'reviews' && (
        <section className="glass panel">
          <h2>All Reviews</h2>
          {reviews.length === 0 && <p>No reviews yet.</p>}
          {reviews.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Station</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id}>
                      <td>{review.user.fullName}</td>
                      <td>{review.station.name}</td>
                      <td>{'⭐'.repeat(review.rating)}</td>
                      <td>{review.comment || '-'}</td>
                      <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button type="button" onClick={() => void deleteReview(review.id)} className="danger">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
