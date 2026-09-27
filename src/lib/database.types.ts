export type UnitType = 'studio' | '1br' | '2br' | '3br' | 'other'
export type BookingStatus = 'pending_payment' | 'payment_submitted' | 'confirmed'

export interface Location {
  id: string
  name: string
  description: string | null
  active: boolean
  created_at: string
}

export interface Unit {
  id: string
  location_id: string
  type: UnitType
  price: number
  amenities: string[]
  description: string | null
  photos: string[]
  videos: string[]
  created_at: string
}

export interface Booking {
  id: string
  unit_id: string
  check_in: string
  check_out: string
  customer_name: string
  customer_phone: string
  status: BookingStatus
  mpesa_code: string | null
  wifi_details: string | null
  door_code: string | null
  location_pin: string | null
  created_at: string
  confirmed_at: string | null
}

export interface BlogPost {
  id: string
  title: string
  content: string
  author: string
  published: boolean
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      locations: {
        Row: Location
        Insert: Omit<Location, 'id' | 'created_at'>
        Update: Partial<Omit<Location, 'id' | 'created_at'>>
        Relationships: []
      }
      units: {
        Row: Unit
        Insert: Omit<Unit, 'id' | 'created_at'>
        Update: Partial<Omit<Unit, 'id' | 'created_at'>>
        Relationships: []
      }
      bookings: {
        Row: Booking
        Insert: Omit<Booking, 'id' | 'created_at' | 'confirmed_at'>
        Update: Partial<Omit<Booking, 'id' | 'created_at'>>
        Relationships: []
      }
      blog_posts: {
        Row: BlogPost
        Insert: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BlogPost, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
