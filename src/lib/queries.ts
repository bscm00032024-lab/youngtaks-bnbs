import { supabase } from './supabase'
import type { Location, Unit, Booking, UnitType, BlogPost } from './database.types'

export async function getActiveLocations(): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('active', true)
    .order('name')

  if (error) throw error
  return (data ?? []) as Location[]
}

export async function getLocationById(id: string): Promise<Location | null> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Location
}

export async function getUnitsByLocation(locationId: string): Promise<Unit[]> {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('location_id', locationId)
    .order('price')

  if (error) throw error
  return (data ?? []) as Unit[]
}

export async function getUnitById(id: string): Promise<Unit | null> {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Unit
}

export async function createBooking(booking: {
  unit_id: string
  check_in: string
  check_out: string
  customer_name: string
  customer_phone: string
}): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      unit_id: booking.unit_id,
      check_in: booking.check_in,
      check_out: booking.check_out,
      customer_name: booking.customer_name,
      customer_phone: booking.customer_phone,
      status: 'pending_payment',
      mpesa_code: null,
      wifi_details: null,
      door_code: null,
      location_pin: null,
    })
    .select()
    .single()

  if (error) throw error
  return data as Booking
}

export async function submitMpesaCode(bookingId: string, mpesaCode: string): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'payment_submitted', mpesa_code: mpesaCode })
    .eq('id', bookingId)
    .select()
    .single()

  if (error) throw error
  return data as Booking
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Booking
}

export interface BookingWithUnit extends Booking {
  unit: Unit | null
}

export async function getAdminBookings(): Promise<BookingWithUnit[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, unit:units(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as BookingWithUnit[]
}

export async function approveBooking(
  bookingId: string,
  wifiDetails: string,
  doorCode: string,
  locationPin: string
): Promise<Booking> {
  const { data, error } = await supabase.rpc('approve_booking', {
    p_booking_id: bookingId,
    p_wifi_details: wifiDetails,
    p_door_code: doorCode,
    p_location_pin: locationPin,
  })

  if (error) throw error
  return data as Booking
}

export async function getAllLocationsAdmin(): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('name')

  if (error) throw error
  return (data ?? []) as Location[]
}

export async function createLocation(location: {
  name: string
  description: string | null
}): Promise<Location> {
  const { data, error } = await supabase
    .from('locations')
    .insert({ name: location.name, description: location.description, active: true })
    .select()
    .single()

  if (error) throw error
  return data as Location
}

export async function updateLocation(
  id: string,
  updates: { name?: string; description?: string | null; active?: boolean }
): Promise<Location> {
  const { data, error } = await supabase
    .from('locations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Location
}

export async function deleteLocation(id: string): Promise<void> {
  const { error } = await supabase.from('locations').delete().eq('id', id)
  if (error) throw error
}

export interface UnitWithLocation extends Unit {
  location: Location | null
}

export async function getAllUnitsAdmin(): Promise<UnitWithLocation[]> {
  const { data, error } = await supabase
    .from('units')
    .select('*, location:locations(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as UnitWithLocation[]
}

export async function createUnit(unit: {
  location_id: string
  type: UnitType
  price: number
  amenities: string[]
  description: string | null
}): Promise<Unit> {
  const { data, error } = await supabase
    .from('units')
    .insert({
      location_id: unit.location_id,
      type: unit.type,
      price: unit.price,
      amenities: unit.amenities,
      description: unit.description,
      photos: [],
      videos: [],
    })
    .select()
    .single()

  if (error) throw error
  return data as Unit
}

export async function updateUnit(
  id: string,
  updates: Partial<{
    location_id: string
    type: UnitType
    price: number
    amenities: string[]
    description: string | null
    photos: string[]
    videos: string[]
  }>
): Promise<Unit> {
  const { data, error } = await supabase
    .from('units')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Unit
}

export async function deleteUnit(id: string): Promise<void> {
  const { error } = await supabase.from('units').delete().eq('id', id)
  if (error) throw error
}

export async function uploadUnitMedia(file: File, unitId: string): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = unitId + '/' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + fileExt

  const { error } = await supabase.storage.from('unit-media').upload(fileName, file)
  if (error) throw error

  const { data } = supabase.storage.from('unit-media').getPublicUrl(fileName)
  return data.publicUrl
}

export async function getAllBlogPostsAdmin(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as BlogPost[]
}

export async function createBlogPost(post: {
  title: string
  content: string
  author: string
  published: boolean
}): Promise<BlogPost> {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title: post.title,
      content: post.content,
      author: post.author,
      published: post.published,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data as BlogPost
}

export async function updateBlogPost(
  id: string,
  updates: Partial<{ title: string; content: string; author: string; published: boolean }>
): Promise<BlogPost> {
  const { data, error } = await supabase
    .from('blog_posts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as BlogPost
}

export async function deleteBlogPost(id: string): Promise<void> {
  const { error } = await supabase.from('blog_posts').delete().eq('id', id)
  if (error) throw error
}
