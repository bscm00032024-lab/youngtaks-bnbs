import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAdminBookings,
  approveBooking,
  getUnitLocationLinks,
  type BookingWithUnit,
} from '../../lib/queries'
import { signOut } from '../../lib/auth'

const TYPE_LABELS: Record<string, string> = {
  studio: 'Studio',
  '1br': '1 Bedroom',
  '2br': '2 Bedroom',
  '3br': '3 Bedroom',
  other: 'More',
}

function formatDate(value: string): string {
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function toWhatsAppNumber(phone: string): string | null {
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('254') && digits.length === 12) return digits
  if (digits.startsWith('0') && digits.length === 10) return '254' + digits.slice(1)
  if (digits.length === 9 && (digits.startsWith('7') || digits.startsWith('1'))) return '254' + digits
  return null
}

function buildGuestMessage(booking: BookingWithUnit, fallbackLocation: string): string {
  const firstName = (booking.customer_name ?? '').trim().split(' ')[0]
  const stay = booking.unit ? TYPE_LABELS[booking.unit.type] : 'your unit'
  const location = (booking.location_pin && booking.location_pin.trim()) || fallbackLocation
  const lines: string[] = [
    'Hi ' + (firstName || 'there') + ', your YoungTaks BNBs booking is confirmed! ✅',
    '',
    'Stay: ' + stay,
    'Check-in: ' + formatDate(booking.check_in) + ' from 10:00 AM',
    'Check-out: ' + formatDate(booking.check_out) + ' by 10:00 AM',
    '',
  ]
  if (booking.door_code) lines.push('Door code: ' + booking.door_code)
  if (booking.wifi_details) lines.push('WiFi: ' + booking.wifi_details)
  if (location) lines.push('Location: ' + location)
  lines.push('', 'Need anything? Just reply to this message. Welcome!')
  return lines.join('\n')
}

export default function AdminBookingsPage() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<BookingWithUnit[]>([])
  const [locationLinks, setLocationLinks] = useState<Record<string, string>>({})
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
      .then(async (b) => {
        setBookings(b)
        const unitIds = Array.from(
          new Set(b.map((x) => x.unit?.id).filter((id): id is string => !!id))
        )
        try {
          setLocationLinks(await getUnitLocationLinks(unitIds))
        } catch {
          setLocationLinks({})
        }
      })
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

  function savedLinkFor(booking: BookingWithUnit): string {
    if (!booking.unit) return ''
    return locationLinks[booking.unit.id] ?? ''
  }

  function startApproving(booking: BookingWithUnit) {
    setApprovingId(booking.id)
    setWifi('')
    setDoor('')
    setPin('')
  }

  async function handleApprove(booking: BookingWithUnit) {
    const pinToSend = pin.trim() || savedLinkFor(booking)
    if (!wifi.trim() || !door.trim() || !pinToSend) {
      alert('Please fill in WiFi and door code, and add a location pin (or save a location link on the unit first).')
      return
    }
    setSubmitting(true)
    try {
      await approveBooking(booking.id, wifi.trim(), door.trim(), pinToSend)
      setApprovingId(null)
      load()
    } catch {
      alert('Could not approve this booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleSendWhatsApp(booking: BookingWithUnit) {
    const number = toWhatsAppNumber(booking.customer_phone)
    if (!number) {
      alert(
        "This guest's phone number does not look like a Kenyan mobile number (" +
          booking.customer_phone +
          '). Message them manually instead.'
      )
      return
    }
    const message = buildGuestMessage(booking, savedLinkFor(booking))
    window.open('https://wa.me/' + number + '?text=' + encodeURIComponent(message), '_blank', 'noopener')
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

            {booking.status === 'confirmed' && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleSendWhatsApp(booking)}
                  className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-md hover:opacity-90"
                >
                  Send details on WhatsApp
                </button>
                <p className="text-xs text-gray-400 mt-1">
                  Opens WhatsApp with the message ready. Tap Send to deliver it.
                </p>
              </div>
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
                  placeholder={
                    savedLinkFor(booking)
                      ? 'Location pin (leave blank to use the unit’s saved link)'
                      : 'Location pin (link or coordinates)'
                  }
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
                {savedLinkFor(booking) && (
                  <p className="text-xs text-gray-400 break-all">
                    Saved link for this unit: {savedLinkFor(booking)}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(booking)}
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
