import { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  getBookingById,
  submitMpesaCode,
  getUnitById,
  getLocationById,
  getBookingLocationLink,
} from '../lib/queries'
import type { Booking, Unit, Location, UnitType } from '../lib/database.types'
import logo from '../assets/logo.png.png'

const WHATSAPP_LINK = 'https://wa.me/254796807457'
const PHONE_DISPLAY = '0796807457'
const PAYEE_NAME = 'Siwa Benson Ogilo'
const PAYBILL = '247247'
const PAYBILL_ACCOUNT = '1180177539458'
const HEADING_FONT = "'Archivo', sans-serif"
const BODY_FONT = "'DM Sans', sans-serif"
const RED = '#D62828'

const TYPE_LABELS: Record<UnitType, string> = {
  studio: 'Studio',
  '1br': '1 Bedroom',
  '2br': '2 Bedroom',
  '3br': '3 Bedroom',
  other: 'More',
}

interface PaymentState {
  total?: number
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

function formatDate(value: string): string {
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function toUrl(value: string): string | null {
  const v = value.trim()
  if (/^https?:\/\//i.test(v)) return v
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(v) && !/\s/.test(v)) return 'https://' + v
  return null
}

function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border-2 border-[#111111] bg-white hover:bg-[#111111] hover:text-white transition-colors whitespace-nowrap"
    >
      {copied ? 'Copied ✓' : label}
    </button>
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen text-[#111111] selection:bg-[#D62828] selection:text-white"
      style={{ fontFamily: BODY_FONT, background: '#F4F1EA' }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      <nav className="sticky top-0 z-50 bg-[#111111] border-b-2 border-[#111111] text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-10 py-4">
          <Link to="/" className="flex items-center gap-3.5">
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
          
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-black uppercase bg-[#D62828] text-white px-5 py-2.5 rounded-xl border-2 border-[#D62828] shadow-[3px_3px_0px_0px_#ffffff]"
          >
            WhatsApp Concierge
          </a>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-5 py-10 md:py-14">{children}</main>
    </div>
  )
}

function Steps({ current }: { current: 1 | 2 | 3 | 4 }) {
  const items = ['Pay', 'Verify', 'Check-in details']
  return (
    <div className="flex items-center gap-2 mb-8">
      {items.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
            <span
              className="w-7 h-7 rounded-full text-[11px] font-black flex items-center justify-center border-2 flex-shrink-0"
              style={{
                background: done ? '#111111' : active ? RED : '#FFFFFF',
                color: done || active ? '#FFFFFF' : '#111111',
                borderColor: active ? RED : '#111111',
              }}
            >
              {done ? '✓' : n}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline whitespace-nowrap">
              {label}
            </span>
            {n < items.length && <span className="flex-1 h-0.5 bg-[#111111]/20" />}
          </div>
        )
      })}
    </div>
  )
}

function BookingSummary({
  booking,
  unit,
  place,
  nights,
  total,
}: {
  booking: Booking
  unit: Unit | null
  place: Location | null
  nights: number
  total: number | undefined
}) {
  return (
    <div className="bg-white rounded-2xl border-2 border-[#111111] p-5 md:p-6 shadow-[5px_5px_0px_0px_#111111] mb-6">
      <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: RED }}>
        Your booking
      </p>
      <p className="text-xl font-black uppercase tracking-tight" style={{ fontFamily: HEADING_FONT }}>
        {unit ? TYPE_LABELS[unit.type] : 'Your stay'}
        {place ? ' · ' + place.name : ''}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#7A7A7A]">Check-in</p>
          <p className="font-bold">{formatDate(booking.check_in)}</p>
          <p className="text-xs text-[#7A7A7A]">from 10:00 AM</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#7A7A7A]">Check-out</p>
          <p className="font-bold">{formatDate(booking.check_out)}</p>
          <p className="text-xs text-[#7A7A7A]">by 10:00 AM</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t-2 border-[#E5E3DD] flex items-center justify-between text-sm">
        <span className="font-bold">
          {nights > 0 ? nights + ' night' + (nights > 1 ? 's' : '') : ''}
        </span>
        {total !== undefined && (
          <span className="font-black text-lg" style={{ color: RED }}>
            KES {total.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  )
}

export default function PaymentPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const routerLocation = useLocation()
  const state = routerLocation.state as PaymentState | null

  const [booking, setBooking] = useState<Booking | null>(null)
  const [unit, setUnit] = useState<Unit | null>(null)
  const [place, setPlace] = useState<Location | null>(null)
  const [unitLocationLink, setUnitLocationLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [mpesaCode, setMpesaCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showFallback, setShowFallback] = useState(false)

  const status = booking?.status
  const unitIdOfBooking = booking?.unit_id

  useEffect(() => {
    if (!bookingId) return
    getBookingById(bookingId)
      .then(setBooking)
      .finally(() => setLoading(false))
  }, [bookingId])

  useEffect(() => {
    if (!unitIdOfBooking) return
    getUnitById(unitIdOfBooking)
      .then(async (u) => {
        setUnit(u)
        if (u) setPlace(await getLocationById(u.location_id))
      })
      .catch(() => {})
  }, [unitIdOfBooking])

  useEffect(() => {
    if (!bookingId) return
    if (!status || status === 'pending_payment') return

    const channel = supabase
      .channel('booking-' + bookingId)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: 'id=eq.' + bookingId,
        },
        (payload) => {
          setBooking(payload.new as Booking)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [bookingId, status])

  useEffect(() => {
    if (status !== 'payment_submitted') return
    const timer = setTimeout(() => setShowFallback(true), 3 * 60 * 1000)
    return () => clearTimeout(timer)
  }, [status])

  useEffect(() => {
    if (!bookingId || !status) return
    if (status === 'pending_payment' || status === 'payment_submitted') return
    getBookingLocationLink(bookingId).then(setUnitLocationLink)
  }, [bookingId, status])

  async function handleSubmitCode(e: React.FormEvent) {
    e.preventDefault()
    if (!bookingId) return
    const code = mpesaCode.trim().toUpperCase()
    if (!/^[A-Z0-9]{8,12}$/.test(code)) {
      setSubmitError('Please enter the M-Pesa code exactly as it appears in your SMS, e.g. QAB1C2D3E4.')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      const updated = await submitMpesaCode(bookingId, code)
      setBooking(updated)
    } catch {
      setSubmitError('Could not submit your code. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PageShell>
        <p className="font-black uppercase tracking-widest text-sm text-[#7A7A7A] animate-pulse">
          Loading your booking...
        </p>
      </PageShell>
    )
  }

  if (!booking) {
    return (
      <PageShell>
        <div className="p-4 bg-red-100 border-2 border-red-600 text-red-700 font-bold rounded-xl mb-4">
          Booking not found.
        </div>
        <Link to="/" className="text-xs font-black uppercase underline underline-offset-4">
          Back to home
        </Link>
      </PageShell>
    )
  }

  const nights = booking.check_in && booking.check_out ? nightsBetween(booking.check_in, booking.check_out) : 0
  const total = unit && nights > 0 ? nights * unit.price : state?.total
  const firstName = (booking.customer_name ?? '').trim().split(' ')[0]
  const helpLink =
    WHATSAPP_LINK +
    '?text=' +
    encodeURIComponent('Hi YoungTaks, I need help with my booking (ref ' + booking.id.slice(0, 8).toUpperCase() + ').')

  if (booking.status === 'pending_payment') {
    return (
      <PageShell>
        <Steps current={1} />
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2" style={{ fontFamily: HEADING_FONT }}>
          Complete your payment
        </h1>
        <p className="text-sm md:text-base font-medium text-[#5A5A5A] mb-6">
          {firstName ? 'Hi ' + firstName + ', y' : 'Y'}our dates are held. Pay with M-Pesa below, then paste your
          transaction code to confirm.
        </p>

        <BookingSummary booking={booking} unit={unit} place={place} nights={nights} total={total} />

        {total !== undefined && (
          <div className="bg-[#111111] text-white rounded-2xl border-2 border-[#111111] p-6 shadow-[6px_6px_0px_0px_#D62828] mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#9A9A9A]">Amount to pay</p>
            <p className="text-4xl font-black mt-1" style={{ fontFamily: HEADING_FONT }}>
              KES {total.toLocaleString()}
            </p>
            <p className="text-xs text-[#9A9A9A] mt-2">Send this exact amount using one of the options below.</p>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="bg-white rounded-2xl border-2 border-[#111111] p-5 shadow-[4px_4px_0px_0px_#111111]">
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: RED }}>
              Option 1 · Send Money
            </p>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-2xl font-black tracking-wide">{PHONE_DISPLAY}</p>
                <p className="text-xs font-bold text-[#7A7A7A] uppercase">{PAYEE_NAME}</p>
              </div>
              <CopyButton value={PHONE_DISPLAY} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-[#111111] p-5 shadow-[4px_4px_0px_0px_#111111]">
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: RED }}>
              Option 2 · Paybill
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#7A7A7A]">Business no.</p>
                  <p className="text-2xl font-black tracking-wide">{PAYBILL}</p>
                </div>
                <CopyButton value={PAYBILL} />
              </div>
              <div className="flex items-center justify-between gap-3 pt-3 border-t-2 border-[#E5E3DD]">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#7A7A7A]">Account no.</p>
                  <p className="text-2xl font-black tracking-wide">{PAYBILL_ACCOUNT}</p>
                </div>
                <CopyButton value={PAYBILL_ACCOUNT} />
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmitCode}
          className="bg-white rounded-2xl border-2 border-[#111111] p-5 md:p-6 shadow-[5px_5px_0px_0px_#111111]"
        >
          <h2 className="text-lg font-black uppercase tracking-tight mb-1" style={{ fontFamily: HEADING_FONT }}>
            Paid? Enter your code
          </h2>
          <p className="text-xs font-medium text-[#5A5A5A] mb-4">
            Find the 10-character code in the M-Pesa SMS you received after paying.
          </p>
          <input
            type="text"
            value={mpesaCode}
            onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
            placeholder="e.g. QAB1C2D3E4"
            maxLength={12}
            autoCapitalize="characters"
            autoComplete="off"
            className="w-full p-3.5 rounded-xl border-2 border-[#111111] font-black tracking-widest bg-[#FBFAF6] uppercase"
          />
          {submitError && (
            <div className="mt-3 p-3 bg-red-100 border-2 border-red-600 text-red-700 text-xs font-bold rounded-xl">
              {submitError}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full text-sm font-black uppercase text-white bg-[#111111] py-4 rounded-xl border-2 border-[#111111] shadow-[4px_4px_0px_0px_#D62828] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : "I've paid, submit code →"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs font-bold text-[#5A5A5A]">
          Need help paying?{' '}
          <a href={helpLink} target="_blank" rel="noreferrer" className="underline underline-offset-4" style={{ color: RED }}>
            Chat with us on WhatsApp
          </a>
        </p>
      </PageShell>
    )
  }

  if (booking.status === 'payment_submitted') {
    return (
      <PageShell>
        <Steps current={2} />
        <div className="bg-white rounded-2xl border-2 border-[#111111] p-6 md:p-8 shadow-[6px_6px_0px_0px_#111111] mb-6 text-center">
          <div className="mx-auto mb-5 h-12 w-12 border-4 border-[#E5E3DD] border-t-[#D62828] rounded-full animate-spin" />
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2" style={{ fontFamily: HEADING_FONT }}>
            Confirming your payment
          </h1>
          <p className="text-sm font-medium text-[#5A5A5A] leading-relaxed">
            We are checking your M-Pesa code. This usually takes a few minutes. Your check-in details will appear on
            this page automatically as soon as it is verified.
          </p>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#7A7A7A]">
            You can leave and come back. Just save this page&apos;s link.
          </p>
          <div className="mt-4 flex justify-center">
            <CopyButton value={window.location.href} label="Copy page link" />
          </div>
        </div>

        <BookingSummary booking={booking} unit={unit} place={place} nights={nights} total={total} />

        {showFallback && (
          <div className="bg-white rounded-2xl border-2 border-[#111111] p-5 text-center">
            <p className="text-sm font-medium text-[#5A5A5A] mb-3">
              Taking longer than usual? Message us and we will check it right away.
            </p>
            
              href={helpLink}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs font-black uppercase text-white px-6 py-3 rounded-xl border-2 border-[#D62828]"
              style={{ background: RED }}
            >
              Chat on WhatsApp
            </a>
          </div>
        )}
      </PageShell>
    )
  }

  const locationValue = (booking.location_pin && booking.location_pin.trim()) || unitLocationLink || ''
  const locationUrl = locationValue ? toUrl(locationValue) : null

  return (
    <PageShell>
      <Steps current={4} />

      <div className="bg-[#111111] text-white rounded-2xl border-2 border-[#111111] p-6 md:p-8 shadow-[6px_6px_0px_0px_#D62828] mb-6">
        <span
          className="inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md mb-3"
          style={{ background: RED }}
        >
          Booking confirmed
        </span>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight" style={{ fontFamily: HEADING_FONT }}>
          You&apos;re all set{firstName ? ', ' + firstName : ''}!
        </h1>
        <p className="mt-3 text-sm font-medium text-[#D6D3CE] leading-relaxed">
          Payment verified. Your check-in details are below. Take a screenshot or save this page&apos;s link, you will
          need the door code when you arrive.
        </p>
        <div className="mt-4">
          <CopyButton value={window.location.href} label="Copy page link" />
        </div>
      </div>

      <BookingSummary booking={booking} unit={unit} place={place} nights={nights} total={total} />

      <div className="space-y-4 mb-6">
        {booking.door_code && (
          <div className="bg-white rounded-2xl border-2 border-[#111111] p-5 md:p-6 shadow-[5px_5px_0px_0px_#111111]">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: RED }}>
              Door code
            </p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-4xl font-black tracking-widest break-all" style={{ fontFamily: 'monospace' }}>
                {booking.door_code}
              </p>
              <CopyButton value={booking.door_code} />
            </div>
          </div>
        )}

        {booking.wifi_details && (
          <div className="bg-white rounded-2xl border-2 border-[#111111] p-5 md:p-6 shadow-[5px_5px_0px_0px_#111111]">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: RED }}>
              WiFi
            </p>
            <div className="flex items-start justify-between gap-3">
              <p className="text-base font-bold whitespace-pre-wrap break-words">{booking.wifi_details}</p>
              <CopyButton value={booking.wifi_details} />
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border-2 border-[#111111] p-5 md:p-6 shadow-[5px_5px_0px_0px_#111111]">
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: RED }}>
            Location
          </p>
          {locationUrl ? (
            <div className="flex flex-wrap items-center gap-3">
              
                href={locationUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-black uppercase text-white bg-[#111111] px-6 py-3.5 rounded-xl border-2 border-[#111111] shadow-[3px_3px_0px_0px_#D62828]"
              >
                Open in Google Maps →
              </a>
              <CopyButton value={locationUrl} label="Copy link" />
            </div>
          ) : locationValue ? (
            <div className="flex items-start justify-between gap-3">
              <p className="text-base font-bold whitespace-pre-wrap break-words">{locationValue}</p>
              <CopyButton value={locationValue} />
            </div>
          ) : (
            <p className="text-sm font-medium text-[#5A5A5A]">
              We will share the exact location with you on WhatsApp.
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-[#111111] p-5 md:p-6 mb-6">
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: RED }}>
          Good to know
        </p>
        <ul className="space-y-2 text-sm font-medium text-[#3A3A3A]">
          <li>✓ Check-in from 10:00 AM on {formatDate(booking.check_in)}</li>
          <li>✓ Check-out by 10:00 AM on {formatDate(booking.check_out)}</li>
          <li>✓ Our team is on WhatsApp 24/7 if you need anything</li>
        </ul>
      </div>

      <div className="text-center">
        
          href={helpLink}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-sm font-black uppercase text-white px-8 py-4 rounded-xl border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111]"
          style={{ background: '#25D366' }}
        >
          Need help? Chat on WhatsApp
        </a>
        <p className="mt-2 text-xs font-bold text-[#7A7A7A]">{PHONE_DISPLAY}</p>
      </div>
    </PageShell>
  )
}
