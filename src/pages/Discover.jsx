import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ProfileCard from '../components/ProfileCard'

export default function Browse({ session }) {
  const [profiles, setProfiles] = useState([])

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, bio, avatar_url')
        .neq('id', session.user.id)
      setProfiles(data || [])
    })()
  }, [session])

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">💘 Khám phá người dùng</h3>
      <div className="grid grid-cols-1 gap-4">
        {profiles.map(p => (
          <ProfileCard key={p.id} profile={p} currentUserId={session.user.id} />
        ))}
      </div>
    </div>
  )
}
