import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'
import './HomePage.css'

export function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Redirect logged-in users based on role
  useEffect(() => {
    if (user) {
      if (user.role === 'Owner') {
        navigate('/owner/dashboard', { replace: true })
      } else if (user.role === 'Client') {
        navigate('/dashboard', { replace: true })
      } else if (user.role === 'SuperAdmin') {
        navigate('/admin/dashboard', { replace: true })
      } else {
        navigate('/stations', { replace: true })
      }
    }
  }, [user, navigate])

  // Don't render anything if user is logged in (will redirect)
  if (user) {
    return null
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="logo-container">
            <div className="logo-circle">
              <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="url(#gradient)" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="gradient" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#10b981"/>
                    <stop offset="1" stopColor="#3b82f6"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="brand-name">
              <span className="brand-charge">Charge</span>
              <span className="brand-pilot">Pilot</span>
            </h1>
          </div>
          
          <p className="hero-subtitle">
            Find, Book & Charge Your EV at the Best Stations Near You
          </p>
          
          <p className="hero-description">
            Smart EV charging made simple. Discover charging stations, compare prices, 
            book slots in advance, and get AI-powered recommendations for your journey.
          </p>
          
          <div className="hero-actions">
            {!user ? (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started Free
                  <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link to="/map" className="btn btn-outline btn-lg">
                  Explore Stations
                </Link>
              </>
            ) : (
              <Link to="/map" className="btn btn-primary btn-lg">
                View Charging Map
                <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </Link>
            )}
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">1000+</div>
              <div className="stat-label">Charging Stations</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">50K+</div>
              <div className="stat-label">Happy Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">24/7</div>
              <div className="stat-label">Support</div>
            </div>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="card-icon">⚡</div>
            <div className="card-text">Fast Charging</div>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">📍</div>
            <div className="card-text">Find Nearby</div>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">💰</div>
            <div className="card-text">Best Prices</div>
          </div>
          <div className="floating-card card-4">
            <div className="card-icon">🤖</div>
            <div className="card-text">AI Powered</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose ChargePilot?</h2>
          <p className="section-subtitle">Everything you need for hassle-free EV charging</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3 className="feature-title">Interactive Map</h3>
              <p className="feature-description">
                Find charging stations on an interactive map with real-time availability and pricing information.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3 className="feature-title">Easy Booking</h3>
              <p className="feature-description">
                Reserve your charging slot in advance. No more waiting in queues or uncertainty.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">AI Recommendations</h3>
              <p className="feature-description">
                Get smart suggestions based on your location, budget, and preferences using AI.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3 className="feature-title">Compare Prices</h3>
              <p className="feature-description">
                See pricing from multiple stations and choose the best deal for your budget.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3 className="feature-title">Reviews & Ratings</h3>
              <p className="feature-description">
                Read reviews from other EV owners and make informed decisions.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3 className="feature-title">Real-time Updates</h3>
              <p className="feature-description">
                Get instant notifications about your bookings and station availability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Get started in 3 simple steps</p>
          
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Find Stations</h3>
                <p className="step-description">
                  Search for charging stations near you or along your route using our interactive map.
                </p>
              </div>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">Book a Slot</h3>
                <p className="step-description">
                  Select your preferred time and duration, then confirm your booking instantly.
                </p>
              </div>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Charge & Go</h3>
                <p className="step-description">
                  Arrive at the station, plug in your EV, and enjoy fast, reliable charging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Start Your EV Journey?</h2>
          <p className="cta-description">
            Join thousands of EV owners who trust ChargePilot for their charging needs.
          </p>
          {!user ? (
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Free Account
            </Link>
          ) : (
            <Link to="/map" className="btn btn-primary btn-lg">
              Find Charging Stations
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
