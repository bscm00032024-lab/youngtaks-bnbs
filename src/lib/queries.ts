import { supabase } from './supabase'
import type { Location, Unit, Booking } from './database.types'

export async function getActiveLocations(): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('active', true)
    .order('name')

  if (error) throw error
  return data ?? []
}

export async function getLocationById(id: string): Promise<Location | null> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getUnitsByLocation(locationId: string): Promise<Unit[]> {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('location_id', locationId)
    .order('price')

  if (error) throw error
  return data ?? []
}

export async function getUnitById(id: string): Promise<Unit | null> {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
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
      ...booking,
      status: 'pending_payment',
      mpesa_code: null,
      wifi_details: null,
      door_code: null,
      location_pin: null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function submitMpesaCode(bookingId: string, mpesaCode: string): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'payment_submitted', mpesa_code: mpesaCode })
    .eq('id', bookingId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}
