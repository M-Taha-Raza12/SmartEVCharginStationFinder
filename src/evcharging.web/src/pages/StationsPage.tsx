import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { aiApi, bookingApi, stationApi, reviewApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { Station, Review } from '../types/models'
import './Stations.css'

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

// Component to recenter map
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, 13)
  }, [center, map])
  return null
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  // Return distance, ensuring it's a reasonable value
  return Math.abs(distance)
}

// Estimate travel time (assuming average speed of 50 km/h in city)
function estimateTravelTime(distanceKm: number): string {
  const hours = distanceKm / 50
  const minutes = Math.round(hours * 60)
  if (minutes < 60) {
    return `${minutes} min`
  }
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

type StationWithDistance = Station & {
  distance?: number
  travelTime?: string
}

export function StationsPage() {
  const { user } = useAuth()
  const [stations, setStations] = useState<StationWithDistance[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [maxPrice, setMaxPrice] = useState<number | ''>('')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'rating'>('distance')

  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [stationReviews, setStationReviews] = useState<Review[]>([])
  const [showReviewModal, setShowReviewModal] = useState(false)

  const [bookingStationId, setBookingStationId] = useState<string>('')
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]) // Default to today
  const [startTime, setStartTime] = useState('14:00')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [showBookingModal, setShowBookingModal] = useState(false)

  const [aiLocation, setAiLocation] = useState('')
  const [aiBudget, setAiBudget] = useState<number | ''>('')
  const [aiContext, setAiContext] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [showAiModal, setShowAiModal] = useState(false)

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
        // Update AI location
        setAiLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`)
      },
      (error) => {
        setLocating(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please enable location permissions.')
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
      }
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
      
      // Calculate distances if user position is available
      const stationsWithDistance = data.map(station => {
        if (userPosition) {
          const distance = calculateDistance(
            userPosition[0],
            userPosition[1],
            station.latitude,
            station.longitude
          )
          return {
            ...station,
            distance,
            travelTime: estimateTravelTime(distance)
          }
        }
        return station
      })

      setStations(stationsWithDistance)
      if (!bookingStationId && stationsWithDistance.length > 0) {
        setBookingStationId(stationsWithDistance[0].id)
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
    getUserLocation()
  }, [])

  useEffect(() => {
    if (userPosition) {
      void loadStations()
    }
  }, [userPosition])

  const submitFilters = async (event: FormEvent) => {
    event.preventDefault()
    await loadStations()
  }

  const openBookingModal = (station: Station) => {
    setBookingStationId(station.id)
    setShowBookingModal(true)
  }

  const createBooking = async (event: FormEvent) => {
    event.preventDefault()
    
    if (!bookingDate) {
      alert('Please select a booking date.')
      return
    }
    
    try {
      await bookingApi.create({
        stationId: bookingStationId,
        bookingDate,
        startTime,
        durationMinutes,
      })
      await loadStations()
      setShowBookingModal(false)
      alert('Booking confirmed! Check your bookings page.')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Booking failed. Please try again.'
      alert(errorMessage)
      console.error('Booking error:', error)
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

  const findNearbyStations = () => {
    if (!userPosition) {
      getUserLocation()
      return
    }
    // Stations are already sorted by distance if user position exists
    setSortBy('distance')
  }

  // Sort stations
  const sortedStations = useMemo(() => {
    const sorted = [...stations]
    
    // Filter out stations with unrealistic distances (> 500 km)
    const filtered = sorted.filter(station => {
      if (station.distance === undefined) return true
      return station.distance < 500 // Only show stations within 500 km
    })
    
    switch (sortBy) {
      case 'distance':
        return filtered.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
      case 'price':
        return filtered.sort((a, b) => a.pricePerKwh - b.pricePerKwh)
      case 'rating':
        return filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      default:
        return filtered
    }
  }, [stations, sortBy])

  return (
    <div className="stations-page">
      {/* Header */}
      <div className="stations-header">
        <div>
          <h1>Find Charging Stations</h1>
          <p className="subtitle">Discover and book EV charging stations near you</p>
        </div>
        <div className="header-actions">
          <button 
            type="button" 
            onClick={findNearbyStations} 
            disabled={locating}
            className="btn btn-primary"
          >
            {locating ? '📍 Locating...' : '📍 Find Nearby Stations'}
          </button>
          {user && (
            <button 
              type="button" 
              onClick={() => setShowAiModal(true)}
              className="btn btn-secondary"
            >
              🧠 AI Recommendations
            </button>
          )}
        </div>
      </div>

      {/* Location Status */}
      {locationError && (
        <div className="alert alert-error">
          {locationError}
        </div>
      )}
      {userPosition && !locationError && (
        <div className="alert alert-success">
          ✓ Your location detected - Showing distances and travel times
        </div>
      )}

      {/* Main Content */}
      <div className="stations-content">
        {/* Sidebar */}
        <aside className="stations-sidebar">
          {/* Filters */}
          <div className="filter-card modern-card">
            <h2>Filters</h2>
            <form className="filter-form" onSubmit={submitFilters}>
              <div className="form-group">
                <label className="input-label">Search</label>
                <input 
                  className="input-field"
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  placeholder="Station name or location" 
                />
              </div>

              <div className="form-group">
                <label className="input-label">Max Price ($/kWh)</label>
                <input 
                  className="input-field"
                  type="number" 
                  step="0.01" 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))} 
                  placeholder="Any price"
                />
              </div>

              <div className="form-group">
                <label className="input-label">Sort By</label>
                <select 
                  className="input-field"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="distance">Distance</option>
                  <option value="price">Price (Low to High)</option>
                  <option value="rating">Rating (High to Low)</option>
                </select>
              </div>

              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={availableOnly} 
                  onChange={(e) => setAvailableOnly(e.target.checked)} 
                />
                <span>Only show available stations</span>
              </label>

              <button type="submit" className="btn btn-primary btn-block">
                Apply Filters
              </button>
            </form>
          </div>

          {/* Stations List */}
          <div className="stations-list-card modern-card">
            <h2>Stations ({sortedStations.length})</h2>
            {loading && <p>Loading stations...</p>}
            {!loading && sortedStations.length === 0 && (
              <div className="empty-state-small">
                <p>No stations found</p>
              </div>
            )}
            {!loading && sortedStations.length > 0 && (
              <div className="stations-list">
                {sortedStations.map((station) => (
                  <div 
                    key={station.id} 
                    className="station-list-item"
                    onClick={() => viewStationDetails(station)}
                  >
                    <div className="station-list-header">
                      <h3>{station.name}</h3>
                      {station.averageRating && (
                        <span className="station-rating-badge">
                          ⭐ {station.averageRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="station-list-address">{station.address || 'Address not available'}</p>
                    <div className="station-list-info">
                      <span className="info-badge">💰 ${station.pricePerKwh}/kWh</span>
                      <span className="info-badge">⚡ {station.availableSlots}/{station.totalSlots}</span>
                    </div>
                    {station.distance !== undefined && station.distance < 1000 && (
                      <div className="station-distance-info">
                        <span className="distance-badge">
                          📍 {station.distance < 1 ? (station.distance * 1000).toFixed(0) + ' m' : station.distance.toFixed(1) + ' km'}
                        </span>
                        <span className="time-badge">
                          🕐 {station.travelTime}
                        </span>
                      </div>
                    )}
                    {user && user.role === 'Client' && (
                      <button 
                        className="btn btn-sm btn-primary btn-block"
                        onClick={(e) => {
                          e.stopPropagation()
                          openBookingModal(station)
                        }}
                      >
                        Book Now
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Map */}
        <div className="map-section modern-card">
          {loading && <p>Loading map...</p>}
          {!loading && (
            <MapContainer center={mapCenter} zoom={13} className="map-canvas" scrollWheelZoom>
              <MapRecenter center={mapCenter} />
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {sortedStations.map((station) => (
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
                      <strong>Price:</strong> ${station.pricePerKwh}/kWh
                      <br />
                      <strong>Slots:</strong> {station.availableSlots}/{station.totalSlots}
                      {station.distance !== undefined && station.distance < 1000 && (
                        <>
                          <br />
                          <strong>Distance:</strong> {station.distance < 1 ? (station.distance * 1000).toFixed(0) + ' m' : station.distance.toFixed(1) + ' km'} ({station.travelTime})
                        </>
                      )}
                      {station.workingHoursStart && station.workingHoursEnd && (
                        <>
                          <br />
                          <strong>Hours:</strong> {station.workingHoursStart} - {station.workingHoursEnd}
                        </>
                      )}
                      <br />
                      <button type="button" onClick={() => viewStationDetails(station)} className="view-details-btn">
                        View Details
                      </button>
                      {user && user.role === 'Client' && (
                        <button type="button" onClick={() => openBookingModal(station)} className="book-btn">
                          Book Now
                        </button>
                      )}
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
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && user && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content modal-booking" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Book Charging Slot</h2>
              <button className="close-btn" onClick={() => setShowBookingModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form className="booking-form" onSubmit={createBooking}>
                <div className="form-group">
                  <label className="input-label">Station</label>
                  <select 
                    className="input-field"
                    value={bookingStationId} 
                    onChange={(e) => setBookingStationId(e.target.value)} 
                    required
                  >
                    {sortedStations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.name} ({station.availableSlots} slots) - ${station.pricePerKwh}/kWh
                        {station.distance !== undefined && station.distance < 1000 && ` - ${station.distance < 1 ? (station.distance * 1000).toFixed(0) + ' m' : station.distance.toFixed(1) + ' km'} away`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">Date</label>
                    <input 
                      className="input-field"
                      type="date" 
                      value={bookingDate} 
                      onChange={(e) => setBookingDate(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="input-label">Start Time</label>
                    <input 
                      className="input-field"
                      type="time" 
                      value={startTime} 
                      onChange={(e) => setStartTime(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="input-label">Duration (minutes)</label>
                  <input 
                    className="input-field"
                    type="number" 
                    value={durationMinutes} 
                    onChange={(e) => setDurationMinutes(Number(e.target.value))} 
                    min={15} 
                    step={15}
                    required 
                  />
                  <small className="form-hint">Minimum 15 minutes, increments of 15</small>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary btn-block">
                    Confirm Booking
                  </button>
                  <button type="button" onClick={() => setShowBookingModal(false)} className="btn btn-ghost btn-block">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {showAiModal && user && (
        <div className="modal-overlay" onClick={() => setShowAiModal(false)}>
          <div className="modal-content modal-ai" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🧠 AI Recommendations</h2>
              <button className="close-btn" onClick={() => setShowAiModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form className="ai-form" onSubmit={runAi}>
                <div className="form-group">
                  <label className="input-label">Your Location</label>
                  <input 
                    className="input-field"
                    value={aiLocation} 
                    onChange={(e) => setAiLocation(e.target.value)} 
                    placeholder="e.g., Downtown Manhattan or coordinates"
                    required 
                  />
                  <small className="form-hint">
                    {userPosition ? 'Auto-filled with your current location' : 'Enter your location or enable location access'}
                  </small>
                </div>

                <div className="form-group">
                  <label className="input-label">Budget ($/kWh) - Optional</label>
                  <input 
                    className="input-field"
                    type="number" 
                    step="0.01" 
                    value={aiBudget} 
                    onChange={(e) => setAiBudget(e.target.value === '' ? '' : Number(e.target.value))} 
                    placeholder="Leave empty for any budget"
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">Additional Context - Optional</label>
                  <textarea 
                    className="input-field"
                    value={aiContext} 
                    onChange={(e) => setAiContext(e.target.value)} 
                    rows={3}
                    placeholder="e.g., Need fast charging, prefer covered parking, etc."
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block">
                  Get AI Recommendation
                </button>
              </form>

              {aiResult && (
                <div className="ai-result">
                  <h3>AI Recommendation:</h3>
                  <p>{aiResult}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Station Details Modal */}
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
                <p><strong>Price:</strong> ${selectedStation.pricePerKwh}/kWh</p>
                <p><strong>Available Slots:</strong> {selectedStation.availableSlots}/{selectedStation.totalSlots}</p>
                {selectedStation.workingHoursStart && selectedStation.workingHoursEnd && (
                  <p><strong>Working Hours:</strong> {selectedStation.workingHoursStart} - {selectedStation.workingHoursEnd}</p>
                )}
                {selectedStation.averageRating && (
                  <p><strong>Rating:</strong> ⭐ {selectedStation.averageRating.toFixed(1)} ({selectedStation.reviewCount} reviews)</p>
                )}
                {(selectedStation as StationWithDistance).distance !== undefined && (selectedStation as StationWithDistance).distance! < 1000 && (
                  <p><strong>Distance:</strong> {(selectedStation as StationWithDistance).distance! < 1 ? ((selectedStation as StationWithDistance).distance! * 1000).toFixed(0) + ' m' : (selectedStation as StationWithDistance).distance?.toFixed(1) + ' km'} ({(selectedStation as StationWithDistance).travelTime})</p>
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
    </div>
  )
}
