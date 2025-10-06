import React from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ProfileCard({ profile, currentUserId }) {
  async function handleLike() {
    const { data: existing } = await supabase
      .from('likes')
      .select('*')
      .eq('from_user', currentUserId)
      .eq('to_user', profile.id)
      .single()

    if (existing) return alert('Bạn đã thích người này rồi!')

    await supabase.from('likes').insert({
      from_user: currentUserId,
      to_user: profile.id
    })

    // Kiểm tra xem người kia đã thích bạn chưa
    const { data: reverseLike } = await supabase
      .from('likes')
      .select('*')
      .eq('from_user', profile.id)
      .eq('to_user', currentUserId)
      .single()

    if (reverseLike) {
      await supabase.from('matches').insert({
        user_a: currentUserId,
        user_b: profile.id
      })
      alert('🎉 Ghép đôi thành công!')
    } else {
      alert('Đã thích! Nếu người kia cũng thích bạn, sẽ ghép đôi.')
    }
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex items-center gap-4 hover:shadow-lg transition">
      <img
        src={profile.avatar_url || 'https://placehold.co/80x80'}
        alt="avatar"
        className="w-16 h-16 rounded-full object-cover border"
      />
      <div className="flex-1">
        <div className="font-semibold text-lg text-pink-600">
          {profile.display_name || 'Ẩn danh'}
        </div>
        <div className="text-sm text-gray-700 italic">
          {profile.bio || 'Chưa có giới thiệu'}
        </div>
      </div>
      <button
        onClick={handleLike}
        className="px-3 py-1 bg-pink-500 text-white rounded hover:bg-pink-600 text-sm"
      >
        ❤️ Thích
      </button>
    </div>
  )
}
