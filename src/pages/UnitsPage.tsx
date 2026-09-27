import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getLocationById, getUnitsByLocation } from '../lib/queries'
import type { Location, Unit, UnitType } from '../lib/database.types'

const TYPE_LABELS: Record<UnitType, string> = {
  studio: 'Studio',
  '1br': '1 Bedroom',
  '2br': '2 Bedroom',
  '3br': '3 Bedroom',
  other: 'More',
}

const TYPE_ORDER: UnitType[] = ['studio', '1br', '2br', '3br', 'other']

export default function UnitsPage() {
  const { locationId } = useParams<{ locationId: string }>()
  const [location, setLocation] = useState<Location | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!locationId) return
    Promise.all([getLocationById(locationId), getUnitsByLocation(locationId)])
      .then(([loc, units]) => {
        setLocation(loc)
        setUnits(units)
      })
      .catch(() => setError('Could not load units. Please try again.'))
      .finally(() => setLoading(false))
  }, [locationId])

  if (loading) {
    return <p className="p-4 text-gray-500">Loading units...</p>
  }

  if (error) {
    return <p className="p-4 text-red-600">{error}</p>
  }

  if (!location) {
    return <p className="p-4 text-red-600">Location not found.</p>
  }

  const unitsByType = TYPE_ORDER.map((type) => ({
    type,
    units: units.filter((u) => u.type === type),
  })).filter((group) => group.units.length > 0)

  return (
    <div className="p-4">
      <Link to="/" className="text-sm text-brand-red hover:underline">
        ← All locations
      </Link>
      <h2 className="text-lg font-semibold mt-2 mb-1">{location.name}</h2>
      {location.description && (
        <p className="text-sm text-gray-500 mb-4">{location.description}</p>
      )}

      {unitsByType.length === 0 && (
        <p className="text-gray-500 mt-4">No units available here yet.</p>
      )}

      {unitsByType.map(({ type, units }) => (
        <div key={type} className="mb-6">
          <h3 className="font-semibold text-brand-black mb-2">{TYPE_LABELS[type]}</h3>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {units.map((unit) => (
              <Link
                key={unit.id}
                to={`/units/${unit.id}`}
                className="block border border-gray-200 rounded-lg p-4 hover:border-brand-red transition-colors"
              >
                <p className="font-semibold text-brand-red">
                  KES {unit.price.toLocaleString()}
                </p>
                {unit.description && (
                  <p className="text-sm text-gray-500 mt-1">{unit.description}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}

      <p className="text-xs text-gray-400 mt-6">
        Prices shown are for the current season and may change.
      </p>
    </div>
  )
}
