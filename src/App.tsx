import { Routes, Route } from 'react-router-dom'
import LocationsPage from './pages/LocationsPage'
import UnitsPage from './pages/UnitsPage'
import UnitDetailPage from './pages/UnitDetailPage'
import BookingConfirmPage from './pages/BookingConfirmPage'
import PaymentPage from './pages/PaymentPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminBookingsPage from './pages/admin/AdminBookingsPage'
import AdminLocationsPage from './pages/admin/AdminLocationsPage'
import AdminLocationUnitsPage from './pages/admin/AdminLocationUnitsPage'
import AdminUnitsPage from './pages/admin/AdminUnitsPage'
import AdminBlogPage from './pages/admin/AdminBlogPage'
import RequireAuth from './components/RequireAuth'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LocationsPage />} />
      <Route path="/locations/:locationId" element={<UnitsPage />} />
      <Route path="/units/:unitId" element={<UnitDetailPage />} />
      <Route path="/booking/confirm" element={<BookingConfirmPage />} />
      <Route path="/booking/:bookingId/payment" element={<PaymentPage />} />
      
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
        <Route path="locations/:locationId/units" element={<AdminLocationUnitsPage />} />
        <Route path="units" element={<AdminUnitsPage />} />
        <Route path="blog" element={<AdminBlogPage />} />
      </Route>
    </Routes>
  )
}

export default App
