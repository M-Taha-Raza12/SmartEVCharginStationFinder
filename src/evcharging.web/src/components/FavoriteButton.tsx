import { useEffect, useState } from 'react'
import { favoriteApi } from '../services/api'
import './FavoriteButton.css'

interface FavoriteButtonProps {
  stationId: string
  onToggle?: (isFavorite: boolean) => void
}

export function FavoriteButton({ stationId, onToggle }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkFavoriteStatus()
  }, [stationId])

  const checkFavoriteStatus = async () => {
    try {
      const status = await favoriteApi.check(stationId)
      setIsFavorite(status)
    } catch (error) {
      console.error('Failed to check favorite status:', error)
    }
  }

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering parent click events
    
    if (loading) return

    setLoading(true)
    try {
      if (isFavorite) {
        await favoriteApi.remove(stationId)
        setIsFavorite(false)
        onToggle?.(false)
      } else {
        await favoriteApi.add({ stationId })
        setIsFavorite(true)
        onToggle?.(true)
      }
    } catch (error: any) {
      console.error('Failed to toggle favorite:', error)
      alert(error.response?.data?.message || 'Failed to update favorite')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      className={`favorite-button ${isFavorite ? 'is-favorite' : ''} ${loading ? 'loading' : ''}`}
      onClick={handleToggle}
      disabled={loading}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorite ? '❤️' : '🤍'}
    </button>
  )
}
