import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getUnitById, getLocationById } from '../lib/queries'
import type { Unit, Location, UnitType } from '../lib/database.types'
import logo from '../assets/logo.png.png'

const WHATSAPP_URL = 'https://wa.me/254796807457'
const HEADING_FONT = "'Archivo', sans-serif"
const BODY_FONT = "'DM Sans', sans-serif"
const RED = '#D62828'
const INK = '#111111'

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
  const [activePhoto, setActivePhoto] = useState(0)

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

  if (loading) {
    return <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center font-black uppercase tracking-widest text-sm text-[#7A7A7A]">Loading unit details...</div>
  }

  if (error) {
    return <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center font-bold text-red-600">{error}</div>
  }

  if (!unit) {
    return <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center font-bold text-red-600">Unit not found.</div>
  }

  const photos: string[] = unit.photos ?? []
  const videos: string[] = unit.videos ?? []
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

    navigate('/booking/confirm', {
      state: {
        unitId: unit!.id,
        checkIn,
        checkOut,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        total,
      },
    })
  }

  return (
    <div className="min-h-screen text-[#111111] selection:bg-[#D62828] selection:text-white" style={{ fontFamily: BODY_FONT, background: '#F4F1EA' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Brutalist Navigation Bar */}
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

      {/* Main Reservation Card Wrapper */}
      <main className="max-w-3xl mx-auto px-5 py-12 md:py-16">
        {location && (
          <Link to={'/locations/' + location.id} className="inline-block text-xs font-black uppercase tracking-wider text-[#7A7A7A] hover:text-[#111111] mb-6 bg-white px-4 py-2 rounded-lg border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111] transition-all">
            ← Back to {location.name}
          </Link>
        )}

        <div className="bg-white rounded-2xl border-2 border-[#111111] p-8 md:p-12 shadow-[8px_8px_0px_0px_#111111]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#111111] pb-6 mb-8">
            <div>
              <span className="bg-[#111111] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded mb-3 inline-block">
                Verified Suite
              </span>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight" style={{ fontFamily: HEADING_FONT }}>
                {TYPE_LABELS[unit.type]}
              </h1>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-[#7A7A7A]">Nightly Rate</p>
              <p className="text-2xl font-black" style={{ color: RED }}>KES {unit.price.toLocaleString()} <span className="text-xs font-medium text-[#5A5A5A]">/ night</span></p>
            </div>
          </div>

          {/* Photo Gallery */}
          {photos.length > 0 && (
            <div className="mb-8">
              <div className="rounded-2xl border-2 border-[#111111] overflow-hidden shadow-[4px_4px_0px_0px_#111111]">
                <img
                  src={photos[Math.min(activePhoto, photos.length - 1)]}
                  alt={TYPE_LABELS[unit.type] + ' photo'}
                  className="w-full h-64 md:h-96 object-cover"
                />
              </div>
              {photos.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {photos.map((url, i) => (
                    <button
                      key={url + i}
                      type="button"
                      onClick={() => setActivePhoto(i)}
                      className="flex-shrink-0 rounded-lg overflow-hidden border-2"
                      style={{ borderColor: i === activePhoto ? RED : INK }}
                    >
                      <img src={url} alt={'Thumbnail ' + (i + 1)} loading="lazy" className="h-16 w-24 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div className="mb-8 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#111111]">Video Tour</h3>
              {videos.map((url, i) => (
                <video
                  key={url + i}
                  src={url}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full rounded-2xl border-2 border-[#111111] bg-black"
                />
              ))}
            </div>
          )}

          {unit.description && <p className="text-base font-medium text-[#5A5A5A] leading-relaxed mb-4">{unit.description}</p>}
          <p className="text-xs font-bold uppercase tracking-wider text-[#7A7A7A] mb-8 bg-[#F4F1EA] p-3 rounded-xl border border-[#111111]">
            Prices shown are for the current season and may change.
          </p>

          {unit.amenities.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest mb-3 text-[#111111]">Included Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {unit.amenities.map((a) => (
                  <span key={a} className="bg-[#F4F1EA] border-2 border-[#111111] text-xs font-bold uppercase px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_#111111]">
                    ✓ {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="space-y-6 pt-6 border-t-2 border-[#111111]">
            <h3 className="text-xl font-black uppercase tracking-tight" style={{ fontFamily: HEADING_FONT }}>Reserve Your Dates</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2">Check-in (10:00 AM)</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full p-3.5 rounded-xl border-2 border-[#111111] font-medium bg-[#FBFAF6]"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2">Check-out (10:00 AM)</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full p-3.5 rounded-xl border-2 border-[#111111] font-medium bg-[#FBFAF6]"
                />
              </div>
            </div>

            {nights > 0 && (
              <div className="bg-[#EBE7DF] p-4 rounded-xl border-2 border-[#111111] flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider">Total Calculation ({nights} night{nights > 1 ? 's' : ''})</span>
                <span className="text-lg font-black" style={{ color: INK }}>KES {total.toLocaleString()}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Siwa Benson"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-3.5 rounded-xl border-2 border-[#111111] font-medium bg-[#FBFAF6]"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2">Phone Number (M-Pesa)</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="07XXXXXXXX"
                  className="w-full p-3.5 rounded-xl border-2 border-[#111111] font-medium bg-[#FBFAF6]"
                />
              </div>
            </div>

            {formError && <div className="p-4 bg-red-100 border-2 border-red-600 text-red-700 text-xs font-bold rounded-xl">{formError}</div>}

            <button
              type="submit"
              className="w-full text-sm font-black uppercase text-white bg-[#111111] py-4 rounded-xl border-2 border-[#111111] shadow-[4px_4px_0px_0px_#D62828] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              Book Now →
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
