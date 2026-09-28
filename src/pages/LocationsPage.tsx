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

const HEADING_FONT = "'Archivo', sans-serif"
const BODY_FONT = "'DM Sans', sans-serif"

const RED = '#D62828'
const INK = '#111111'
const CARD_BORDER = '#111111'

const LOCATION_ORDER = ['Mombasa Town', 'Buxton Point', 'Shanzu', 'Nyali', 'Bamburi', 'Diani']
const HERO_AREAS = 'Mombasa · Nyali · Bamburi · Diani'
const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']

const STEPS = [
  { n: '01', title: 'Choose your unit', body: 'Browse real units by location and size — Studio to 3BR and larger.' },
  { n: '02', title: 'Pick your dates', body: 'Check-in from 10:00 AM, check-out by 10:00 AM on your last day.' },
  { n: '03', title: 'Pay via M-Pesa', body: 'Send money or use the paybill, then submit your transaction code.' },
  { n: '04', title: 'Get check-in details', body: 'The moment payment is verified, your door code, WiFi and pin are released.' },
]

const headingStyle = (color = INK) => ({
  fontFamily: HEADING_FONT,
  letterSpacing: '-0.02em',
  color,
})

export default function LocationsPage() {
  const [locations, setLocations] = useState<LocationWithStartingPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [session, setSession] = useState<Session | null>(null)
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null)
  const [heroUploading, setHeroUploading] = useState(false)
  const [heroError, setHeroError] = useState<string | null>(null)

  useEffect(() => {
    getLocationsWithStartingPrice()
      .then(setLocations)
      .catch(() => setError('Could not load locations. Please try again.'))
      .finally(() => setLoading(false))

    getSiteSettings().then(setSiteSettings)

    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const isAdmin = !!session

  const sortedLocations = [...locations].sort((a, b) => {
    const ai = LOCATION_ORDER.indexOf(a.name)
    const bi = LOCATION_ORDER.indexOf(b.name)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  const countWord = NUMBER_WORDS[locations.length] ?? String(locations.length)

  async function handleHeroMediaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setHeroUploading(true)
    setHeroError(null)
    try {
      const updated = await uploadHeroMedia(file)
      setSiteSettings(updated)
    } catch {
      setHeroError('Could not upload the photo/video. Please try again.')
    } finally {
      setHeroUploading(false)
      e.target.value = ''
    }
  }

  async function handleHeroMediaRemove() {
    setHeroUploading(true)
    setHeroError(null)
    try {
      const updated = await removeHeroMedia()
      setSiteSettings(updated)
    } catch {
      setHeroError('Could not remove the photo/video. Please try again.')
    } finally {
      setHeroUploading(false)
    }
  }

  return (
    <div className="min-h-screen text-[#111111] selection:bg-[#D62828] selection:text-white" style={{ fontFamily: BODY_FONT, background: '#F4F1EA' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#111111] border-b-2 border-[#111111] text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-10 py-4">
          <a href="/" className="flex items-center gap-3.5 group">
            <div className="bg-white p-1.5 rounded-lg border-2 border-white group-hover:border-[#D62828] transition-colors">
              <img src={logo} alt="YoungTaks BNBs" className="h-10 md:h-12 w-auto object-contain" />
            </div>
            <div>
              <p className="text-lg md:text-2xl font-black uppercase tracking-tight" style={headingStyle('#FFFFFF')}>
                YoungTaks <span style={{ color: RED }}>BNBs</span>
              </p>
              <p className="text-[10px] md:text-xs font-bold tracking-widest uppercase" style={{ color: RED }}>Coastal Residences</p>
            </div>
          </a>

          <div className="hidden lg:block text-xs font-bold tracking-widest uppercase text-[#9A9A9A]">
            {HERO_AREAS}
          </div>

          <div className="flex items-center gap-4">
            <a href="/admin/login" className="text-xs md:text-sm font-semibold text-[#9A9A9A] hover:text-white transition-colors">Admin</a>
            <a href="#locations" className="text-xs md:text-sm font-extrabold uppercase text-white px-5 py-2.5 rounded-xl border-2 border-white hover:bg-[#D62828] hover:border-[#D62828] shadow-[3px_3px_0px_0px_#ffffff] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all" style={{ background: RED }}>
              Book Stay
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-5 md:px-10 py-12 md:py-20 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-6 rounded-full border-2 border-[#111111] bg-white text-xs font-black tracking-wider uppercase shadow-[3px_3px_0px_0px_#111111]">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: RED }} />
            <span>Kenya Coast Verified Stays</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase leading-[0.98]" style={{ fontFamily: HEADING_FONT, letterSpacing: '-0.03em', color: INK }}>
            Book your stay in{' '}
            <span className="relative inline-block px-2 text-white bg-[#111111] rotate-[-1deg] mt-1">
              <span style={{ color: RED }}>two minutes.</span>
            </span>
          </h1>

          <p className="mt-6 text-base md:text-lg font-medium text-[#4A4A4A] max-w-xl leading-relaxed">
            Curated private apartments and coastal suites across Mombasa, Nyali, Bamburi, and Diani. Zero friction, instant door codes, M-Pesa direct.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#locations" className="text-sm font-black uppercase text-white px-7 py-4 rounded-xl border-2 border-[#111111] bg-[#111111] shadow-[4px_4px_0px_0px_#D62828] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#D62828] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
              Explore Destinations →
            </a>
            <a href="#how" className="text-sm font-black uppercase px-7 py-4 rounded-xl border-2 border-[#111111] bg-white text-[#111111] shadow-[4px_4px_0px_0px_#111111] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#111111] transition-all">
              How It Works
            </a>
          </div>

          <div className="mt-10 pt-8 border-t-2 border-[#D1CEC7] grid grid-cols-3 gap-4 text-xs font-black uppercase tracking-wider text-[#3A3A3A]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px]">✓</span> Check-in 10 AM
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px]">✓</span> M-Pesa Direct
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px]">✓</span> 24/7 WhatsApp
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div
            className="relative rounded-2xl h-[320px] md:h-[440px] overflow-hidden shadow-[8px_8px_0px_0px_#111111]"
            style={{
              background: '#111111',
              border: `3px solid ${INK}`,
            }}
          >
            {siteSettings?.hero_media_url ? (
              siteSettings.hero_media_type === 'video' ? (
                <video src={siteSettings.hero_media_url} className="w-full h-full object-cover" controls />
              ) : (
                <img src={siteSettings.hero_media_url} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt="Featured YoungTaks stay" />
              )
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-xs text-center p-8 bg-[#1B1B1B] text-[#8A8A8A]">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#5A5A5A] flex items-center justify-center mb-3 text-white font-bold">+</div>
                <p className="font-bold text-white uppercase tracking-wider">No Hero Visual Added</p>
                <p className="mt-1 text-[11px]">Admins can upload a showcase video or photo below.</p>
              </div>
            )}

            {isAdmin && (
              <div className="absolute bottom-4 right-4 flex gap-2.5 bg-[#111111]/90 backdrop-blur-md p-2 rounded-xl border-2 border-white/20 shadow-xl">
                {siteSettings?.hero_media_url && (
                  <button onClick={handleHeroMediaRemove} disabled={heroUploading} className="text-xs font-black uppercase bg-[#3A3A3A] hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                    Remove
                  </button>
                )}
                <label className="text-xs font-black uppercase bg-[#D62828] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-red-700 transition-colors shadow" style={{ opacity: heroUploading ? 0.6 : 1 }}>
                  {heroUploading ? 'Uploading...' : siteSettings?.hero_media_url ? 'Change Media' : 'Upload Media'}
                  <input type="file" accept="image/*,video/*" className="hidden" disabled={heroUploading} onChange={handleHeroMediaChange} />
                </label>
              </div>
            )}
          </div>
          {isAdmin && heroError && <p className="mt-2 text-xs font-bold text-red-600 bg-white p-2 rounded border border-red-300">{heroError}</p>}
        </div>
      </section>

      {/* Locations Grid Section */}
      <section id="locations" className="bg-[#EBE7DF] border-y-2 border-[#111111] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#D62828] mb-2">Destinations</p>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight" style={headingStyle()}>Where to?</h2>
              <p className="mt-2 text-base font-medium text-[#5A5A5A]">
                {countWord} coastal location{locations.length !== 1 ? 's' : ''}. Select a destination to view available units.
              </p>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#7A7A7A] bg-white px-4 py-2 rounded-lg border border-[#111111]">
              Rates valid for current season
            </p>
          </div>

          {loading && (
            <div className="py-20 text-center font-black uppercase tracking-widest text-[#7A7A7A] animate-pulse">
              Loading coastal residences...
            </div>
          )}
          {error && <div className="p-4 bg-red-100 border-2 border-red-600 text-red-700 font-bold rounded-xl">{error}</div>}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedLocations.map((location) => (
                <Link
                  key={location.id}
                  to={`/locations/${location.id}`}
                  className="group flex flex-col bg-white rounded-2xl border-2 border-[#111111] overflow-hidden shadow-[6px_6px_0px_0px_#111111] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#D62828] transition-all"
                >
                  {location.image_url ? (
                    <div className="h-52 md:h-56 overflow-hidden border-b-2 border-[#111111] relative">
                      <img src={location.image_url} alt={location.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3 bg-[#111111] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md">
                        Verified Area
                      </div>
                    </div>
                  ) : (
                    <div className="h-52 bg-[#1A1A1A] flex items-center justify-center text-xs font-bold text-white uppercase tracking-widest border-b-2 border-[#111111]">
                      YoungTaks Coastal Stay
                    </div>
                  )}

                  <div className="p-6 md:p-8 flex flex-col flex-grow justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight" style={headingStyle()}>{location.name}</h3>
                        <span className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center group-hover:bg-[#D62828] transition-colors">→</span>
                      </div>
                      {location.description && (
                        <p className="mt-3 text-sm font-medium leading-relaxed text-[#5A5A5A] line-clamp-2">{location.description}</p>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#E5E3DD] flex items-center justify-between">
                      <p className="text-sm">
                        {location.starting_price != null ? (
                          <>
                            <span className="text-xs font-bold uppercase text-[#7A7A7A] block">From</span>
                            <span className="text-lg font-black" style={{ color: RED }}>KES {location.starting_price.toLocaleString()}</span>{' '}
                            <span className="text-xs font-bold text-[#5A5A5A]">/ night</span>
                          </>
                        ) : (
                          <span className="font-black text-sm uppercase" style={{ color: RED }}>View Available Units</span>
                        )}
                      </p>
                      <span className="text-xs font-black uppercase tracking-wider underline underline-offset-4">Browse Units</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className="max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-24">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-black uppercase tracking-widest text-[#D62828] mb-2">Frictionless Experience</p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight" style={headingStyle()}>How it works</h2>
          <p className="mt-2 text-base font-medium text-[#5A5A5A]">From inquiry to verified check-in in under 120 seconds.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step) => (
            <div key={step.n} className="bg-white rounded-2xl border-2 border-[#111111] p-6 md:p-8 shadow-[4px_4px_0px_0px_#111111] flex flex-col justify-between">
              <div>
                <p className="text-4xl font-black mb-4 font-mono" style={{ color: RED }}>{step.n}</p>
                <p className="text-lg font-black uppercase tracking-tight mb-2" style={{ color: INK }}>{step.title}</p>
                <p className="text-sm font-medium leading-relaxed text-[#5A5A5A]">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* M-Pesa Direct Banner */}
        <div className="mt-12 bg-[#111111] text-white rounded-2xl border-2 border-[#111111] p-8 md:p-12 shadow-[8px_8px_0px_0px_#D62828] flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <span className="bg-[#D62828] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md inline-block mb-3">Instant Verification</span>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight" style={headingStyle('#FFFFFF')}>
              Pay straight to YoungTaks — no apps, no cards.
            </h3>
            <p className="mt-2 text-sm md:text-base font-medium text-[#D6D3CE]">
              Send Money to <strong className="text-white">{PHONE_DISPLAY}</strong> ({PAYEE_NAME}) or use Paybill <strong className="text-white">{PAYBILL}</strong>, Account <strong className="text-white">{PAYBILL_ACCOUNT}</strong>.
            </p>
          </div>
          <a href="#locations" className="inline-block self-start md:self-center text-sm font-black uppercase text-[#111111] px-8 py-4 rounded-xl bg-white border-2 border-white hover:bg-[#D62828] hover:text-white hover:border-[#D62828] transition-all whitespace-nowrap shadow-lg">
            Start Booking Now
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B0B0B] text-white border-t-2 border-[#111111]">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-16">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="bg-white p-1.5 rounded-lg">
              <img src={logo} alt="" className="h-8 w-auto object-contain" />
            </div>
            <p className="text-xl font-black uppercase tracking-tight" style={{ fontFamily: HEADING_FONT }}>
              YOUNGTAKS <span style={{ color: RED }}>BNBS</span>
            </p>
          </div>
          <p className="text-sm font-medium text-[#9A9A9A] mb-12">Your Trusted Short-Stay Partner Along the Kenyan Coast</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 text-sm pb-12 border-b border-[#222222]">
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-3 text-[#D62828]">M-Pesa Payment Details</p>
              <p className="font-bold text-white mb-1">Send Money: {PHONE_DISPLAY}</p>
              <p className="text-[#C5C5C5] mb-2">Payee: {PAYEE_NAME}</p>
              <p className="font-bold text-white mb-1">Paybill: {PAYBILL}</p>
              <p className="text-[#C5C5C5]">Account: {PAYBILL_ACCOUNT}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-3 text-[#D62828]">Direct Concierge</p>
              <p className="font-bold text-white mb-2">{PHONE_DISPLAY}</p>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-block font-black uppercase tracking-wider text-white bg-[#25D366] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-xs">
                Chat on WhatsApp →
              </a>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-3 text-[#D62828]">Coastal Hubs</p>
              <p className="text-[#C5C5C5] font-medium leading-relaxed">{HERO_AREAS}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 text-xs font-bold text-[#7A7A7A] uppercase tracking-wider">
            <p>Prices shown are for the current season and subject to change.</p>
            <p>© 2026 YoungTaks BNBs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
