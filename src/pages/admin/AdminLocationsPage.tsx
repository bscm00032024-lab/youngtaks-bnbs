import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAllLocationsAdmin,
  createLocation,
  updateLocation,
  deleteLocation,
  uploadLocationImage,
} from '../../lib/queries'
import type { Location } from '../../lib/database.types'

export default function AdminLocationsPage() {
  const navigate = useNavigate()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const [photoBusyId, setPhotoBusyId] = useState<string | null>(null)

  function load() {
    setLoading(true)
    getAllLocationsAdmin()
      .then(setLocations)
      .catch(() => setError('Could not load locations.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      await createLocation({ name: newName.trim(), description: newDescription.trim() || null })
      setNewName('')
      setNewDescription('')
      load()
    } catch {
      alert('Could not create location.')
    } finally {
      setCreating(false)
    }
  }

  function startEdit(location: Location) {
    setEditingId(location.id)
    setEditName(location.name)
    setEditDescription(location.description ?? '')
  }

  async function handleSaveEdit(id: string) {
    setSaving(true)
    try {
      await updateLocation(id, { name: editName.trim(), description: editDescription.trim() || null })
      setEditingId(null)
      load()
    } catch {
      alert('Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(location: Location) {
    try {
      await updateLocation(location.id, { active: !location.active })
      load()
    } catch {
      alert('Could not update location.')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this location? This cannot be undone. Units under it may be affected.')) return
    try {
      await deleteLocation(id)
      load()
    } catch {
      alert('Could not delete location. It may still have units attached.')
    }
  }

  async function handlePhotoUpload(location: Location, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoBusyId(location.id)
    try {
      const url = await uploadLocationImage(file, location.id)
      await updateLocation(location.id, { image_url: url })
      load()
    } catch {
      alert('Could not upload the photo. Please try again.')
    } finally {
      setPhotoBusyId(null)
      e.target.value = ''
    }
  }

  async function handlePhotoRemove(location: Location) {
    if (!confirm('Remove this location photo?')) return
    setPhotoBusyId(location.id)
    try {
      await updateLocation(location.id, { image_url: null })
      load()
    } catch {
      alert('Could not remove the photo.')
    } finally {
      setPhotoBusyId(null)
    }
  }

  if (loading) return <p className="p-4 text-gray-500">Loading locations...</p>
  if (error) return <p className="p-4 text-red-600">{error}</p>

  return (
    <div className="p-4 max-w-3xl">
      <h2 className="text-lg font-semibold mb-4">Locations</h2>
      <p className="text-sm text-gray-500 mb-4">
        Click a location to view and manage its units. The photo you add here shows on the homepage card.
      </p>

      <form onSubmit={handleCreate} className="border border-gray-200 rounded-lg p-4 mb-6 space-y-2">
        <p className="font-semibold text-sm">Add a new location</p>
        <input
          type="text"
          placeholder="Location name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 text-sm"
        />
        <button
          type="submit"
          disabled={creating}
          className="bg-brand-red text-white text-sm font-semibold px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {creating ? 'Adding...' : 'Add location'}
        </button>
      </form>

      <div className="space-y-3">
        {locations.map((location) => (
          <div key={location.id} className="border border-gray-200 rounded-lg p-4">
            {editingId === location.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(location.id)}
                    disabled={saving}
                    className="bg-brand-red text-white text-sm font-semibold px-3 py-1.5 rounded-md hover:opacity-90"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-sm text-gray-500 px-3 py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start gap-3">
                <div
                  className="cursor-pointer flex-1 flex gap-3"
                  onClick={() => navigate(`/admin/locations/${location.id}/units`)}
                >
                  {location.image_url ? (
                    <img
                      src={location.image_url}
                      alt={location.name}
                      className="w-20 h-20 rounded-md object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-md bg-gray-100 text-gray-400 text-[11px] flex items-center justify-center text-center flex-shrink-0">
                      No photo
                    </div>
                  )}
                  <div>
                    <p className="font-semibold hover:underline">{location.name}</p>
                    {location.description && (
                      <p className="text-sm text-gray-500">{location.description}</p>
                    )}
                    <span
                      className={
                        'text-xs font-semibold px-2 py-0.5 rounded inline-block mt-1 ' +
                        (location.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600')
                      }
                    >
                      {location.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div
                  className="flex flex-wrap justify-end gap-x-3 gap-y-1 text-sm max-w-[13rem]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <label className="text-brand-red hover:underline cursor-pointer">
                    {photoBusyId === location.id
                      ? 'Uploading...'
                      : location.image_url
                        ? 'Change photo'
                        : 'Add photo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={photoBusyId === location.id}
                      onChange={(e) => handlePhotoUpload(location, e)}
                    />
                  </label>
                  {location.image_url && (
                    <button
                      onClick={() => handlePhotoRemove(location)}
                      disabled={photoBusyId === location.id}
                      className="text-gray-500 hover:underline"
                    >
                      Remove photo
                    </button>
                  )}
                  <button onClick={() => startEdit(location)} className="text-brand-red hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleToggleActive(location)} className="text-gray-500 hover:underline">
                    {location.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => handleDelete(location.id)} className="text-gray-400 hover:underline">
                    Delete
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
