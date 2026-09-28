import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { signOut } from '../../lib/auth'

const HEADING_FONT = "'Archivo', sans-serif"
const BODY_FONT = "'DM Sans', sans-serif"
const RED = '#D62828'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 border-[#111111] ' +
  (isActive
    ? 'bg-[#111111] text-white shadow-[3px_3px_0px_0px_#D62828]'
    : 'bg-white text-[#111111] hover:bg-[#F4F1EA] shadow-[2px_2px_0px_0px_#111111]')

export default function AdminLayout() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen text-[#111111] selection:bg-[#D62828] selection:text-white" style={{ fontFamily: BODY_FONT, background: '#F4F1EA' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Top Header Bar */}
      <div className="bg-[#111111] border-b-2 border-[#111111] text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight" style={{ fontFamily: HEADING_FONT }}>
            YoungTaks <span style={{ color: RED }}>Admin</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9A9A]">Coast Management Suite</p>
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs font-black uppercase text-white bg-[#D62828] px-4 py-2 rounded-xl border-2 border-[#D62828] shadow-[3px_3px_0px_0px_#ffffff] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
        >
          Sign Out
        </button>
      </div>

      {/* Navigation Tabs Bar */}
      <nav className="max-w-7xl mx-auto px-5 md:px-10 py-6 flex gap-3 overflow-x-auto">
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

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-5 md:px-10 pb-16">
        <Outlet />
      </main>
    </div>
  )
}
