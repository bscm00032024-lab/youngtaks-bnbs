import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getActiveLocations } from '../lib/queries'
import type { Location } from '../lib/database.types'
import logo from '../assets/logo.png.png'

const ACCENTS = [
  { name: 'red', bg: '#D62828', tint: '#D6282814' },
  { name: 'teal', bg: '#0F766E', tint: '#0F766E14' },
  { name: 'gold', bg: '#F5A623', tint: '#F5A62314' },
]

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function WindowMark({ color, size = 18 }: { color: string; size?: number }) {
  const gap = size * 0.14
  const pane = (size - gap) / 2
  return (
    <div
      style={{ width: size, height: size, gap }}
      className="grid grid-cols-2 grid-rows-2"
    >
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ background: color, width: pane, height: pane, borderRadius: 2 }} />
      ))}
    </div>
  )
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    getActiveLocations()
      .then(setLocations)
      .catch(() => setError('Could not load locations. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return locations
    return locations.filter((l) => l.name.toLowerCase().includes(query.trim().toLowerCase()))
  }, [locations, query])

  function scrollToGrid() {
    document.getElementById('spaces-grid')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading) return <p className="p-4 text-gray-500">Loading locations...</p>
  if (error) return <p className="p-4 text-red-600">{error}</p>

  return (
    <div style={{ background: '#FFF8EF', fontFamily: "'Sora', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Sora:wght@400;500;600;700&display=swap');
        .yt-hero-in { opacity: 0; transform: translateY(14px); transition: opacity .7s ease, transform .7s ease; }
        .yt-hero-in.yt-mounted { opacity: 1; transform: translateY(0); }
        .yt-hero-in.yt-delay-1 { transition-delay: .1s; }
        .yt-hero-in.yt-delay-2 { transition-delay: .2s; }
        .yt-card { transition: transform .25s ease, box-shadow .25s ease; }
        .yt-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(26,26,26,0.10); }
        .yt-card .yt-mark { opacity: 0; transition: opacity .25s ease; }
        .yt-card:hover .yt-mark { opacity: 1; }
      `}</style>

      {/* Hero */}
      <section className="px-6 pt-14 pb-16 md:px-12 md:pt-20 md:pb-24 max-w-5xl mx-auto">
        <div className={`yt-hero-in ${mounted ? 'yt-mounted' : ''} flex items-center gap-3 mb-6`}>
          <img src={logo} alt="YoungTaks BNBs" className="h-10 w-auto" />
        </div>
        <p className={`yt-hero-in yt-delay-1 ${mounted ? 'yt-mounted' : ''} text-lg`} style={{ color: '#D62828' }}>
          {getGreeting()}.
        </p>
        <h1
          className={`yt-hero-in yt-delay-1 ${mounted ? 'yt-mounted' : ''} mt-2 text-4xl md:text-5xl leading-tight`}
          style={{ fontFamily: "'Fraunces', serif", color: '#1A1A1A' }}
        >
          Find a place along the coast that already feels like yours.
        </h1>
        <p className={`yt-hero-in yt-delay-2 ${mounted ? 'yt-mounted' : ''} mt-4 text-base md:text-lg max-w-xl`} style={{ color: '#4A4A4A' }}>
          Know exactly where you're headed, or just want to see what's out there — either way works here.
        </p>

        <div className={`yt-hero-in yt-delay-2 ${mounted ? 'yt-mounted' : ''} mt-8 flex flex-col sm:flex-row gap-3`}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={scrollToGrid}
            placeholder="Search by area, e.g. Nyali"
            className="w-full sm:w-72 rounded-full px-5 py-3 text-sm border-2 outline-none"
            style={{ borderColor: '#1A1A1A1A' }}
          />
          <button
            onClick={scrollToGrid}
            className="rounded-full px-6 py-3 text-sm font-semibold text-white"
            style={{ background: '#D62828' }}
          >
            Just show me everything
          </button>
        </div>
      </section>

      {/* Mood band */}
      <section
        className="px-6 py-14 md:px-12 md:py-20 flex flex-col md:flex-row items-center gap-8 md:gap-16"
        style={{ background: '#1A1A1A' }}
      >
        <WindowMark color="#D62828" size={64} />
        <div>
          <h2 className="text-2xl md:text-3xl" style={{ fontFamily: "'Fraunces', serif", color: '#FFF8EF' }}>
            Every stay, checked and approved by hand.
          </h2>
          <p className="mt-3 max-w-lg text-sm md:text-base" style={{ color: '#CFCFCF' }}>
            We don't list a place until we'd send our own family there. That's the whole idea behind YoungTaks.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section id="spaces-grid" className="px-6 py-16 md:px-12 md:py-24 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl mb-8" style={{ fontFamily: "'Fraunces', serif", color: '#1A1A1A' }}>
          Choose a location
        </h2>

        {filtered.length === 0 && (
          <p className="text-sm" style={{ color: '#4A4A4A' }}>
            No locations match "{query}" — try a different area, or clear your search.
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((location, i) => {
            const accent = ACCENTS[i % ACCENTS.length]
            return (
              <Link
                key={location.id}
                to={`/locations/${location.id}`}
                className="yt-card relative block rounded-2xl p-6"
                style={{ background: accent.tint, border: `1px solid ${accent.bg}33` }}
              >
                <div className="yt-mark absolute top-5 right-5">
                  <WindowMark color={accent.bg} size={16} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: '#1A1A1A' }}>
                  {location.name}
                </h3>
                {location.description && (
                  <p className="text-sm mt-2" style={{ color: '#4A4A4A' }}>
                    {location.description}
                  </p>
                )}
                <span className="inline-block mt-4 text-sm font-semibold" style={{ color: accent.bg }}>
                  View units
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 py-16 md:px-12 md:py-20 text-center" style={{ background: '#F5A62314' }}>
        <h2 className="text-2xl md:text-3xl mb-3" style={{ fontFamily: "'Fraunces', serif", color: '#1A1A1A' }}>
          Not sure yet? That's fine.
        </h2>
        <p className="text-sm md:text-base mb-6" style={{ color: '#4A4A4A' }}>
          Scroll back up whenever you're ready — we'll be here.
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="rounded-full px-6 py-3 text-sm font-semibold text-white"
          style={{ background: '#0F766E' }}
        >
          Back to top
        </button>
      </section>
    </div>
  )
}
