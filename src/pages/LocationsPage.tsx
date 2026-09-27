import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getActiveLocations } from '../lib/queries'
import type { Location } from '../lib/database.types'

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getActiveLocations()
      .then(setLocations)
      .catch(() => setError('Could not load locations. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="p-4 text-gray-500">Loading locations...</p>
  }

  if (error) {
    return <p className="p-4 text-red-600">{error}</p>
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Choose a location</h2>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {locations.map((location) => (
          <Link
            key={location.id}
            to={`/locations/${location.id}`}
            className="block border border-gray-200 rounded-lg p-4 hover:border-brand-red transition-colors"
          >
            <h3 className="font-semibold text-brand-black">{location.name}</h3>
            {location.description && (
              <p className="text-sm text-gray-500 mt-1">{location.description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
