import axios from 'axios'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Station,
  StationRequest,
  StationFilters,
  Booking,
  CreateBookingRequest,
  AiRecommendationRequest,
  User,
  Review,
  CreateReviewRequest,
  DashboardStats,
  AdminUser,
  Notification,
  Favorite,
  AddFavoriteRequest,
  Payment,
  CreatePaymentRequest,
  Wallet,
  WalletTransaction,
  TopUpWalletRequest,
  ChargingSession,
  StartSessionRequest,
  EndSessionRequest,
  ChargingAnalytics,
} from '../types/models'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5183/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ev.token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginOrRegister = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register')
      
      // Don't logout for new features that might not have tables yet
      const isNewFeature = error.config?.url?.includes('/notifications') || 
                          error.config?.url?.includes('/favorites') || 
                          error.config?.url?.includes('/wallets') || 
                          error.config?.url?.includes('/chargingsessions') ||
                          error.config?.url?.includes('/payments')
      
      if (!isLoginOrRegister && !isNewFeature) {
        localStorage.removeItem('ev.token')
        localStorage.removeItem('ev.user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  async me(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  },
}

// Station API
export const stationApi = {
  async list(filters?: StationFilters): Promise<Station[]> {
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString())
    if (filters?.availableOnly) params.append('availableOnly', 'true')

    const response = await api.get<Station[]>(`/stations?${params.toString()}`)
    return response.data
  },

  async myStations(): Promise<Station[]> {
    const response = await api.get<Station[]>('/stations/my-stations')
    return response.data
  },

  async myStationsBookings(): Promise<any[]> {
    const response = await api.get<any[]>('/stations/my-stations/bookings')
    return response.data
  },

  async create(data: StationRequest): Promise<Station> {
    const response = await api.post<Station>('/stations', data)
    return response.data
  },

  async update(id: string, data: StationRequest): Promise<Station> {
    const response = await api.put<Station>(`/stations/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/stations/${id}`)
  },
}

// Booking API
export const bookingApi = {
  async create(data: CreateBookingRequest): Promise<Booking> {
    const response = await api.post<Booking>('/bookings', data)
    return response.data
  },

  async myBookings(): Promise<Booking[]> {
    const response = await api.get<Booking[]>('/bookings/user')
    return response.data
  },

  async update(id: string, data: { bookingDate: string; startTime: string; durationMinutes: number }): Promise<Booking> {
    const response = await api.put<Booking>(`/bookings/${id}`, data)
    return response.data
  },

  async cancel(id: string): Promise<void> {
    await api.delete(`/bookings/${id}`)
  },
}

// AI API
export const aiApi = {
  async recommend(data: AiRecommendationRequest): Promise<string> {
    const response = await api.post<{ recommendation: string }>('/ai/recommend', data)
    return response.data.recommendation
  },
}

// Review API
export const reviewApi = {
  async getStationReviews(stationId: string): Promise<Review[]> {
    const response = await api.get<Review[]>(`/reviews/station/${stationId}`)
    return response.data
  },

  async create(data: CreateReviewRequest): Promise<Review> {
    const response = await api.post<Review>('/reviews', data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/reviews/${id}`)
  },
}

// Admin API
export const adminApi = {
  async getDashboard(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/admin/dashboard')
    return response.data
  },

  async getUsers(role?: string): Promise<AdminUser[]> {
    const params = role ? `?role=${role}` : ''
    const response = await api.get<AdminUser[]>(`/admin/users${params}`)
    return response.data
  },

  async toggleUserActive(id: string): Promise<{ isActive: boolean }> {
    const response = await api.put<{ isActive: boolean }>(`/admin/users/${id}/toggle-active`)
    return response.data
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`)
  },

  async getPendingStations(): Promise<Station[]> {
    const response = await api.get<Station[]>('/admin/stations/pending')
    return response.data
  },

  async approveStation(id: string): Promise<void> {
    await api.put(`/admin/stations/${id}/approve`)
  },

  async rejectStation(id: string): Promise<void> {
    await api.put(`/admin/stations/${id}/reject`)
  },

  async getAllBookings(filters?: { status?: string; fromDate?: string; toDate?: string }): Promise<any[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.fromDate) params.append('fromDate', filters.fromDate)
    if (filters?.toDate) params.append('toDate', filters.toDate)

    const response = await api.get<any[]>(`/admin/bookings?${params.toString()}`)
    return response.data
  },

  async getAllReviews(): Promise<any[]> {
    const response = await api.get<any[]>('/admin/reviews')
    return response.data
  },

  async deleteReview(id: string): Promise<void> {
    await api.delete(`/admin/reviews/${id}`)
  },
}

// Notifications API
export const notificationApi = {
  async list(unreadOnly?: boolean): Promise<Notification[]> {
    const params = unreadOnly ? '?unreadOnly=true' : ''
    const response = await api.get<Notification[]>(`/notifications${params}`)
    return response.data
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ count: number }>('/notifications/unread-count')
    return response.data.count
  },

  async markAsRead(id: string): Promise<void> {
    await api.put(`/notifications/${id}/mark-read`)
  },

  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/mark-all-read')
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`)
  },
}

// Favorites API
export const favoriteApi = {
  async list(): Promise<Favorite[]> {
    const response = await api.get<Favorite[]>('/favorites')
    return response.data
  },

  async add(data: AddFavoriteRequest): Promise<Favorite> {
    const response = await api.post<Favorite>('/favorites', data)
    return response.data
  },

  async remove(stationId: string): Promise<void> {
    await api.delete(`/favorites/${stationId}`)
  },

  async check(stationId: string): Promise<boolean> {
    const response = await api.get<{ isFavorite: boolean }>(`/favorites/check/${stationId}`)
    return response.data.isFavorite
  },
}

// Payments API
export const paymentApi = {
  async create(data: CreatePaymentRequest): Promise<Payment> {
    const response = await api.post<Payment>('/payments', data)
    return response.data
  },

  async list(): Promise<Payment[]> {
    const response = await api.get<Payment[]>('/payments')
    return response.data
  },

  async get(id: string): Promise<Payment> {
    const response = await api.get<Payment>(`/payments/${id}`)
    return response.data
  },
}

// Wallet API
export const walletApi = {
  async get(): Promise<Wallet> {
    const response = await api.get<Wallet>('/wallets')
    return response.data
  },

  async topUp(data: TopUpWalletRequest): Promise<Wallet> {
    const response = await api.post<Wallet>('/wallets/topup', data)
    return response.data
  },

  async getTransactions(): Promise<WalletTransaction[]> {
    const response = await api.get<WalletTransaction[]>('/wallets/transactions')
    return response.data
  },
}

// Charging Sessions API
export const chargingSessionApi = {
  async start(data: StartSessionRequest): Promise<ChargingSession> {
    const response = await api.post<ChargingSession>('/chargingsessions', data)
    return response.data
  },

  async end(id: string, data: EndSessionRequest): Promise<ChargingSession> {
    const response = await api.put<ChargingSession>(`/chargingsessions/${id}/end`, data)
    return response.data
  },

  async list(): Promise<ChargingSession[]> {
    const response = await api.get<ChargingSession[]>('/chargingsessions')
    return response.data
  },

  async get(id: string): Promise<ChargingSession> {
    const response = await api.get<ChargingSession>(`/chargingsessions/${id}`)
    return response.data
  },

  async getAnalytics(fromDate?: string, toDate?: string): Promise<ChargingAnalytics> {
    const params = new URLSearchParams()
    if (fromDate) params.append('fromDate', fromDate)
    if (toDate) params.append('toDate', toDate)
    const response = await api.get<ChargingAnalytics>(`/chargingsessions/analytics?${params.toString()}`)
    return response.data
  },
}

export default api
