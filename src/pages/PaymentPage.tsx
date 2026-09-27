import { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getBookingById, submitMpesaCode } from '../lib/queries'
import type { Booking } from '../lib/database.types'

const WHATSAPP_LINK = 'https://wa.me/254796807457'

interface PaymentState {
  total?: number
}

export default function PaymentPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const location = useLocation()
  const state = location.state as PaymentState | null

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [mpesaCode, setMpesaCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    if (!bookingId) return
    getBookingById(bookingId)
      .then(setBooking)
      .finally(() => setLoading(false))
  }, [bookingId])

  useEffect(() => {
    if (!bookingId) return
    if (!booking || booking.status === 'pending_payment') return

    const channel = supabase
      .channel('booking-' + bookingId)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: 'id=eq.' + bookingId,
        },
        (payload) => {
          setBooking(payload.new as Booking)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [bookingId, booking?.status])

  useEffect(() => {
    if (booking?.status !== 'payment_submitted') return
    const timer = setTimeout(() => setShowFallback(true), 3 * 60 * 1000)
    return () => clearTimeout(timer)
  }, [booking?.status])

  async function handleSubmitCode(e: React.FormEvent) {
    e.preventDefault()
    if (!bookingId || !mpesaCode.trim()) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const updated = await submitMpesaCode(bookingId, mpesaCode.trim())
      setBooking(updated)
    } catch {
      setSubmitError('Could not submit your code. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="p-4 text-gray-500">Loading...</p>
  }

  if (!booking) {
    return <p className="p-4 text-red-600">Booking not found.</p>
  }

  if (booking.status === 'pending_payment') {
    return (
      <div className="p-4 max-w-md">
        <h2 className="text-lg font-semibold mb-1">Complete your payment</h2>
        {state?.total !== undefined && (
          <p className="text-brand-red font-semibold mb-4">
            Amount due: KES {state.total.toLocaleString()}
          </p>
        )}

        <div className="border border-gray-200 rounded-lg p-4 space-y-2 text-sm">
          <p><span className="font-semibold">Send Money:</span> 0796807457, Siwa Benson Ogilo</p>
          <p><span className="font-semibold">Paybill:</span> 247247</p>
          <p><span className="font-semibold">Account:</span> 1180177539458</p>
        </div>

        <form onSubmit={handleSubmitCode} className="mt-6 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">M-Pesa transaction code</label>
            <input
              type="text"
              value={mpesaCode}
              onChange={(e) => setMpesaCode(e.target.value)}
              placeholder="e.g. QAB1C2D3E4"
              className="w-full border border-gray-300 rounded-md p-2 uppercase"
            />
          </div>
          {submitError && <p className="text-sm text-red-600">{submitError}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-red text-white font-semibold py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Paid, submit code'}
          </button>
        </form>
      </div>
    )
  }

  if (booking.status === 'payment_submitted') {
    return (
      <div className="p-4 max-w-md">
        <h2 className="text-lg font-semibold mb-2">Confirming your payment...</h2>
        <p className="text-gray-500 text-sm">
          We are checking your M-Pesa code against our records. This usually only takes a moment, hang tight.
        </p>
        <div className="mt-6 flex justify-center">
          <div className="h-8 w-8 border-4 border-gray-200 border-t-brand-red rounded-full animate-spin"></div>
        </div>
        {showFallback && (
          <p className="text-sm text-gray-600 mt-6 text-center">
            Taking a little longer than usual? Message us directly on WhatsApp:{' '}
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="text-brand-red font-semibold hover:underline">Chat now</a>
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 max-w-md">
      <h2 className="text-lg font-semibold text-brand-red mb-1">Booking confirmed!</h2>
      <p className="text-sm text-gray-500 mb-4">
        Here are your check-in details. We have also sent these to your phone via WhatsApp.
      </p>
      <div className="border border-gray-200 rounded-lg p-4 space-y-3 text-sm">
        {booking.location_pin && (
          <p><span className="font-semibold">Location:</span> {booking.location_pin}</p>
        )}
        {booking.wifi_details && (
          <p><span className="font-semibold">WiFi:</span> {booking.wifi_details}</p>
        )}
        {booking.door_code && (
          <p><span className="font-semibold">Door code:</span> {booking.door_code}</p>
        )}
        <p>
          <span className="font-semibold">Need help?</span>{' '}
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">Message us on WhatsApp</a>
        </p>
      </div>
    </div>
  )
}
