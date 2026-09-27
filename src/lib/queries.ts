import type { Booking } from './database.types'

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
