import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Navbar'
import Auth from './Auth'
import Profile from './Profile'
import Discover from './Discover'
import Matches from './Matches'
import Chat from './Chat'
export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    supabase.auth.onAuthStateChange((_event, session) => setSession(session))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar session={session} />
      <main className="max-w-3xl mx-auto p-4">
        <Routes>
          {!session ? (
            <>
              <Route path="/login" element={<Auth />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          ) : (
            <>
            <Route path="/chat/:userId" element={<Chat session={session} />} />
              <Route path="/discover" element={<Discover session={session} />} />
              <Route path="/matches" element={<Matches session={session} />} />
              <Route path="/profile" element={<Profile session={session} />} />
              <Route path="*" element={<Navigate to="/profile" />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  )
}
