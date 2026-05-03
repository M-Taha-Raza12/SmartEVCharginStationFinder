import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { CircleMarker, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { aiApi, bookingApi, stationApi, reviewApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { Station, Review } from '../types/models'

// Custom icon for user location
const userLocationIcon = new L.DivIcon({
  className: 'custom-user-marker',
  html: `
    <div style="
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      animation: pulse 2s infinite;
    ">
      📍
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
    </style>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
})

export function MapPage() {
  const { user } = useAuth()
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [maxPrice, setMaxPrice] = useState<number | ''>('')
  const [availableOnly, setAvailableOnly] = useState(false)

  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [stationReviews, setStationReviews] = useState<Review[]>([])
  const [showReviewModal, setShowReviewModal] = useState(false)

  const [bookingStationId, setBookingStationId] = useState<string>('')
  const [bookingDate, setBookingDate] = useState('')
  const [startTime, setStartTime] = useState('14:00')
  const [durationMinutes, setDurationMinutes] = useState(60)

  const [aiLocation, setAiLocation] = useState('Current city center')
  const [aiBudget, setAiBudget] = useState<number | ''>('')
  const [aiContext, setAiContext] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null)
  const [locationError, setLocationError] = useState<string>('')
  const [locating, setLocating] = useState(false)

  const mapCenter: [number, number] = useMemo(() => {
    if (userPosition) {
      return userPosition
    }

    if (stations.length === 0) {
      return [40.7128, -74.0060] // Default to New York
    }
    return [stations[0].latitude, stations[0].longitude]
  }, [stations, userPosition])

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    setLocating(true)
    setLocationError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPosition: [number, number] = [
          position.coords.latitude,
          position.coords.longitude
        ]
        setUserPosition(newPosition)
        setLocating(false)
        setLocationError('')
      },
      (error) => {
        setLocating(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please enable location permissions in your browser.')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.')
            break
          case error.TIMEOUT:
            setLocationError('Location request timed out.')
            break
          default:
            setLocationError('An unknown error occurred.')
        }
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000,
        maximumAge: 0
      },
    )
  }

  const loadStations = async () => {
    setLoading(true)
    try {
      const data = await stationApi.list({
        search: search || undefined,
        maxPrice: maxPrice === '' ? undefined : maxPrice,
        availableOnly,
      })
      setStations(data)
      if (!bookingStationId && data.length > 0) {
        setBookingStationId(data[0].id)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadStationReviews = async (stationId: string) => {
    try {
      const reviews = await reviewApi.getStationReviews(stationId)
      setStationReviews(reviews)
    } catch (error) {
      console.error('Failed to load reviews:', error)
    }
  }

  useEffect(() => {
    void loadStations()
    // Automatically try to get user location on mount
    getUserLocation()
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      return
    }

    // Remove this auto-location effect since we're calling getUserLocation() in the main useEffect
  }, [])

  const submitFilters = async (event: FormEvent) => {
    event.preventDefault()
    await loadStations()
  }

  const createBooking = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await bookingApi.create({
        stationId: bookingStationId,
        bookingDate,
        startTime,
        durationMinutes,
      })
      await loadStations()
      alert('Booking confirmed! Check your bookings page.')
    } catch (error) {
      alert('Booking failed. Please try again.')
    }
  }

  const runAi = async (event: FormEvent) => {
    event.preventDefault()
    try {
      const recommendation = await aiApi.recommend({
        userLocation: aiLocation,
        budget: aiBudget === '' ? undefined : aiBudget,
        additionalContext: aiContext || undefined,
      })
      setAiResult(recommendation)
    } catch (error) {
      alert('AI recommendation failed. Please try again.')
    }
  }

  const viewStationDetails = (station: Station) => {
    setSelectedStation(station)
    void loadStationReviews(station.id)
    setShowReviewModal(true)
  }

  return (
    <section className="dashboard-grid">
      <article className="glass panel controls">
        <h1>🔍 Find Charging Stations</h1>
        
        {/* Location Button */}
        <div className="location-section">
          <button 
            type="button" 
            onClick={getUserLocation} 
            disabled={locating}
            className="btn btn-secondary"
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {locating ? '📍 Locating...' : '📍 Use My Location'}
          </button>
          {locationError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
              {locationError}
            </div>
          )}
          {userPosition && !locationError && (
            <div className="alert alert-success" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
              ✓ Location detected: {userPosition[0].toFixed(4)}, {userPosition[1].toFixed(4)}
            </div>
          )}
        </div>
        
        <form className="stack-form" onSubmit={submitFilters}>
          <label>
            Search by station or address
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Station name or location" />
          </label>
          <label>
            Max price per kWh
            <input type="number" step="0.01" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))} />
          </label>
          <label className="check-label">
            <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} />
            Only show available stations
          </label>
          <button type="submit">Apply Filters</button>
        </form>

        {user && user.role !== 'Owner' && (
          <>
            <h2>📅 Book a Slot</h2>
            <form className="stack-form" onSubmit={createBooking}>
              <label>
                Station
                <select value={bookingStationId} onChange={(e) => setBookingStationId(e.target.value)} required>
                  {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.name} ({station.availableSlots} slots) - Rs {station.pricePerKwh}/kWh
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Date
                <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} required />
              </label>
              <label>
                Start time
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </label>
              <label>
                Duration (minutes)
                <input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} min={15} required />
              </label>
              <button type="submit">Confirm Booking</button>
            </form>

            <h2>🧠 AI Recommendation</h2>
            <form className="stack-form" onSubmit={runAi}>
              <label>
                Your location
                <input value={aiLocation} onChange={(e) => setAiLocation(e.target.value)} required />
              </label>
              <label>
                Budget (optional)
                <input type="number" step="0.01" value={aiBudget} onChange={(e) => setAiBudget(e.target.value === '' ? '' : Number(e.target.value))} />
              </label>
              <label>
                Additional context
                <textarea value={aiContext} onChange={(e) => setAiContext(e.target.value)} rows={3} />
              </label>
              <button type="submit">Get Recommendation</button>
            </form>
            {aiResult && <div className="ai-result"><strong>AI Says:</strong> {aiResult}</div>}
          </>
        )}
      </article>

      <article className="glass panel map-panel">
        {loading && <p>Loading stations...</p>}
        {!loading && (
          <MapContainer center={mapCenter} zoom={13} className="map-canvas" scrollWheelZoom>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {stations.map((station) => (
              <Marker key={station.id} position={[station.latitude, station.longitude]}>
                <Popup>
                  <div className="station-popup">
                    <strong>{station.name}</strong>
                    {station.averageRating && (
                      <div className="rating">⭐ {station.averageRating.toFixed(1)} ({station.reviewCount} reviews)</div>
                    )}
                    <br />
                    {station.address ?? 'Address unavailable'}
                    <br />
                    <strong>Price:</strong> Rs {station.pricePerKwh}/kWh
                    <br />
                    <strong>Slots:</strong> {station.availableSlots}/{station.totalSlots}
                    {station.workingHoursStart && station.workingHoursEnd && (
                      <>
                        <br />
                        <strong>Hours:</strong> {station.workingHoursStart} - {station.workingHoursEnd}
                      </>
                    )}
                    <br />
                    <button type="button" onClick={() => viewStationDetails(station)} className="view-details-btn">
                      View Details & Reviews
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
            {userPosition && (
              <Marker 
                position={userPosition}
                icon={userLocationIcon}
              >
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <strong style={{ fontSize: '1.1rem' }}>📍 Your Location</strong>
                    <br />
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>
                      {userPosition[0].toFixed(6)}, {userPosition[1].toFixed(6)}
                    </span>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        )}
      </article>

      {showReviewModal && selectedStation && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedStation.name}</h2>
              <button className="close-btn" onClick={() => setShowReviewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="station-details">
                <p><strong>Address:</strong> {selectedStation.address || 'N/A'}</p>
                <p><strong>Price:</strong> Rs {selectedStation.pricePerKwh}/kWh</p>
                <p><strong>Available Slots:</strong> {selectedStation.availableSlots}/{selectedStation.totalSlots}</p>
                {selectedStation.workingHoursStart && selectedStation.workingHoursEnd && (
                  <p><strong>Working Hours:</strong> {selectedStation.workingHoursStart} - {selectedStation.workingHoursEnd}</p>
                )}
                {selectedStation.averageRating && (
                  <p><strong>Rating:</strong> ⭐ {selectedStation.averageRating.toFixed(1)} ({selectedStation.reviewCount} reviews)</p>
                )}
              </div>
              <h3>Reviews</h3>
              {stationReviews.length === 0 && <p>No reviews yet. Be the first to review!</p>}
              {stationReviews.length > 0 && (
                <div className="reviews-list">
                  {stationReviews.map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <strong>{review.userName}</strong>
                        <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                      </div>
                      {review.comment && <p className="review-comment">{review.comment}</p>}
                      <small className="review-date">{new Date(review.createdAt).toLocaleDateString()}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
