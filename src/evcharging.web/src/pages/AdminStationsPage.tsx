import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { stationApi } from '../services/api'
import type { Station } from '../types/models'

type StationForm = {
  name: string
  address: string
  latitude: number
  longitude: number
  pricePerKwh: number
  totalSlots: number
  availableSlots: number
}

const emptyForm: StationForm = {
  name: '',
  address: '',
  latitude: 24.8607,
  longitude: 67.0011,
  pricePerKwh: 50,
  totalSlots: 10,
  availableSlots: 10,
}

export function AdminStationsPage() {
  const [stations, setStations] = useState<Station[]>([])
  const [form, setForm] = useState<StationForm>(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)

  const loadStations = async () => {
    const data = await stationApi.list()
    setStations(data)
  }

  useEffect(() => {
    void loadStations()
  }, [])

  const heading = useMemo(() => (editId ? 'Update station' : 'Add station'), [editId])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (editId) {
      await stationApi.update(editId, form)
    } else {
      await stationApi.create(form)
    }

    setForm(emptyForm)
    setEditId(null)
    await loadStations()
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
    })
  }

  const remove = async (id: string) => {
    await stationApi.delete(id)
    await loadStations()
  }

  return (
    <section className="card-grid">
      <article className="glass panel">
        <h1>{heading}</h1>
        <form className="stack-form" onSubmit={submit}>
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </label>
          <label>
            Address
            <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </label>
          <label>
            Latitude
            <input type="number" step="0.000001" value={form.latitude} onChange={(e) => setForm((f) => ({ ...f, latitude: Number(e.target.value) }))} required />
          </label>
          <label>
            Longitude
            <input type="number" step="0.000001" value={form.longitude} onChange={(e) => setForm((f) => ({ ...f, longitude: Number(e.target.value) }))} required />
          </label>
          <label>
            Price per kWh
            <input type="number" step="0.01" value={form.pricePerKwh} onChange={(e) => setForm((f) => ({ ...f, pricePerKwh: Number(e.target.value) }))} required />
          </label>
          <label>
            Total slots
            <input type="number" value={form.totalSlots} onChange={(e) => setForm((f) => ({ ...f, totalSlots: Number(e.target.value) }))} required />
          </label>
          <label>
            Available slots
            <input type="number" value={form.availableSlots} onChange={(e) => setForm((f) => ({ ...f, availableSlots: Number(e.target.value) }))} required />
          </label>
          <button type="submit">{editId ? 'Save changes' : 'Create station'}</button>
        </form>
      </article>
      <article className="glass panel">
        <h2>Stations</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Available</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {stations.map((station) => (
                <tr key={station.id}>
                  <td>{station.name}</td>
                  <td>{station.pricePerKwh}</td>
                  <td>{station.availableSlots}/{station.totalSlots}</td>
                  <td>
                    <button type="button" onClick={() => edit(station)}>Edit</button>
                    <button type="button" onClick={() => void remove(station.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
