import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { NotificationBell } from './NotificationBell'

export function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-root">
      <header className="topbar glass">
        <Link to={user ? "/map" : "/"} className="brand">
          ⚡ ChargePilot
        </Link>
        <nav className="nav-links">
          {/* Owner Navigation */}
          {user?.role === 'Owner' && (
            <>
              <NavLink to="/owner/dashboard">Dashboard</NavLink>
              <NavLink to="/owner/stations">Stations</NavLink>
              <NavLink to="/owner/bookings">Bookings</NavLink>
            </>
          )}
          
          {/* Client Navigation */}
          {user?.role === 'Client' && (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/stations">Stations</NavLink>
              <NavLink to="/bookings">My Bookings</NavLink>
              <NavLink to="/favorites">Favorites</NavLink>
              <NavLink to="/wallet">Wallet</NavLink>
              <NavLink to="/charging-history">History</NavLink>
            </>
          )}
          
          {/* Admin Navigation */}
          {user?.role === 'SuperAdmin' && (
            <>
              <NavLink to="/admin/dashboard">Admin Panel</NavLink>
            </>
          )}
          
          {/* Guest Navigation */}
          {!user && (
            <>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/stations">Stations</NavLink>
            </>
          )}
          
          {/* Profile for all logged-in users */}
          {user && <NavLink to="/profile">Profile</NavLink>}
        </nav>

        <div className="topbar-actions">
          {!user && <Link to="/login">Login</Link>}
          {!user && <Link to="/register" className="button-link">Sign up</Link>}
          {user && (
            <div className="user-info">
              {/* Temporarily disabled - causing 401 errors */}
              {/* {user.role === 'Client' && <NotificationBell />} */}
              <span className="user-role">{user.role}</span>
              <button type="button" onClick={logout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  )
}
