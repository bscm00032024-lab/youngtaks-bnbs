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
const CARD_BORDER = '#E5E3DD'

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
  letterSpacing: '-0.015em',
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

    // Same session check RequireAuth uses: only a logged-in admin sees upload controls.
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
    <div className="min-h-screen" style={{ fontFamily: BODY_FONT, background: '#FBFAF6' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Nav */}
      <nav className="bg-white border-b" style={{ borderColor: '#EFEFEF' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 md:px-8 py-4">
          <a href="/" className="flex items-center gap-3">
            <img src={logo} alt="YoungTaks BNBs" className="h-16 md:h-20 w-auto" />
            <div>
              <p className="text-lg md:text-2xl font-extrabold leading-tight" style={headingStyle()}>YoungTaks BNBs</p>
              <p className="text-xs md:text-sm font-medium leading-tight" style={{ color: RED }}>Your Trusted Booking Partner</p>
            </div>
          </a>
          <div className="flex items-center gap-4">
            <a href="/admin/login" className="text-xs md:text-sm" style={{ color: '#9A9A9A' }}>Admin</a>
            <a href="#locations" className="text-xs md:text-sm font-semibold text-white px-5 py-2.5 rounded-full" style={{ background: RED }}>Book a stay</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-16 grid md:grid-cols-2 gap-10 items-center">
