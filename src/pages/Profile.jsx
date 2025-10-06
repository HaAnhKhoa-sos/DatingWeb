import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Profile({ session }) {
  const user = session.user
  const [profile, setProfile] = useState({})

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(data || { id: user.id, display_name: '', bio: '', avatar_url: '' })
    })()
  }, [user])

  async function save() {
    const { error } = await supabase.from('profiles').upsert(profile)
    if (error) alert(error.message)
    else alert('Đã lưu hồ sơ 🎉')
  }

  function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result
      setProfile(p => ({ ...p, avatar_url: base64 }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="bg-white shadow p-6 rounded mb-6">
      <h3 className="text-lg font-semibold mb-4">🧑 Hồ sơ cá nhân</h3>

      <div className="flex items-center gap-4 mb-4">
        <img
          src={profile.avatar_url || 'https://placehold.co/80x80'}
          alt="avatar"
          className="w-20 h-20 rounded-full object-cover"
        />
        <input type="file" accept="image/*" onChange={handleAvatarUpload} />
      </div>

      <label className="block mb-1 font-medium">Tên hiển thị</label>
      <input
        value={profile.display_name || ''}
        onChange={e => setProfile({ ...profile, display_name: e.target.value })}
        className="w-full p-2 border rounded mb-4"
        placeholder="VD: 17-Hà"
      />

      <label className="block mb-1 font-medium">Giới thiệu bản thân</label>
      <textarea
        value={profile.bio || ''}
        onChange={e => setProfile({ ...profile, bio: e.target.value })}
        className="w-full p-2 border rounded mb-4"
        placeholder="Sở thích, tính cách, v.v."
      />

      <button
        onClick={save}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        💾 Lưu thông tin
      </button>
    </div>
  )
}
