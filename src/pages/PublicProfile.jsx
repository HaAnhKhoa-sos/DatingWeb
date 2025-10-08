import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function PublicProfile() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, bio, avatar_url')
        .eq('id', id)
        .single()

      setProfile(data)
    }

    fetchProfile()
  }, [id])

  if (!profile) return <p className="text-center mt-10">Đang tải hồ sơ...</p>

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow p-6 rounded text-center">
      <img
        src={profile.avatar_url}
        alt="Avatar"
        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
      />
      <h2 className="text-xl font-bold mb-2">{profile.display_name}</h2>
      <p className="text-gray-600">{profile.bio}</p>
    </div>
  )
}
