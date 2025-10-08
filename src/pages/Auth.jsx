import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaLock } from 'react-icons/fa'
import { motion } from 'framer-motion'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()

  async function handleAuth() {
    if (!email || !password) return alert('Nhập đầy đủ email và mật khẩu')

    let result
    if (isLogin) {
      result = await supabase.auth.signInWithPassword({ email, password })
    } else {
      result = await supabase.auth.signUp({ email, password })
    }

    const { error } = result
    if (error) alert(error.message)
    else navigate('/profile')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white shadow p-6 rounded max-w-sm mx-auto mt-10">
        <h2 className="text-xl font-semibold mb-4 text-center">
          {isLogin ? 'Đăng nhập' : 'Đăng ký'}
        </h2>

        <div className="flex items-center border rounded mb-3 px-3 py-2">
          <FaUser className="text-gray-500 mr-2" />
          <input
            className="w-full outline-none"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="flex items-center border rounded mb-3 px-3 py-2">
          <FaLock className="text-gray-500 mr-2" />
          <input
            className="w-full outline-none"
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded w-full mb-2 hover:bg-blue-700 transition"
          onClick={handleAuth}
        >
          {isLogin ? 'Đăng nhập' : 'Đăng ký'}
        </button>

        <button
          className="text-sm text-blue-500 underline block text-center"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
        </button>
      </div>
    </motion.div>
  )
}
