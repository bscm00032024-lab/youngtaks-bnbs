import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getUnitById, getLocationById } from '../lib/queries'
import type { Unit, Location, UnitType } from '../lib/database.types'

const TYPE_LABELS: Record<UnitType, string> = {
  studio: 'Studio',
  '1br': '1 Bedroom',
  '2br': '2 Bedroom',
  '3br': '3 Bedroom',
  other: 'More',
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const inDate = new Date(checkIn)
  const outDate = new Date(checkOut)
  const diff = outDate.getTime() - inDate.getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

export default function UnitDetailPage() {
  const { unitId } = useParams<{ unitId: string }>()
  const navigate = useNavigate()
  const [unit, setUnit] = useState<Unit | null>(null)
  const [location, setLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!unitId) return
    getUnitById(unitId)
      .then(async (u) => {
        setUnit(u)
        if (u) {
          const loc = await getLocationById(u.location_id)
          setLocation(loc)
        }
      })
      .catch(() => setError('Could not load this unit. Please try again.'))
      .finally(() => setLoading(false))
  }, [unitId])

  if (loading) return <p className="p-4 text-gray-500">Loading unit...</p>
  if (error) return <p className="p-4 text-red-600">{error}</p>
  if (!unit) return <p className="p-4 text-red-600">Unit not found.</p>

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0
  const total = nights > 0 ? nights * unit.price : 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!checkIn || !checkOut) {
      setFormError('Please select both check-in and check-out dates.')
      return
    }
    if (nights <= 0) {
      setFormError('Check-out must be after check-in.')
      return
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setFormError('Please provide your name and phone number.')
      return
    }

    // Booking creation happens on the next page/step — pass details via navigation state
    navigate('/booking/confirm', {
      state: {
        unitId: unit.id,
        checkIn,
        checkOut,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        total,
      },
    })
  }

  return (
    <div className="p-4 max-w-md">
      {location && (
        <Link to={`/locations/${location.id}`} className="text-sm text-brand-red hover:underline">
          ← {location.name}
        </Link>
      )}
      <h2 className="text-lg font-semibold mt-2">{TYPE_LABELS[unit.type]}</h2>
      <p className="text-brand-red font-semibold">KES {unit.price.toLocaleString()} / night</p>
      {unit.description && <p className="text-sm text-gray-500 mt-1">{unit.description}</p>}
      <p className="text-xs text-gray-400 mt-1">Prices shown are for the current season and may change.</p>

      {unit.amenities.length > 0 && (
        <ul className="text-sm text-gray-600 mt-3 list-disc list-inside">
          {unit.amenities.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Check-in (10:00 AM)</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Check-out (10:00 AM)</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {nights > 0 && (
          <p className="text-sm text-gray-600">
            {nights} night{nights > 1 ? 's' : ''} × KES {unit.price.toLocaleString()} ={' '}
            <span className="font-semibold text-brand-black">KES {total.toLocaleString()}</span>
          </p>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Your name</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone number</label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="07XXXXXXXX"
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <button
          type="submit"
          className="w-full bg-brand-red text-white font-semibold py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          Book now
        </button>
      </form>
    </div>
  )
}
