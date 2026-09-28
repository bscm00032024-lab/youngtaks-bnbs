import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getUnitsByLocation,
  getLocationById,
  createUnit,
  updateUnit,
  deleteUnit,
  uploadUnitMedia,
  getUnitLocationLinks,
  saveUnitLocationLink,
} from '../../lib/queries'
import type { Location, Unit, UnitType } from '../../lib/database.types'

const TYPE_OPTIONS: UnitType[] = ['studio', '1br', '2br', '3br', 'other']
const TYPE_LABELS: Record<UnitType, string> = {
  studio: 'Studio',
  '1br': '1 Bedroom',
  '2br': '2 Bedroom',
  '3br': '3 Bedroom',
  other: 'More',
}

export default function AdminLocationUnitsPage() {
  const { locationId } = useParams<{ locationId: string }>()
  const navigate = useNavigate()

  const [location, setLocation] = useState<Location | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [locationLinks, setLocationLinks] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newType, setNewType] = useState<UnitType>('studio')
  const [newPrice, setNewPrice] = useState('')
  const [newAmenities, setNewAmenities] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newLocationLink, setNewLocationLink] = useState('')
  const [creating, setCreating] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editType, setEditType] = useState<UnitType>('studio')
  const [editPrice, setEditPrice] = useState('')
  const [editAmenities, setEditAmenities] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editLocationLink, setEditLocationLink] = useState('')
  const [saving, setSaving] = useState(false)

  const [uploadingId, setUploadingId] = useState<string | null>(null)

  function load() {
    if (!locationId) return
    setLoading(true)
    Promise.all([getUnitsByLocation(locationId), getLocationById(locationId)])
      .then(async ([u, loc]) => {
        setUnits(u)
        setLocation(loc)
        try {
          setLocationLinks(await getUnitLocationLinks(u.map((x) => x.id)))
        } catch {
          setLocationLinks({})
        }
      })
      .catch(() => setError('Could not load units for this location.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!locationId) return
    const priceNum = parseFloat(newPrice)
    if (isNaN(priceNum)) {
      alert('Please enter a valid price.')
      return
    }
    setCreating(true)
    try {
      const created = await createUnit({
        location_id: locationId,
        type: newType,
        price: priceNum,
        amenities: newAmenities.split(',').map((a) => a.trim()).filter(Boolean),
        description: newDescription.trim() || null,
      })
      if (newLocationLink.trim()) {
        try {
          await saveUnitLocationLink(created.id, newLocationLink)
        } catch {
          alert('The unit was created, but the location link could not be saved. Make sure the database step was run, then edit the unit and add the link again.')
        }
      }
      setNewPrice('')
      setNewAmenities('')
      setNewDescription('')
      setNewLocationLink('')
      load()
    } catch {
      alert('Could not create unit.')
    } finally {
      setCreating(false)
    }
  }

  function startEdit(unit: Unit) {
    setEditingId(unit.id)
    setEditType(unit.type)
    setEditPrice(String(unit.price))
    setEditAmenities(unit.amenities.join(', '))
    setEditDescription(unit.description ?? '')
    setEditLocationLink(locationLinks[unit.id] ?? '')
  }

  async function handleSaveEdit(id: string) {
    const priceNum = parseFloat(editPrice)
    if (isNaN(priceNum)) {
      alert('Please enter a valid price.')
      return
    }
    setSaving(true)
    try {
      await updateUnit(id, {
        type: editType,
        price: priceNum,
        amenities: editAmenities.split(',').map((a) => a.trim()).filter(Boolean),
        description: editDescription.trim() || null,
      })
      try {
        await saveUnitLocationLink(id, editLocationLink)
      } catch {
        alert('Unit details were saved, but the location link could not be saved. Make sure the database step was run.')
      }
      setEditingId(null)
      load()
    } catch {
      alert('Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this unit? This cannot be undone.')) return
    try {
      await deleteUnit(id)
      load()
    } catch {
      alert('Could not delete unit. It may have existing bookings.')
    }
  }

  async function handleFileUpload(unit: Unit, files: FileList | null, kind: 'photos' | 'videos') {
    if (!files || files.length === 0) return
    setUploadingId(unit.id)
    try {
      const uploadedUrls: string[] = []
      for (const file of Array.from(files)) {
        const url = await uploadUnitMedia(file, unit.id)
        uploadedUrls.push(url)
      }
      const existing = kind === 'photos' ? unit.photos : unit.videos
      await updateUnit(unit.id, { [kind]: [...existing, ...uploadedUrls] })
      load()
    } catch {
      alert('Upload failed. Please try again.')
    } finally {
      setUploadingId(null)
    }
  }

  async function handleRemoveMedia(unit: Unit, url: string, kind: 'photos' | 'videos') {
    const existing = kind === 'photos' ? unit.photos : unit.videos
    try {
      await updateUnit(unit.id, { [kind]: existing.filter((u) => u !== url) })
      load()
    } catch {
      alert('Could not remove media.')
    }
  }

  if (loading) return <p className="p-4 text-gray-500">Loading units...</p>
  if (error) return <p className="p-4 text-red-600">{error}</p>

  return (
    <div className="p-4 max-w-3xl">
      <button onClick={() => navigate('/admin/locations')} className="text-sm text-brand-red hover:underline mb-2">
        ← Back to locations
      </button>
      <h2 className="text-lg font-semibold mb-1">{location?.name ?? 'Units'}</h2>
      <p className="text-sm text-gray-500 mb-4">Managing units for this location only.</p>

      <form onSubmit={handleCreate} className="border border-gray-200 rounded-lg p-4 mb-6 space-y-2">
        <p className="font-semibold text-sm">Add a new unit here</p>
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value as UnitType)}
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Price per night (KES)"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
        />
        <input
          type="text"
          placeholder="Amenities, comma separated"
          value={newAmenities}
          onChange={(e) => setNewAmenities(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
        />
        <textarea
          placeholder="Description (optional)"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
          rows={2}
        />
        <input
          type="text"
          placeholder="Location link (Google Maps) - private"
          value={newLocationLink}
          onChange={(e) => setNewLocationLink(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
        />
        <p className="text-xs text-gray-400">
          The location link is never shown on the public site. Guests only see it after their payment is confirmed.
        </p>
        <button
          type="submit"
          disabled={creating}
          className="bg-brand-red text-white text-sm font-semibold px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {creating ? 'Adding...' : 'Add unit'}
        </button>
      </form>

      {units.length === 0 && <p className="text-sm text-gray-400">No units yet for this location.</p>}

      <div className="space-y-4">
        {units.map((unit) => (
          <div key={unit.id} className="border border-gray-200 rounded-lg p-4">
            {editingId === unit.id ? (
              <div className="space-y-2">
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as UnitType)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                >
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
                <input
                  type="text"
                  value={editAmenities}
                  onChange={(e) => setEditAmenities(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  rows={2}
                />
                <input
                  type="text"
                  placeholder="Location link (Google Maps) - private"
                  value={editLocationLink}
                  onChange={(e) => setEditLocationLink(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(unit.id)}
                    disabled={saving}
                    className="bg-brand-red text-white text-sm font-semibold px-3 py-1.5 rounded-md hover:opacity-90"
                  >
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-sm text-gray-500 px-3 py-1.5">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{TYPE_LABELS[unit.type]}</p>
                  <p className="text-brand-red font-semibold text-sm">KES {unit.price.toLocaleString()} / night</p>
                  {unit.description && <p className="text-sm text-gray-500 mt-1">{unit.description}</p>}
                  {unit.amenities.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">{unit.amenities.join(', ')}</p>
                  )}
                  <p className="text-xs mt-1">
                    <span className="font-semibold text-gray-500">Private location link:</span>{' '}
                    {locationLinks[unit.id] ? (
                      <span className="text-gray-600 break-all">{locationLinks[unit.id]}</span>
                    ) : (
                      <span className="text-gray-400">not set</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-3 text-sm">
                  <button onClick={() => startEdit(unit)} className="text-brand-red hover:underline">Edit</button>
                  <button onClick={() => handleDelete(unit.id)} className="text-gray-400 hover:underline">Delete</button>
                </div>
              </div>
            )}

            <div className="mt-3 border-t border-gray-100 pt-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">Photos</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {unit.photos.map((url) => (
                  <div key={url} className="relative">
                    <img src={url} alt="" className="h-16 w-16 object-cover rounded-md" />
                    <button
                      onClick={() => handleRemoveMedia(unit, url, 'photos')}
                      className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploadingId === unit.id}
                onChange={(e) => handleFileUpload(unit, e.target.files, 'photos')}
                className="text-xs"
              />
            </div>

            <div className="mt-3 border-t border-gray-100 pt-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">Videos</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {unit.videos.map((url) => (
                  <div key={url} className="relative">
                    <video src={url} className="h-16 w-24 object-cover rounded-md" />
                    <button
                      onClick={() => handleRemoveMedia(unit, url, 'videos')}
                      className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="video/*"
                multiple
                disabled={uploadingId === unit.id}
                onChange={(e) => handleFileUpload(unit, e.target.files, 'videos')}
                className="text-xs"
              />
            </div>

            {uploadingId === unit.id && <p className="text-xs text-gray-400 mt-2">Uploading...</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
