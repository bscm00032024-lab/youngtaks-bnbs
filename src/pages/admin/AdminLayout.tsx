import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { signOut } from '../../lib/auth'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  'px-3 py-2 rounded-md text-sm font-medium ' +
  (isActive ? 'bg-brand-red text-white' : 'text-brand-black hover:bg-gray-100')

export default function AdminLayout() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">YoungTaks Admin</h1>
        </div>
        <button onClick={handleSignOut} className="text-sm text-gray-500 hover:underline">
          Sign out
        </button>
      </div>
      <nav className="flex gap-2 p-3 border-b border-gray-100 bg-gray-50 overflow-x-auto">
        <NavLink to="/admin/bookings" className={navLinkClass}>
          Bookings
        </NavLink>
        <NavLink to="/admin/locations" className={navLinkClass}>
          Locations
        </NavLink>
        <NavLink to="/admin/units" className={navLinkClass}>
          Units
        </NavLink>
        <NavLink to="/admin/blog" className={navLinkClass}>
          Blog
        </NavLink>
      </nav>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
