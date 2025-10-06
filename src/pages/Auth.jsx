import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

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
    <div className="bg-white shadow p-6 rounded">
      <h2 className="text-xl font-semibold mb-4">
        {isLogin ? 'Đăng nhập' : 'Đăng ký'}
      </h2>

      <input
        className="w-full p-2 border rounded mb-3"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        className="w-full p-2 border rounded mb-3"
        type="password"
        placeholder="Mật khẩu"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button
        className="px-4 py-2 bg-blue-600 text-white rounded w-full mb-2"
        onClick={handleAuth}
      >
        {isLogin ? 'Đăng nhập' : 'Đăng ký'}
      </button>

      <button
        className="text-sm text-blue-500 underline"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
      </button>
    </div>
  )
}
