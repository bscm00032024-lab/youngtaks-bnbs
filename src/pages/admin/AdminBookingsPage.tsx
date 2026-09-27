import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminBookings, approveBooking, type BookingWithUnit } from '../../lib/queries'
import { signOut } from '../../lib/auth'

const TYPE_LABELS: Record<string, string> = {
  studio: 'Studio',
  '1br': '1 Bedroom',
  '2br': '2 Bedroom',
  '3br': '3 Bedroom',
  other: 'More',
}

export default function AdminBookingsPage() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<BookingWithUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [wifi, setWifi] = useState('')
  const [door, setDoor] = useState('')
  const [pin, setPin] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function load() {
    setLoading(true)
    getAdminBookings()
      .then(setBookings)
      .catch(() => setError('Could not load bookings.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSignOut() {
    await signOut()
    navigate('/admin/login')
  }

  function startApproving(booking: BookingWithUnit) {
    setApprovingId(booking.id)
    setWifi('')
    setDoor('')
    setPin('')
  }

  async function handleApprove(bookingId: string) {
    if (!wifi.trim() || !door.trim() || !pin.trim()) {
      alert('Please fill in WiFi, door code, and location pin before approving.')
      return
    }
    setSubmitting(true)
    try {
      await approveBooking(bookingId, wifi.trim(), door.trim(), pin.trim())
      setApprovingId(null)
      load()
    } catch {
      alert('Could not approve this booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="p-4 text-gray-500">Loading bookings...</p>
  if (error) return <p className="p-4 text-red-600">{error}</p>

  const actionable = bookings.filter((b) => b.status !== 'pending_payment')

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Bookings</h2>
        <button onClick={handleSignOut} className="text-sm text-gray-500 hover:underline">
          Sign out
        </button>
      </div>

      {actionable.length === 0 && (
        <p className="text-gray-500">No bookings awaiting action.</p>
      )}

      <div className="space-y-4">
        {actionable.map((booking) => (
          <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">
                  {booking.unit ? TYPE_LABELS[booking.unit.type] : 'Unit'} — KES{' '}
                  {booking.unit?.price.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  {booking.customer_name} — {booking.customer_phone}
                </p>
                <p className="text-sm text-gray-500">
                  {booking.check_in} to {booking.check_out}
                </p>
                {booking.mpesa_code && (
                  <p className="text-sm mt-1">
                    <span className="font-semibold">M-Pesa code:</span> {booking.mpesa_code}
                  </p>
                )}
              </div>
              <span
                className={
                  'text-xs font-semibold px-2 py-1 rounded ' +
                  (booking.status === 'confirmed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700')
                }
              >
                {booking.status}
              </span>
            </div>

            {booking.status === 'payment_submitted' && approvingId !== booking.id && (
              <button
                onClick={() => startApproving(booking)}
                className="mt-3 bg-brand-red text-white text-sm font-semibold px-4 py-2 rounded-md hover:opacity-90"
              >
                Approve
              </button>
            )}

            {approvingId === booking.id && (
              <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                <input
                  type="text"
                  placeholder="WiFi details"
                  value={wifi}
                  onChange={(e) => setWifi(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Door code"
                  value={door}
                  onChange={(e) => setDoor(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Location pin (link or coordinates)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(booking.id)}
                    disabled={submitting}
                    className="bg-brand-red text-white text-sm font-semibold px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
                  >
                    {submitting ? 'Approving...' : 'Confirm approval'}
                  </button>
                  <button
                    onClick={() => setApprovingId(null)}
                    className="text-sm text-gray-500 px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
