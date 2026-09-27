import { Routes, Route } from 'react-router-dom'
import LocationsPage from './pages/LocationsPage'
<Route path="locations" element={<AdminLocationsPage />} />
<Route path="locations/:locationId/units" element={<AdminLocationUnitsPage />} />
import UnitsPage from './pages/UnitsPage'
import UnitDetailPage from './pages/UnitDetailPage'
import BookingConfirmPage from './pages/BookingConfirmPage'
import PaymentPage from './pages/PaymentPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminBookingsPage from './pages/admin/AdminBookingsPage'
import AdminLocationsPage from './pages/admin/AdminLocationsPage'
import AdminUnitsPage from './pages/admin/AdminUnitsPage'
import AdminBlogPage from './pages/admin/AdminBlogPage'
import RequireAuth from './components/RequireAuth'

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-white text-brand-black">
            <header className="p-4 border-b border-gray-200">
              <a href="/">
                <h1 className="text-xl font-bold">YoungTaks BNBs</h1>
                <p className="text-sm text-gray-500">Your Trusted Booking Partner</p>
              </a>
            </header>
            <LocationsPage />
          </div>
        }
      />
      <Route
        path="/locations/:locationId"
        element={
          <div className="min-h-screen bg-white text-brand-black">
            <header className="p-4 border-b border-gray-200">
              <a href="/">
                <h1 className="text-xl font-bold">YoungTaks BNBs</h1>
                <p className="text-sm text-gray-500">Your Trusted Booking Partner</p>
              </a>
            </header>
            <UnitsPage />
          </div>
        }
      />
      <Route
        path="/units/:unitId"
        element={
          <div className="min-h-screen bg-white text-brand-black">
            <header className="p-4 border-b border-gray-200">
              <a href="/">
                <h1 className="text-xl font-bold">YoungTaks BNBs</h1>
                <p className="text-sm text-gray-500">Your Trusted Booking Partner</p>
              </a>
            </header>
            <UnitDetailPage />
          </div>
        }
      />
      <Route
        path="/booking/confirm"
        element={
          <div className="min-h-screen bg-white text-brand-black">
            <header className="p-4 border-b border-gray-200">
              <a href="/">
                <h1 className="text-xl font-bold">YoungTaks BNBs</h1>
                <p className="text-sm text-gray-500">Your Trusted Booking Partner</p>
              </a>
            </header>
            <BookingConfirmPage />
          </div>
        }
      />
      <Route
        path="/booking/:bookingId/payment"
        element={
          <div className="min-h-screen bg-white text-brand-black">
            <header className="p-4 border-b border-gray-200">
              <a href="/">
                <h1 className="text-xl font-bold">YoungTaks BNBs</h1>
                <p className="text-sm text-gray-500">Your Trusted Booking Partner</p>
              </a>
            </header>
            <PaymentPage />
          </div>
        }
      />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="locations" element={<AdminLocationsPage />} />
        <Route path="units" element={<AdminUnitsPage />} />
        <Route path="blog" element={<AdminBlogPage />} />
      </Route>
    </Routes>
  )
}

export default App
