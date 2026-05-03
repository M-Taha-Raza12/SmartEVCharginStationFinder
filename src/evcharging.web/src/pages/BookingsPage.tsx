import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingApi, reviewApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { Booking } from '../types/models'
import './Bookings.css'

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editDuration, setEditDuration] = useState(60)
  const [showEditModal, setShowEditModal] = useState(false)
  
  // Review state
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set())
  
  const { user } = useAuth()
  const navigate = useNavigate()

  const loadBookings = async () => {
    setLoading(true)
    setError('')
    try {
      console.log('Loading bookings for user:', user?.email)
      const data = await bookingApi.myBookings()
      console.log('Bookings loaded:', data)
      setBookings(data)
    } catch (err: any) {
      console.error('Error loading bookings:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load bookings'
      setError(errorMessage)
      
      if (err.response?.status === 401) {
        console.log('401 error - token may be invalid')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    void loadBookings()
  }, [user, navigate])

  const openEditModal = (booking: Booking) => {
    setEditingBooking(booking)
    setEditDate(booking.bookingDate)
    setEditTime(booking.startTime)
    setEditDuration(booking.durationMinutes)
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setEditingBooking(null)
    setShowEditModal(false)
  }

  const updateBooking = async (event: FormEvent) => {
    event.preventDefault()
    if (!editingBooking) return

    try {
      await bookingApi.update(editingBooking.id, {
        bookingDate: editDate,
        startTime: editTime,
        durationMinutes: editDuration
      })
      await loadBookings()
      closeEditModal()
      alert('Booking updated successfully!')
    } catch (err: any) {
      console.error('Error updating booking:', err)
      alert('Failed to update booking. Please try again.')
    }
  }

  const cancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    try {
      await bookingApi.cancel(id)
      await loadBookings()
      alert('Booking cancelled successfully')
    } catch (err: any) {
      console.error('Error canceling booking:', err)
      alert('Failed to cancel booking. Please try again.')
    }
  }

  const openReviewModal = (booking: Booking) => {
    setReviewingBooking(booking)
    setReviewRating(5)
    setReviewComment('')
    setShowReviewModal(true)
  }

  const closeReviewModal = () => {
    setReviewingBooking(null)
    setShowReviewModal(false)
  }

  const submitReview = async (event: FormEvent) => {
    event.preventDefault()
    if (!reviewingBooking) return

    try {
      console.log('[REVIEW] Submitting review for booking:', reviewingBooking)
      console.log('[REVIEW] Station ID:', reviewingBooking.stationId)
      console.log('[REVIEW] Booking ID:', reviewingBooking.id)
      console.log('[REVIEW] Rating:', reviewRating)
      console.log('[REVIEW] Comment:', reviewComment)
      
      const reviewData: any = {
        stationId: reviewingBooking.stationId,
        rating: reviewRating
      }
      
      // Only add bookingId if it exists
      if (reviewingBooking.id) {
        reviewData.bookingId = reviewingBooking.id
      }
      
      // Only add comment if it's not empty
      if (reviewComment.trim()) {
        reviewData.comment = reviewComment.trim()
      }
      
      console.log('[REVIEW] Sending review data:', reviewData)
      
      const result = await reviewApi.create(reviewData)
      console.log('[REVIEW] Review created successfully:', result)
      
      // Mark this booking as reviewed
      setReviewedBookings(prev => new Set(prev).add(reviewingBooking.id))
      
      closeReviewModal()
      alert('Review submitted successfully! Thank you for your feedback.')
    } catch (err: any) {
      console.error('[REVIEW] Error submitting review:', err)
      console.error('[REVIEW] Error response:', err.response)
      console.error('[REVIEW] Error response data:', err.response?.data)
      console.error('[REVIEW] Error response status:', err.response?.status)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit review. Please try again.'
      alert(errorMessage)
    }
  }

  const upcomingBookings = bookings.filter(b => {
    const bookingDateTime = new Date(`${b.bookingDate}T${b.startTime}`)
    return bookingDateTime > new Date() && b.status === 'confirmed'
  })

  const pastBookings = bookings.filter(b => {
    const bookingDateTime = new Date(`${b.bookingDate}T${b.startTime}`)
    return bookingDateTime <= new Date() || b.status !== 'confirmed'
  })

  return (
    <div className="bookings-page">
      <div className="page-header">
        <div>
          <h1>My Bookings</h1>
          <p className="subtitle">Manage your charging station reservations</p>
        </div>
      </div>

      {loading && <p>Loading bookings...</p>}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="empty-state-card modern-card">
          <div className="empty-icon">📅</div>
          <h2>No Bookings Yet</h2>
          <p>You haven't made any bookings yet. Start by finding a charging station near you!</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/stations')}
          >
            Find Stations
          </button>
        </div>
      )}

      {!loading && !error && upcomingBookings.length > 0 && (
        <div className="bookings-section modern-card">
          <h2>Upcoming Bookings ({upcomingBookings.length})</h2>
          <div className="bookings-grid">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="booking-card booking-upcoming">
                <div className="booking-header">
                  <div className="booking-icon">⚡</div>
                  <span className="badge badge-success">{booking.status}</span>
                </div>
                <h3>{booking.stationName}</h3>
                <div className="booking-details">
                  <div className="detail-row">
                    <span className="detail-label">📅 Date:</span>
                    <span className="detail-value">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">🕐 Time:</span>
                    <span className="detail-value">{booking.startTime}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">⏱️ Duration:</span>
                    <span className="detail-value">{booking.durationMinutes} minutes</span>
                  </div>
                </div>
                <div className="booking-actions">
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => openEditModal(booking)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => void cancelBooking(booking.id)}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && pastBookings.length > 0 && (
        <div className="bookings-section modern-card">
          <h2>Past Bookings ({pastBookings.length})</h2>
          <div className="table-responsive">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Station</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pastBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td><strong>{booking.stationName}</strong></td>
                    <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                    <td>{booking.startTime}</td>
                    <td>{booking.durationMinutes} min</td>
                    <td>
                      <span className={`badge badge-${
                        booking.status === 'completed' ? 'info' :
                        booking.status === 'cancelled' ? 'danger' :
                        'warning'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      {booking.status === 'confirmed' && !reviewedBookings.has(booking.id) && (
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => openReviewModal(booking)}
                        >
                          ⭐ Leave Review
                        </button>
                      )}
                      {reviewedBookings.has(booking.id) && (
                        <span className="text-success">✓ Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingBooking && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Booking</h2>
              <button className="close-btn" onClick={closeEditModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="station-info-box">
                <strong>{editingBooking.stationName}</strong>
              </div>
              <form className="edit-form" onSubmit={updateBooking}>
                <div className="form-group">
                  <label className="input-label">Date</label>
                  <input 
                    className="input-field"
                    type="date" 
                    value={editDate} 
                    onChange={(e) => setEditDate(e.target.value)} 
                    required 
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">Start Time</label>
                  <input 
                    className="input-field"
                    type="time" 
                    value={editTime} 
                    onChange={(e) => setEditTime(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">Duration (minutes)</label>
                  <input 
                    className="input-field"
                    type="number" 
                    value={editDuration} 
                    onChange={(e) => setEditDuration(Number(e.target.value))} 
                    min={15}
                    step={15}
                    required 
                  />
                  <small className="form-hint">Minimum 15 minutes, increments of 15</small>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary btn-block">
                    Save Changes
                  </button>
                  <button type="button" onClick={closeEditModal} className="btn btn-ghost btn-block">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewingBooking && (
        <div className="modal-overlay" onClick={closeReviewModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⭐ Leave a Review</h2>
              <button className="close-btn" onClick={closeReviewModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="station-info-box">
                <strong>{reviewingBooking.stationName}</strong>
                <p className="text-muted">
                  {new Date(reviewingBooking.bookingDate).toLocaleDateString()} at {reviewingBooking.startTime}
                </p>
              </div>
              <form className="review-form" onSubmit={submitReview}>
                <div className="form-group">
                  <label className="input-label">Rating</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${star <= reviewRating ? 'active' : ''}`}
                        onClick={() => setReviewRating(star)}
                      >
                        {star <= reviewRating ? '⭐' : '☆'}
                      </button>
                    ))}
                  </div>
                  <small className="form-hint">
                    {reviewRating === 1 && 'Poor'}
                    {reviewRating === 2 && 'Fair'}
                    {reviewRating === 3 && 'Good'}
                    {reviewRating === 4 && 'Very Good'}
                    {reviewRating === 5 && 'Excellent'}
                  </small>
                </div>

                <div className="form-group">
                  <label className="input-label">Comment (Optional)</label>
                  <textarea 
                    className="input-field"
                    value={reviewComment} 
                    onChange={(e) => setReviewComment(e.target.value)} 
                    rows={4}
                    placeholder="Share your experience with this charging station..."
                    maxLength={500}
                  />
                  <small className="form-hint">{reviewComment.length}/500 characters</small>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary btn-block">
                    Submit Review
                  </button>
                  <button type="button" onClick={closeReviewModal} className="btn btn-ghost btn-block">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
