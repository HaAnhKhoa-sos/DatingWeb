import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import { Link } from 'react-router-dom'
import ProfileCard from '../components/ProfileCard'

export default function Discover({ session }) {
  const [profiles, setProfiles] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data: likes } = await supabase
        .from('likes')
        .select('to_user')
        .eq('from_user', session.user.id)

      const likedIds = likes?.map(l => l.to_user) || []

      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, bio, avatar_url')
        .neq('id', session.user.id)
        .not('id', 'in', `(${likedIds.join(',')})`)

      setProfiles(data || [])
    }

    fetchProfiles()
  }, [session])

  const handleLike = async () => {
    const current = profiles[currentIndex]
    if (!current) return

    // 1. Lưu lượt like
    await supabase.from('likes').insert({
      from_user: session.user.id,
      to_user: current.id
    })

    // 2. Kiểm tra đối phương đã like lại chưa
    const { data: reverseLike } = await supabase
      .from('likes')
      .select('*')
      .eq('from_user', current.id)
      .eq('to_user', session.user.id)
      .single()

    if (reverseLike) {
      // 3. Tạo match
      await supabase.from('matches').insert({
        user_a: session.user.id,
        user_b: current.id
      })

      // 4. Hiện thông báo match
      alert(`🎉 Bạn đã match với ${current.display_name}!`)
    }

    // 5. Chuyển sang người tiếp theo
    setCurrentIndex(prev => prev + 1)
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrentIndex(prev => prev + 1),
    onSwipedRight: () => setCurrentIndex(prev => prev + 1),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  })

  const currentProfile = profiles[currentIndex]

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold text-center mb-6">💘 Khám phá người dùng</h2>

      {currentProfile ? (
        <div {...swipeHandlers}>
          <AnimatePresence>
            <motion.div
              key={currentProfile.id}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white shadow-lg rounded-lg p-6"
            >
              <ProfileCard profile={currentProfile} currentUserId={session.user.id} />

              <div className="flex justify-between mt-6">
                <Link
                  to={`/profile/${currentProfile.id}`}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  👀 Xem hồ sơ
                </Link>
                <button
                  onClick={handleLike}
                  className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
                >
                  ❤️ Thích
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <p className="text-center text-gray-500">Bạn đã khám phá hết người dùng rồi 😅</p>
      )}
    </div>
  )
}
