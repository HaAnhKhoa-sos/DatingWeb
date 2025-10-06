import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ProfileCard from '../components/ProfileCard'
import { Link } from 'react-router-dom'

export default function Matches({ session }) {
  const [matchedProfiles, setMatchedProfiles] = useState([])

  useEffect(() => {
    const fetchMatches = async () => {
      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user_a.eq.${session.user.id},user_b.eq.${session.user.id}`)

      if (error) {
        console.error('Lỗi khi lấy danh sách matches:', error.message)
        return
      }

      const matchedIds = matches.map(m =>
        m.user_a === session.user.id ? m.user_b : m.user_a
      )

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, bio, avatar_url')
        .in('id', matchedIds)

      setMatchedProfiles(profiles || [])
    }

    fetchMatches()
  }, [session])

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">❤️ Ghép đôi thành công</h3>
      <div className="grid grid-cols-1 gap-4">
        {matchedProfiles.map(p => (
          <div key={p.id} className="bg-white shadow rounded p-4 flex items-center justify-between">
            <ProfileCard profile={p} currentUserId={session.user.id} />
            <Link
              to={`/chat/${p.id}`}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              💬 Chat
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
