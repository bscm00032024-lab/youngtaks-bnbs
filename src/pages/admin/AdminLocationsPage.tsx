import { useEffect, useState } from 'react'
import {
  getAllLocationsAdmin,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../../lib/queries'
import type { Location } from '../../lib/database.types'

export default function AdminLocationsPage() {
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

  if (loading) return <p className="p-4 text-gray-500">Loading locations...</p>
  if (error) return <p className="p-4 text-red-600">{error}</p>

  return (
    <div className="p-4 max-w-2xl">
      <h2 className="text-lg font-semibold mb-4">Locations</h2>

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
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{location.name}</p>
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
                <div className="flex gap-3 text-sm">
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
