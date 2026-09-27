import { Routes, Route, Link } from 'react-router-dom'
import LocationsPage from './pages/LocationsPage'
import UnitsPage from './pages/UnitsPage'

function App() {
  return (
    <div className="min-h-screen bg-white text-brand-black">
      <header className="p-4 border-b border-gray-200">
        <Link to="/">
          <h1 className="text-xl font-bold">YoungTaks BNBs</h1>
          <p className="text-sm text-gray-500">Your Trusted Booking Partner</p>
        </Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<LocationsPage />} />
          <Route path="/locations/:locationId" element={<UnitsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
