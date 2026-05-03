// User types
export interface User {
  id: string
  fullName: string
  email: string
  role: string
  businessName?: string
  contactDetails?: string
  isActive: boolean
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
  role: string
  businessName?: string
  contactDetails?: string
}

// Station types
export interface Station {
  id: string
  name: string
  address: string | null
  latitude: number
  longitude: number
  pricePerKwh: number
  totalSlots: number
  availableSlots: number
  ownerId?: string | null
  isApproved: boolean
  workingHoursStart?: string | null
  workingHoursEnd?: string | null
  averageRating?: number | null
  reviewCount: number
}

export interface StationRequest {
  name: string
  address?: string
  latitude: number
  longitude: number
  pricePerKwh: number
  totalSlots: number
  availableSlots: number
  workingHoursStart?: string
  workingHoursEnd?: string
}

export interface StationFilters {
  search?: string
  maxPrice?: number
  availableOnly?: boolean
}

// Booking types
export interface Booking {
  id: string
  stationId: string
  stationName: string
  bookingDate: string
  startTime: string
  durationMinutes: number
  status: string
}

export interface CreateBookingRequest {
  stationId: string
  bookingDate: string
  startTime: string
  durationMinutes: number
}

// AI types
export interface AiRecommendationRequest {
  userLocation: string
  budget?: number
  additionalContext?: string
}

export interface AiRecommendationResponse {
  recommendation: string
}

// Review types
export interface Review {
  id: string
  rating: number
  comment?: string
  createdAt: string
  userName: string
}

export interface CreateReviewRequest {
  stationId: string
  bookingId?: string
  rating: number
  comment?: string
}

// Admin types
export interface DashboardStats {
  totalUsers: number
  totalStations: number
  totalBookings: number
  pendingStations: number
  activeUsers: number
  totalClients: number
  totalOwners: number
}

export interface AdminUser {
  id: string
  fullName: string
  email: string
  role: string
  businessName?: string
  contactDetails?: string
  isActive: boolean
  createdAt: string
}

// Notification types
export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  relatedEntityType?: string
  relatedEntityId?: string
  isRead: boolean
  createdAt: string
}

// Favorite types
export interface Favorite {
  id: string
  stationId: string
  createdAt: string
  station: Station
}

export interface AddFavoriteRequest {
  stationId: string
}

// Payment types
export interface Payment {
  id: string
  amount: number
  currency: string
  paymentMethod: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  transactionId?: string
  paymentGateway?: string
  paidAt?: string
  createdAt: string
  booking?: {
    id: string
    bookingDate: string
    startTime: string
    stationName: string
    stationAddress?: string
  }
}

export interface CreatePaymentRequest {
  bookingId: string
  paymentMethod: 'wallet' | 'card' | 'cash'
  estimatedKwh: number
}

// Wallet types
export interface Wallet {
  id: string
  balance: number
  currency: string
  updatedAt: string
}

export interface WalletTransaction {
  id: string
  type: 'credit' | 'debit'
  amount: number
  balanceAfter: number
  description: string
  relatedEntityType?: string
  relatedEntityId?: string
  createdAt: string
}

export interface TopUpWalletRequest {
  amount: number
  paymentMethod: string
}

// Charging Session types
export interface ChargingSession {
  id: string
  startTime: string
  endTime?: string
  energyConsumed: number
  cost: number
  status: 'active' | 'completed' | 'interrupted'
  startBatteryLevel?: number
  endBatteryLevel?: number
  peakPower?: number
  averagePower?: number
  station: {
    id: string
    name: string
    address?: string
    pricePerKwh?: number
  }
  duration?: number
}

export interface StartSessionRequest {
  bookingId: string
  startBatteryLevel?: number
}

export interface EndSessionRequest {
  endBatteryLevel?: number
  energyConsumed: number
  peakPower?: number
  averagePower?: number
}

export interface ChargingAnalytics {
  totalSessions: number
  totalEnergyConsumed: number
  totalCost: number
  averageEnergyPerSession: number
  averageCostPerSession: number
  totalDuration: number
  mostUsedStation?: {
    stationId: string
    name: string
    count: number
  }
  monthlyBreakdown: Array<{
    year: number
    month: number
    sessions: number
    energyConsumed: number
    cost: number
  }>
}
