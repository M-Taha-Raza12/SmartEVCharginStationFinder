import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { stationApi } from '../services/api'
import './OwnerBookings.css'

type BookingWithDetails = {
  id: string
  stationId: string
  stationName: string
  userId: string
  userName: string
  userEmail: string
  bookingDate: string
  startTime: string
  durationMinutes: number
  status: string
  createdAt: string
}

export function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [stations, setStations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [selectedStation, setSelectedStation] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [bookingsData, stationsData] = await Promise.all([
        stationApi.myStationsBookings(),
        stationApi.myStations()
      ])
      setBookings(bookingsData)
      setStations(stationsData)
    } catch (error) {
      console.error('Failed to load bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const applyFilters = (event: FormEvent) => {
    event.preventDefault()
    // Filters are applied in the filteredBookings computed value
  }

  const clearFilters = () => {
    setSelectedStation('all')
    setSelectedStatus('all')
    setFromDate('')
    setToDate('')
  }

  // Apply filters
  const filteredBookings = bookings.filter((booking) => {
    // Filter by station
    if (selectedStation !== 'all' && booking.stationId !== selectedStation) {
      return false
    }

    // Filter by status
    if (selectedStatus !== 'all' && booking.status !== selectedStatus) {
      return false
    }

    // Filter by date range
    if (fromDate && booking.bookingDate < fromDate) {
      return false
    }
    if (toDate && booking.bookingDate > toDate) {
      return false
    }

    return true
  })

  // Group bookings by status
  const confirmedBookings = filteredBookings.filter(b => b.status === 'confirmed')
  const completedBookings = filteredBookings.filter(b => b.status === 'completed')
  const cancelledBookings = filteredBookings.filter(b => b.status === 'cancelled')

  return (
    <div className="owner-bookings-page">
      <div className="page-header">
        <div>
          <h1>Station Bookings</h1>
          <p className="subtitle">View and manage bookings for your charging stations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card modern-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{filteredBookings.length}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
        </div>
        <div className="stat-card modern-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{confirmedBookings.length}</div>
            <div className="stat-label">Confirmed</div>
          </div>
        </div>
        <div className="stat-card modern-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-value">{completedBookings.length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card modern-card">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <div className="stat-value">{cancelledBookings.length}</div>
            <div className="stat-label">Cancelled</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-card modern-card">
        <h2>Filter Bookings</h2>
        <form className="filters-form" onSubmit={applyFilters}>
          <div className="filters-grid">
            <div className="form-group">
              <label className="input-label">Station</label>
              <select 
                className="input-field"
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
              >
                <option value="all">All Stations</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">Status</label>
              <select 
                className="input-field"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">From Date</label>
              <input 
                type="date"
                className="input-field"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="input-label">To Date</label>
              <input 
                type="date"
                className="input-field"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-actions">
            <button type="button" onClick={clearFilters} className="btn btn-ghost">
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      {/* Bookings Table */}
      <div className="bookings-table-card modern-card">
        <h2>Bookings ({filteredBookings.length})</h2>
        {loading && <p>Loading bookings...</p>}
        {!loading && filteredBookings.length === 0 && (
          <div className="empty-state">
            <p>No bookings found. {bookings.length > 0 ? 'Try adjusting your filters.' : 'Bookings will appear here once customers book your stations.'}</p>
          </div>
        )}
        {!loading && filteredBookings.length > 0 && (
          <div className="table-responsive">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Station</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Booked On</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <strong>{booking.stationName}</strong>
                    </td>
                    <td>
                      <div className="customer-info">
                        <strong>{booking.userName}</strong>
                        <br />
                        <small>{booking.userEmail}</small>
                      </div>
                    </td>
                    <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                    <td>{booking.startTime}</td>
                    <td>{booking.durationMinutes} min</td>
                    <td>
                      <span className={`badge badge-${
                        booking.status === 'confirmed' ? 'success' :
                        booking.status === 'completed' ? 'info' :
                        'danger'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <small>{new Date(booking.createdAt).toLocaleDateString()}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
