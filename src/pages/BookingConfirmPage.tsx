import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { createBooking } from '../lib/queries'

interface BookingState {
  unitId: string
  checkIn: string
  checkOut: string
  customerName: string
  customerPhone: string
  total: number
}

export default function BookingConfirmPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const hasSubmitted = useRef(false)

  const state = location.state as BookingState | null

  useEffect(() => {
    if (!state) return
    if (hasSubmitted.current) return
    hasSubmitted.current = true

    createBooking({
      unit_id: state.unitId,
      check_in: state.checkIn,
      check_out: state.checkOut,
      customer_name: state.customerName,
      customer_phone: state.customerPhone,
    })
      .then((booking) => {
        navigate(`/booking/${booking.id}/payment`, {
          replace: true,
          state: { total: state.total },
        })
      })
      .catch(() => setError('Could not create your booking. Please go back and try again.'))
  }, [state, navigate])

  if (!state) {
    return (
      <div className="p-4">
        <p className="text-red-600">
          Missing booking details. Please go back and select your dates again.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <p className="text-gray-500">Confirming your booking...</p>
    </div>
  )
}
