import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  getLocationsWithStartingPrice,
  getSiteSettings,
  uploadHeroMedia,
  removeHeroMedia,
  type LocationWithStartingPrice,
  type SiteSettings,
} from '../lib/queries'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'
import logo from '../assets/logo.png.png'

const WHATSAPP_URL = 'https://wa.me/254796807457'
const PHONE_DISPLAY = '0796807457'
const PAYEE_NAME = 'Siwa Benson Ogilo'
const PAYBILL = '247247'
const PAYBILL_ACCOUNT = '1180177539458'

const STEPS = [
  { n: '01', title: 'Choose your unit', body: 'Browse real units by location and size — Studio to 3BR and larger.' },
  { n: '02', title: 'Pick your dates', body: 'Check-in from 10:00 AM, check-out by 10:00 AM on your last day.' },
  { n: '03', title: 'Pay via M-Pesa', body: 'Send money or use the paybill, then submit your transaction code.' },
  { n: '04', title: 'Get check-in details', body: 'The moment payment is verified, your door code, WiFi and pin are released.' },
]

export default function LocationsPage() {
  const [locations, setLocations] = useState<LocationWithStartingPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [session, setSession] = useState<Session | null>(null)
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null)
  const [heroUploading, setHeroUploading] = useState(false)

  useEffect(() => {
    getLocationsWithStartingPrice()
      .then(setLocations)
      .catch(() => setError('Could not load locations. Please try again.'))
      .finally(() => setLoading(false))

    getSiteSettings().then(setSiteSettings)

    // Same session check RequireAuth uses, so only a logged-in admin sees the
    // upload control here too — everyone else just sees the hero photo/video.
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const isAdmin = !!session

  async function handleHeroMediaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setHeroUploading(true)
    try {
      const updated = await uploadHeroMedia(file)
      setSiteSettings(updated)
    } catch {
      setError('Could not upload the hero photo/video. Please try again.')
    } finally {
      setHeroUploading(false)
      e.target.value = ''
    }
  }

  async function handleHeroMediaRemove() {
    setHeroUploading(true)
    try {
      const updated = await removeHeroMedia()
      setSiteSettings(updated)
    } catch {
      setError('Could not remove the hero photo/video. Please try again.')
    } finally {
      setHeroUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Sora', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Nav */}
      <nav className="flex items-center justify-between px-5 md:px-10 py-4 border-b" style={{ borderColor: '#EFEFEF' }}>
        <a href="/" className="flex items-center gap-3">
          <img src={logo} alt="YoungTaks BNBs" className="h-16 md:h-20 w-auto" />
          <div>
            <p className="text-lg md:text-2xl font-extrabold leading-tight" style={{ color: '#1A1A1A' }}>YoungTaks BNBs</p>
            <p className="text-xs md:text-sm font-medium leading-tight" style={{ color: '#D62828' }}>Your Trusted Booking Partner</p>
          </div>
        </a>
        <div className="flex items-center gap-4">
          <a href="/admin/login" className="text-xs md:text-sm" style={{ color: '#9A9A9A' }}>Admin</a>
          <a href="#locations" className="text-xs md:text-sm font-semibold text-white px-5 py-2.5 rounded-full" style={{ background: '#D62828' }}>Book a stay</a>
        </div>
      </nav>

            {/* Hero */}
      <section className="px-5 md:px-10 py-10 md:py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full border text-[11px] font-bold tracking-wider uppercase"
            style={{ borderColor: '#EAEAEA', color: '#5A5A5A' }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: '#D62828' }} />
            {locations.map((l) => l.name).join(' · ')}
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase leading-[1.05]" style={{ color: '#1A1A1A' }}>
            Book your stay in{' '}
            <span className="relative inline-block" style={{ color: '#D62828' }}>
              two minutes.
              <span
                className="absolute left-0 right-0 -bottom-1 h-1.5 rounded-full"
                style={{ background: '#D6282855' }}
              />
            </span>
          </h1>
          <p className="mt-4 max-w-md text-sm md:text-base" style={{ color: '#5A5A5A' }}>
            Serviced apartments across the Kenyan coast. Pick your unit, pay via M-Pesa, and your
            check-in details are released the moment payment is verified.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#locations" className="text-sm font-semibold text-white px-5 py-3 rounded-full" style={{ background: '#D62828' }}>Find your stay</a>
            <a href="#how" className="text-sm font-semibold px-5 py-3 rounded-full border" style={{ borderColor: '#1A1A1A33', color: '#1A1A1A' }}>How it works</a>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs" style={{ color: '#5A5A5A' }}>
            <li>✓ Check-in 10:00 AM</li>
            <li>✓ Pay via M-Pesa</li>
            <li>✓ WhatsApp support</li>
          </ul>
        </div>

        {/* Hero media — shown to everyone; upload/remove controls only appear when logged in as admin */}
        <div
          className="relative rounded-2xl h-64 md:h-96 overflow-hidden border shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #D6282822, #F5A62322, #0F766E22)',
            borderColor: '#1A1A1A22',
          }}
        >
          {siteSettings?.hero_media_url ? (
            siteSettings.hero_media_type === 'video' ? (
              <video src={siteSettings.hero_media_url} className="w-full h-full object-cover" controls />
            ) : (
              <img src={siteSettings.hero_media_url} className="w-full h-full object-cover" alt="Featured YoungTaks stay" />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-center px-6" style={{ color: '#9A9A9A' }}>
              No photo or video added yet
            </div>
          )}

          {isAdmin && (
            <div className="absolute bottom-3 right-3 flex gap-2">
              {siteSettings?.hero_media_url && (
                <button
                  onClick={handleHeroMediaRemove}
                  disabled={heroUploading}
                  className="text-xs font-semibold text-white px-4 py-2 rounded-full shadow disabled:opacity-60"
                  style={{ background: '#5A5A5A' }}
                >
                  Remove
                </button>
              )}
              <label
                className="text-xs font-semibold text-white px-4 py-2 rounded-full cursor-pointer shadow"
                style={{ background: '#1A1A1A', opacity: heroUploading ? 0.6 : 1 }}
              >
                {heroUploading ? 'Uploading...' : siteSettings?.hero_media_url ? 'Change photo/video' : 'Add photo/video'}
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  disabled={heroUploading}
                  onChange={handleHeroMediaChange}
                />
              </label>
            </div>
          )}
        </div>
      </section>
      {/* Where to */}
      <section id="locations" className="px-5 md:px-10 py-10 md:py-14" style={{ background: '#F6F6F4' }}>
        <h2 className="text-xl md:text-2xl font-bold" style={{ color: '#1A1A1A' }}>Where to?</h2>
        <p className="text-sm mt-1" style={{ color: '#7A7A7A' }}>
          {locations.length} location{locations.length !== 1 ? 's' : ''} along the coast. Pick one to see every unit.
        </p>
        <p className="text-xs mt-1 mb-6" style={{ color: '#9A9A9A' }}>Prices shown are for the current season and may change.</p>

        {loading && <p className="text-sm" style={{ color: '#7A7A7A' }}>Loading locations...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {locations.map((location) => (
              <Link key={location.id} to={`/locations/${location.id}`} className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow" style={{ borderColor: '#EAEAEA' }}>
                <p className="text-sm font-semibold flex items-center justify-between" style={{ color: '#1A1A1A' }}>
                  {location.name} <span style={{ color: '#D62828' }}>→</span>
                </p>
                {location.description && (
                  <p className="text-xs mt-2" style={{ color: '#7A7A7A' }}>{location.description}</p>
                )}
                <p className="text-sm font-semibold mt-3" style={{ color: '#D62828' }}>
                  {location.starting_price != null
                    ? `KES ${location.starting_price.toLocaleString()} / night and up`
                    : 'See units'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section id="how" className="px-5 md:px-10 py-10 md:py-14">
        <h2 className="text-xl md:text-2xl font-bold mb-6" style={{ color: '#1A1A1A' }}>How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {STEPS.map((step) => (
            <div key={step.n}>
              <p className="text-2xl font-extrabold mb-1" style={{ color: '#D6282833' }}>{step.n}</p>
              <p className="text-sm font-semibold mb-1" style={{ color: '#1A1A1A' }}>{step.title}</p>
              <p className="text-xs" style={{ color: '#7A7A7A' }}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Payment CTA */}
      <section className="px-5 md:px-10 py-10 md:py-14 text-center" style={{ background: '#1A1A1A' }}>
        <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
          Pay straight to YoungTaks — no apps, no cards.
        </h2>
        <p className="text-sm mb-6" style={{ color: '#CFCFCF' }}>
          Send Money {PHONE_DISPLAY} ({PAYEE_NAME}) or Paybill {PAYBILL}, Account {PAYBILL_ACCOUNT}.
        </p>
        <a href="#locations" className="inline-block text-sm font-semibold text-white px-6 py-3 rounded-full" style={{ background: '#D62828' }}>Start booking</a>
      </section>

      {/* Footer */}
      <footer className="px-5 md:px-10 py-8 md:py-10" style={{ background: '#111111' }}>
        <p className="text-sm font-bold" style={{ color: '#FFFFFF' }}>YoungTaks BNBs</p>
        <p className="text-xs mb-5" style={{ color: '#D62828' }}>Your Trusted Booking Partner</p>

        <div className="grid sm:grid-cols-2 gap-6 text-xs" style={{ color: '#B5B5B5' }}>
          <div>
            <p className="font-semibold mb-1" style={{ color: '#E5E5E5' }}>Pay via M-Pesa</p>
            <p>Send Money: {PHONE_DISPLAY} — {PAYEE_NAME}</p>
            <p>Paybill: {PAYBILL} · Account: {PAYBILL_ACCOUNT}</p>
          </div>
          <div>
            <p className="font-semibold mb-1" style={{ color: '#E5E5E5' }}>Talk to us</p>
            <p>{PHONE_DISPLAY}</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" style={{ color: '#D62828' }}>Message us on WhatsApp →</a>
          </div>
        </div>

        <p className="text-[11px] mt-6" style={{ color: '#6A6A6A' }}>
          Prices shown are for the current season and may change. · © 2026 YoungTaks BNBs
        </p>
      </footer>
    </div>
  )
}
