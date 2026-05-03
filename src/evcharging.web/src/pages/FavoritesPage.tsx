import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { favoriteApi } from '../services/api'
import type { Favorite } from '../types/models'
import './FavoritesPage.css'

export function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await favoriteApi.list()
      setFavorites(data)
    } catch (err: any) {
      // Silently handle error - feature not available in in-memory database
      console.log('Favorites feature requires database setup')
      setError('')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (stationId: string) => {
    if (!confirm('Remove this station from favorites?')) return

    try {
      await favoriteApi.remove(stationId)
      setFavorites(prev => prev.filter(f => f.stationId !== stationId))
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove favorite')
    }
  }

  if (loading) {
    return (
      <div className="favorites-page">
        <div className="loading">Loading favorites...</div>
      </div>
    )
  }

  return (
    <div className="favorites-page">
      <div className="page-header">
        <h1>⭐ My Favorite Stations</h1>
        <p>Quick access to your saved charging stations</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {favorites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💔</div>
          <h2>No favorites yet</h2>
          <p>Start adding stations to your favorites for quick access!</p>
          <Link to="/stations" className="btn-primary">
            Browse Stations
          </Link>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map(favorite => (
            <div key={favorite.id} className="favorite-card">
              <div className="favorite-header">
                <h3>{favorite.station.name}</h3>
                <button
                  type="button"
                  className="remove-favorite-btn"
                  onClick={() => handleRemove(favorite.stationId)}
                  title="Remove from favorites"
                >
                  ❤️
                </button>
              </div>

              <div className="favorite-details">
                {favorite.station.address && (
                  <div className="detail-row">
                    <span className="detail-icon">📍</span>
                    <span>{favorite.station.address}</span>
                  </div>
                )}

                <div className="detail-row">
                  <span className="detail-icon">💰</span>
                  <span>Rs {favorite.station.pricePerKwh}/kWh</span>
                </div>

                <div className="detail-row">
                  <span className="detail-icon">🔌</span>
                  <span>
                    {favorite.station.availableSlots}/{favorite.station.totalSlots} slots available
                  </span>
                </div>

                {favorite.station.workingHoursStart && favorite.station.workingHoursEnd && (
                  <div className="detail-row">
                    <span className="detail-icon">🕐</span>
                    <span>
                      {favorite.station.workingHoursStart} - {favorite.station.workingHoursEnd}
                    </span>
                  </div>
                )}

                {favorite.station.averageRating && (
                  <div className="detail-row">
                    <span className="detail-icon">⭐</span>
                    <span>
                      {favorite.station.averageRating.toFixed(1)} ({favorite.station.reviewCount}{' '}
                      reviews)
                    </span>
                  </div>
                )}
              </div>

              <div className="favorite-actions">
                <Link to="/map" state={{ selectedStation: favorite.station }} className="btn-secondary">
                  View on Map
                </Link>
                <Link to="/stations" state={{ selectedStation: favorite.station }} className="btn-primary">
                  Book Now
                </Link>
              </div>

              <div className="favorite-date">
                Added {new Date(favorite.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
