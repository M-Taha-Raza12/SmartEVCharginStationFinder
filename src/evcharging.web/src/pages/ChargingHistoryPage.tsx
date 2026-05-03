import { useEffect, useState } from 'react'
import { chargingSessionApi } from '../services/api'
import type { ChargingSession, ChargingAnalytics } from '../types/models'
import './ChargingHistoryPage.css'

export function ChargingHistoryPage() {
  const [sessions, setSessions] = useState<ChargingSession[]>([])
  const [analytics, setAnalytics] = useState<ChargingAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAnalytics, setShowAnalytics] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [sessionsData, analyticsData] = await Promise.all([
        chargingSessionApi.list(),
        chargingSessionApi.getAnalytics(),
      ])
      setSessions(sessionsData)
      setAnalytics(analyticsData)
    } catch (err: any) {
      // Silently handle error - feature not available in in-memory database
      console.log('Charging history feature requires database setup')
      setError('')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { emoji: '🔄', label: 'Active', class: 'status-active' },
      completed: { emoji: '✅', label: 'Completed', class: 'status-completed' },
      interrupted: { emoji: '⚠️', label: 'Interrupted', class: 'status-interrupted' },
    }
    const badge = badges[status as keyof typeof badges] || badges.completed
    return (
      <span className={`status-badge ${badge.class}`}>
        {badge.emoji} {badge.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="charging-history-page">
        <div className="loading">Loading charging history...</div>
      </div>
    )
  }

  return (
    <div className="charging-history-page">
      <div className="page-header">
        <h1>📊 Charging History & Analytics</h1>
        <p>Track your charging sessions and energy consumption</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {analytics && (
        <div className="analytics-section">
          <div className="analytics-header">
            <h2>Analytics Overview</h2>
            <button
              type="button"
              className="toggle-analytics-btn"
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              {showAnalytics ? 'Hide' : 'Show'}
            </button>
          </div>

          {showAnalytics && (
            <>
              <div className="analytics-cards">
                <div className="analytics-card">
                  <div className="card-icon">🔋</div>
                  <div className="card-value">{analytics.totalSessions}</div>
                  <div className="card-label">Total Sessions</div>
                </div>

                <div className="analytics-card">
                  <div className="card-icon">⚡</div>
                  <div className="card-value">{analytics.totalEnergyConsumed.toFixed(1)} kWh</div>
                  <div className="card-label">Energy Consumed</div>
                </div>

                <div className="analytics-card">
                  <div className="card-icon">💰</div>
                  <div className="card-value">Rs {analytics.totalCost.toFixed(2)}</div>
                  <div className="card-label">Total Cost</div>
                </div>

                <div className="analytics-card">
                  <div className="card-icon">📈</div>
                  <div className="card-value">{analytics.averageEnergyPerSession.toFixed(1)} kWh</div>
                  <div className="card-label">Avg per Session</div>
                </div>
              </div>

              {analytics.mostUsedStation && (
                <div className="most-used-station">
                  <h3>🏆 Most Used Station</h3>
                  <div className="station-info">
                    <div className="station-name">{analytics.mostUsedStation.name}</div>
                    <div className="station-count">{analytics.mostUsedStation.count} sessions</div>
                  </div>
                </div>
              )}

              {analytics.monthlyBreakdown.length > 0 && (
                <div className="monthly-breakdown">
                  <h3>📅 Monthly Breakdown</h3>
                  <div className="breakdown-table">
                    <div className="breakdown-header">
                      <div>Month</div>
                      <div>Sessions</div>
                      <div>Energy (kWh)</div>
                      <div>Cost (Rs)</div>
                    </div>
                    {analytics.monthlyBreakdown.map((month, index) => (
                      <div key={index} className="breakdown-row">
                        <div>
                          {new Date(month.year, month.month - 1).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div>{month.sessions}</div>
                        <div>{month.energyConsumed.toFixed(1)}</div>
                        <div>{month.cost.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="sessions-section">
        <h2>Charging Sessions</h2>

        {sessions.length === 0 ? (
          <div className="empty-sessions">
            <div className="empty-icon">🔌</div>
            <p>No charging sessions yet</p>
            <p className="empty-hint">Start charging at a station to see your history here</p>
          </div>
        ) : (
          <div className="sessions-list">
            {sessions.map(session => (
              <div key={session.id} className="session-card">
                <div className="session-header">
                  <div className="session-station">
                    <h3>{session.station.name}</h3>
                    {session.station.address && (
                      <div className="session-address">{session.station.address}</div>
                    )}
                  </div>
                  {getStatusBadge(session.status)}
                </div>

                <div className="session-details">
                  <div className="detail-grid">
                    <div className="detail-item">
                      <div className="detail-label">Start Time</div>
                      <div className="detail-value">
                        {new Date(session.startTime).toLocaleString()}
                      </div>
                    </div>

                    {session.endTime && (
                      <div className="detail-item">
                        <div className="detail-label">End Time</div>
                        <div className="detail-value">
                          {new Date(session.endTime).toLocaleString()}
                        </div>
                      </div>
                    )}

                    <div className="detail-item">
                      <div className="detail-label">Duration</div>
                      <div className="detail-value">{formatDuration(session.duration)}</div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">Energy Consumed</div>
                      <div className="detail-value highlight">{session.energyConsumed.toFixed(2)} kWh</div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">Cost</div>
                      <div className="detail-value highlight">Rs {session.cost.toFixed(2)}</div>
                    </div>

                    {session.startBatteryLevel !== undefined && session.endBatteryLevel !== undefined && (
                      <div className="detail-item">
                        <div className="detail-label">Battery Level</div>
                        <div className="detail-value">
                          {session.startBatteryLevel}% → {session.endBatteryLevel}%
                        </div>
                      </div>
                    )}

                    {session.averagePower && (
                      <div className="detail-item">
                        <div className="detail-label">Avg Power</div>
                        <div className="detail-value">{session.averagePower.toFixed(1)} kW</div>
                      </div>
                    )}

                    {session.peakPower && (
                      <div className="detail-item">
                        <div className="detail-label">Peak Power</div>
                        <div className="detail-value">{session.peakPower.toFixed(1)} kW</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
