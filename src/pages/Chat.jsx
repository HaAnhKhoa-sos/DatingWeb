import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Chat({ session }) {
  const { userId } = useParams()
  const currentUserId = session.user.id
  const [partner, setPartner] = useState(null)
  const [matchId, setMatchId] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchPartner()
    fetchMatch()
  }, [userId])

  useEffect(() => {
    if (matchId) {
      fetchMessages()
      const channel = supabase
        .channel('chat')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        }, payload => {
          setMessages(prev => [...prev, payload.new])
        })
        .subscribe()

      return () => supabase.removeChannel(channel)
    }
  }, [matchId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchPartner() {
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .eq('id', userId)
      .single()
    setPartner(data)
  }

  async function fetchMatch() {
    const { data: match } = await supabase
      .from('matches')
      .select('id')
      .or(`user_a.eq.${currentUserId},user_b.eq.${currentUserId}`)
      .in('user_a', [currentUserId, userId])
      .in('user_b', [currentUserId, userId])
      .single()

    if (match) setMatchId(match.id)
  }

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  async function sendMessage() {
    if (!newMessage.trim()) return
    const { error } = await supabase.from('messages').insert({
      match_id: matchId,
      sender_id: currentUserId,
      content: newMessage
    })
    if (error) console.error('Lỗi gửi tin nhắn:', error.message)
    else setNewMessage('')
  }

  return (
    <div className="bg-white shadow p-4 rounded max-w-2xl mx-auto">
      {partner && (
        <div className="flex items-center gap-3 mb-4">
          <img
            src={partner.avatar_url || 'https://placehold.co/40x40'}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <h3 className="text-lg font-semibold">{partner.display_name}</h3>
        </div>
      )}

      <div className="h-80 overflow-y-auto border rounded p-3 bg-gray-50 mb-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex mb-2 ${
              msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                msg.sender_id === currentUserId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder="Nhập tin nhắn..."
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Gửi
        </button>
      </div>
    </div>
  )
}
