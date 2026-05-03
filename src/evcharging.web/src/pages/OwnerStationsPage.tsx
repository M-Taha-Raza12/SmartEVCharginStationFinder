import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { stationApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { Station } from '../types/models'
import './OwnerStations.css'

type StationForm = {
  name: string
  address: string
  latitude: number
  longitude: number
  pricePerKwh: number
  totalSlots: number
  availableSlots: number
  workingHoursStart: string
  workingHoursEnd: string
}

const emptyForm: StationForm = {
  name: '',
  address: '',
  latitude: 40.7128,
  longitude: -74.0060,
  pricePerKwh: 0.35,
  totalSlots: 10,
  availableSlots: 10,
  workingHoursStart: '08:00',
  workingHoursEnd: '20:00',
}

export function OwnerStationsPage() {
  const { user } = useAuth()
  const [stations, setStations] = useState<Station[]>([])
  const [form, setForm] = useState<StationForm>(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleteRequests, setDeleteRequests] = useState<Set<string>>(new Set())

  const loadStations = async () => {
    setLoading(true)
    try {
      const data = await stationApi.myStations()
      setStations(data)
    } catch (error) {
      console.error('Failed to load stations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadStations()
  }, [])

  const mapCenter: [number, number] = stations.length > 0 
    ? [stations[0].latitude, stations[0].longitude]
    : [40.7128, -74.0060]

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      if (editId) {
        await stationApi.update(editId, form)
        alert('Station updated successfully!')
      } else {
        await stationApi.create(form)
        alert('Station created! Waiting for admin approval.')
      }

      setForm(emptyForm)
      setEditId(null)
      setShowForm(false)
      await loadStations()
    } catch (error) {
      alert('Failed to save station. Please try again.')
    }
  }

  const edit = (station: Station) => {
    setEditId(station.id)
    setForm({
      name: station.name,
      address: station.address ?? '',
      latitude: station.latitude,
      longitude: station.longitude,
      pricePerKwh: station.pricePerKwh,
      totalSlots: station.totalSlots,
      availableSlots: station.availableSlots,
      workingHoursStart: station.workingHoursStart ?? '08:00',
      workingHoursEnd: station.workingHoursEnd ?? '20:00',
    })
    setShowForm(true)
  }

  const requestDelete = (id: string) => {
    if (confirm('Request deletion? This requires admin approval.')) {
      setDeleteRequests(prev => new Set(prev).add(id))
      alert('Delete request submitted. Waiting for admin approval.')
    }
  }

  const cancelEdit = () => {
    setEditId(null)
    setForm(emptyForm)
    setShowForm(false)
  }

  return (
    <div className="owner-stations-page">
      <div className="page-header">
        <div>
          <h1>My Charging Stations</h1>
          <p className="subtitle">Manage your registered charging stations</p>
        </div>
        <button 
          className="btn btn-primary btn-lg" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Close Form' : '➕ Add New Station'}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="station-form-card modern-card">
          <h2>{editId ? 'Update Station' : 'Create New Station'}</h2>
          <form className="station-form" onSubmit={submit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="input-label">Station Name *</label>
                <input 
                  className="input-field"
                  value={form.name} 
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} 
                  placeholder="e.g., Downtown Charging Hub"
                  required 
                />
              </div>

              <div className="form-group">
                <label className="input-label">Address</label>
                <input 
                  className="input-field"
                  value={form.address} 
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} 
                  placeholder="e.g., 123 Main St"
                />
              </div>

              <div className="form-group">
                <label className="input-label">Latitude *</label>
                <input 
                  className="input-field"
                  type="number" 
                  step="0.000001" 
                  value={form.latitude} 
                  onChange={(e) => setForm((f) => ({ ...f, latitude: Number(e.target.value) }))} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="input-label">Longitude *</label>
                <input 
                  className="input-field"
                  type="number" 
                  step="0.000001" 
                  value={form.longitude} 
                  onChange={(e) => setForm((f) => ({ ...f, longitude: Number(e.target.value) }))} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="input-label">Price per kWh ($) *</label>
                <input 
                  className="input-field"
                  type="number" 
                  step="0.01" 
                  value={form.pricePerKwh} 
                  onChange={(e) => setForm((f) => ({ ...f, pricePerKwh: Number(e.target.value) }))} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="input-label">Total Slots *</label>
                <input 
                  className="input-field"
                  type="number" 
                  value={form.totalSlots} 
                  onChange={(e) => setForm((f) => ({ ...f, totalSlots: Number(e.target.value) }))} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="input-label">Available Slots *</label>
                <input 
                  className="input-field"
                  type="number" 
                  value={form.availableSlots} 
                  onChange={(e) => setForm((f) => ({ ...f, availableSlots: Number(e.target.value) }))} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="input-label">Working Hours Start</label>
                <input 
                  className="input-field"
                  type="time" 
                  value={form.workingHoursStart} 
                  onChange={(e) => setForm((f) => ({ ...f, workingHoursStart: e.target.value }))} 
                />
              </div>

              <div className="form-group">
                <label className="input-label">Working Hours End</label>
                <input 
                  className="input-field"
                  type="time" 
                  value={form.workingHoursEnd} 
                  onChange={(e) => setForm((f) => ({ ...f, workingHoursEnd: e.target.value }))} 
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editId ? '💾 Save Changes' : '✓ Create Station'}
              </button>
              <button type="button" onClick={cancelEdit} className="btn btn-ghost">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Map View */}
      <div className="map-section modern-card">
        <h2>Station Locations</h2>
        {stations.length === 0 ? (
          <div className="empty-state">
            <p>No stations yet. Create your first station to see it on the map!</p>
          </div>
        ) : (
          <div className="map-container">
            <MapContainer center={mapCenter} zoom={12} style={{ height: '500px', borderRadius: '1rem' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {stations.map((station) => (
                <Marker key={station.id} position={[station.latitude, station.longitude]}>
                  <Popup>
                    <div style={{ minWidth: '200px' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{station.name}</strong>
                      <br />
                      <span className={`badge badge-${station.isApproved ? 'success' : 'warning'}`}>
                        {station.isApproved ? '✓ Approved' : '⏳ Pending'}
                      </span>
                      <br />
                      <strong>Price:</strong> ${station.pricePerKwh}/kWh
                      <br />
                      <strong>Slots:</strong> {station.availableSlots}/{station.totalSlots}
                      {station.averageRating && (
                        <>
                          <br />
                          <strong>Rating:</strong> ⭐ {station.averageRating.toFixed(1)} ({station.reviewCount})
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>

      {/* Stations List */}
      <div className="stations-list modern-card">
        <h2>Your Stations ({stations.length})</h2>
        {loading && <p>Loading stations...</p>}
        {!loading && stations.length === 0 && (
          <div className="empty-state">
            <p>No stations yet. Click "Add New Station" to create your first station!</p>
          </div>
        )}
        {!loading && stations.length > 0 && (
          <div className="stations-grid">
            {stations.map((station) => (
              <div key={station.id} className="station-card">
                <div className="station-card-header">
                  <h3>{station.name}</h3>
                  <span className={`badge badge-${station.isApproved ? 'success' : 'warning'}`}>
                    {station.isApproved ? '✓ Approved' : '⏳ Pending'}
                  </span>
                </div>
                
                <div className="station-card-body">
                  <div className="station-info-row">
                    <span className="info-label">📍 Address:</span>
                    <span>{station.address || 'Not specified'}</span>
                  </div>
                  <div className="station-info-row">
                    <span className="info-label">💰 Price:</span>
                    <span>${station.pricePerKwh}/kWh</span>
                  </div>
                  <div className="station-info-row">
                    <span className="info-label">⚡ Slots:</span>
                    <span>{station.availableSlots}/{station.totalSlots} available</span>
                  </div>
                  <div className="station-info-row">
                    <span className="info-label">🕐 Hours:</span>
                    <span>{station.workingHoursStart || '00:00'} - {station.workingHoursEnd || '23:59'}</span>
                  </div>
                  {station.averageRating && (
                    <div className="station-info-row">
                      <span className="info-label">⭐ Rating:</span>
                      <span>{station.averageRating.toFixed(1)} ({station.reviewCount} reviews)</span>
                    </div>
                  )}
                </div>

                <div className="station-card-actions">
                  <button 
                    className="btn btn-sm btn-outline" 
                    onClick={() => edit(station)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger" 
                    onClick={() => requestDelete(station.id)}
                    disabled={deleteRequests.has(station.id)}
                  >
                    {deleteRequests.has(station.id) ? '⏳ Requested' : '🗑️ Request Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
