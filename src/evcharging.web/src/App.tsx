import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { HomePage } from './pages/HomePage'
import { BookingsPage } from './pages/BookingsPage'
import { LoginPage } from './pages/LoginPage'
import { MapPage } from './pages/MapPage'
import { StationsPage } from './pages/StationsPage'
import { ClientDashboardPage } from './pages/ClientDashboardPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { AdminStationsPage } from './pages/AdminStationsPage'
import { OwnerStationsPage } from './pages/OwnerStationsPage'
import { OwnerDashboardPage } from './pages/OwnerDashboardPage'
import { OwnerBookingsPage } from './pages/OwnerBookingsPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { WalletPage } from './pages/WalletPage'
import { ChargingHistoryPage } from './pages/ChargingHistoryPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="stations" element={<StationsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <ClientDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="bookings"
          element={
            <ProtectedRoute>
              <BookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="favorites"
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="wallet"
          element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="charging-history"
          element={
            <ProtectedRoute>
              <ChargingHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/dashboard"
          element={
            <ProtectedRoute ownerOnly>
              <OwnerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/stations"
          element={
            <ProtectedRoute ownerOnly>
              <OwnerStationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/bookings"
          element={
            <ProtectedRoute ownerOnly>
              <OwnerBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/stations"
          element={
            <ProtectedRoute adminOnly>
              <AdminStationsPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
