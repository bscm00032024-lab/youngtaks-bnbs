import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getLocationById, getUnitsByLocation } from '../lib/queries'
import type { Location, Unit } from '../lib/database.types'
import logo from '../assets/logo.png.png'

const WHATSAPP_URL = 'https://wa.me/254796807457'
const PHONE_DISPLAY = '0796807457'
const HEADING_FONT = "'Archivo', sans-serif"
const BODY_FONT = "'DM Sans', sans-serif"
const RED = '#D62828'

export default function LocationDetailPage() {
  const params = useParams<{ id?: string; locationId?: string }>()
  const resolvedId = params.locationId || params.id

  const [location, setLocation] = useState<Location | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!resolvedId) {
      setError('Location ID not found.')
      setLoading(false)
      return
    }

    Promise.all([getLocationById(resolvedId), getUnitsByLocation(resolvedId)])
      .then(([loc, unitList]) => {
        setLocation(loc)
        setUnits(unitList)
      })
      .catch(() => setError('Could not load location details.'))
      .finally(() => setLoading(false))
  }, [resolvedId])

  return (
    <div className="min-h-screen text-[#111111] selection:bg-[#D62828] selection:text-white" style={{ fontFamily: BODY_FONT, background: '#F4F1EA' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Brutalist Navigation */}
      <nav className="sticky top-0 z-50 bg-[#111111] border-b-2 border-[#111111] text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-10 py-4">
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="bg-white p-1.5 rounded-lg border-2 border-white">
              <img src={logo} alt="YoungTaks BNBs" className="h-10 w-auto object-contain" />
            </div>
            <div>
              <p className="text-lg md:text-xl font-black uppercase tracking-tight" style={{ fontFamily: HEADING_FONT }}>
                YoungTaks <span style={{ color: RED }}>BNBs</span>
              </p>
              <p className="text-[10px] font-bold tracking-widest text-[#D62828] uppercase">Coastal Residences</p>
            </div>
          </Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="text-xs font-black uppercase bg-[#D62828] text-white px-5 py-2.5 rounded-xl border-2 border-[#D62828] shadow-[3px_3px_0px_0px_#ffffff]">
            WhatsApp Concierge
          </a>
        </div>
      </nav>

      {/* Main Split Layout */}
      <main className="max-w-7xl mx-auto px-5 md:px-10 py-12 md:py-20">
        <Link to="/" className="inline-block text-xs font-black uppercase tracking-wider text-[#7A7A7A] hover:text-[#111111] mb-8 bg-white px-4 py-2 rounded-lg border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111] transition-all">
          ← Back to All Destinations
        </Link>

        {loading && <p className="font-black uppercase tracking-widest text-sm text-[#7A7A7A] animate-pulse">Loading destination suites...</p>}
        {error && <div className="p-4 bg-red-100 border-2 border-red-600 text-red-700 font-bold rounded-xl">{error}</div>}
        {!loading && !error && !location && (
          <div className="p-4 bg-red-100 border-2 border-red-600 text-red-700 font-bold rounded-xl">
            This location could not be found.
          </div>
        )}

        {!loading && !error && location && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Left Column: Sticky Destination Info */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 bg-white rounded-2xl border-2 border-[#111111] p-8 shadow-[8px_8px_0px_0px_#111111]">
              <span className="bg-[#111111] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded mb-4 inline-block">
                Selected Destination
              </span>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4" style={{ fontFamily: HEADING_FONT }}>
                {location.name}
              </h1>
              {location.description && (
                <p className="text-base font-medium text-[#5A5A5A] leading-relaxed mb-6">
                  {location.description}
                </p>
              )}

              <div className="pt-6 border-t-2 border-[#E5E3DD] space-y-3 text-xs font-bold uppercase tracking-wider text-[#3A3A3A]">
                <div className="flex items-center gap-2">✓ Check-in from 10:00 AM</div>
                <div className="flex items-center gap-2">✓ Instant M-Pesa Door Code Release</div>
                <div className="flex items-center gap-2">✓ 24/7 Direct Concierge Support</div>
              </div>

              <div className="mt-8 pt-6 border-t-2 border-[#E5E3DD]">
                <p className="text-xs text-[#7A7A7A] uppercase">Prices shown are for the current season and may change.</p>
              </div>
            </div>

            {/* Right Column: Dynamic Unit Tier Cards */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight" style={{ fontFamily: HEADING_FONT }}>
                  Select Unit Type ({units.length})
                </h2>
              </div>

              {units.length === 0 ? (
                <div className="bg-white border-2 border-[#111111] rounded-2xl p-8 text-center shadow-[6px_6px_0px_0px_#111111]">
                  <p className="text-base font-black uppercase mb-2">No units currently available here.</p>
                  <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-block mt-4 text-xs font-black uppercase text-white bg-[#111111] px-6 py-3 rounded-xl border-2 border-[#111111]">
                    Inquire via WhatsApp ({PHONE_DISPLAY})
                  </a>
                </div>
              ) : (
                units.map((unit: Unit) => {
                  const photos: string[] = unit.photos ?? []
                  const videos: string[] = unit.videos ?? []
                  const cover = photos.length > 0 ? photos[0] : null

                  return (
                    <div
                      key={unit.id}
                      className="bg-white rounded-2xl border-2 border-[#111111] overflow-hidden shadow-[6px_6px_0px_0px_#111111] group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#D62828] transition-all"
                    >
                      {cover && (
                        <Link to={`/units/${unit.id}`} className="block relative border-b-2 border-[#111111]">
                          <img src={cover} alt={`${unit.type} suite`} loading="lazy" className="w-full h-52 md:h-64 object-cover" />
                          <div className="absolute bottom-3 left-3 flex gap-2">
                            {photos.length > 1 && (
                              <span className="bg-[#111111] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                                {photos.length} Photos
                              </span>
                            )}
                            {videos.length > 0 && (
                              <span className="text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded" style={{ background: RED }}>
                                Video Tour
                              </span>
                            )}
                          </div>
                        </Link>
                      )}

                      <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-2 flex-grow">
                          <div className="flex items-center gap-3">
                            <span className="bg-[#111111] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                              {unit.type} Suite
                            </span>
                          </div>
                          <p className="text-2xl font-black" style={{ color: RED }}>
                            KES {unit.price.toLocaleString()} <span className="text-xs font-medium text-[#5A5A5A]">/ night</span>
                          </p>
                          <p className="text-sm font-medium text-[#5A5A5A] leading-relaxed">
                            {unit.description || 'Fully furnished private unit equipped with high-speed Wi-Fi, modern kitchenette, and secure parking.'}
                          </p>

                          {unit.amenities && unit.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {unit.amenities.map((amenity: string, idx: number) => (
                                <span key={idx} className="bg-[#F4F1EA] border border-[#111111] text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="sm:self-center flex-shrink-0">
                          <Link
                            to={`/units/${unit.id}`}
                            className="block text-center text-xs font-black uppercase text-white bg-[#111111] px-6 py-4 rounded-xl border-2 border-[#111111] shadow-[3px_3px_0px_0px_#D62828] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all whitespace-nowrap"
                          >
                            Book Suite →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
