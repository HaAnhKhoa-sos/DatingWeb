import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Navbar({ session }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow mb-4">
      <div className="max-w-3xl mx-auto p-4 flex justify-between items-center">
        <div className="text-xl font-bold text-pink-600">DatingApp</div>
        {session && (
          <div className="flex gap-4 text-sm items-center">
            <Link to="/discover" className="text-blue-600 hover:underline">🔍 Discover</Link>
            <Link to="/matches" className="text-blue-600 hover:underline">❤️ Matches</Link>
            <Link to="/profile" className="text-blue-600 hover:underline">👤 Profile</Link>
            <button onClick={handleLogout} className="text-red-500 hover:underline">🚪 Logout</button>
          </div>
        )}
      </div>
    </nav>
  )
}
