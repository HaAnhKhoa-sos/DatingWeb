import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import dayjs from 'dayjs'

export default function Chat({ session }) {
  const { userId } = useParams()
  const currentUserId = session.user.id
  const [partner, setPartner] = useState(null)
  const [matchId, setMatchId] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchPartner()
    fetchMatch()
  }, [userId])

  useEffect(() => {
    if (!matchId) return

    fetchMessages()

    const channel = supabase
      .channel('chat-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        payload => {
          setMessages(prev => [...prev, payload.new])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'typing',
          filter: `match_id=eq.${matchId}`
        },
        payload => {
          const other = payload.new.user_id !== currentUserId
          if (other && payload.new.typing) {
            setIsTyping(true)
            setTimeout(() => setIsTyping(false), 3000)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
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

    if (!error) {
      setNewMessage('')
      await supabase.from('typing').upsert({
        match_id: matchId,
        user_id: currentUserId,
        typing: false,
        updated_at: new Date()
      })
    }
  }

  async function handleTyping() {
    await supabase.from('typing').upsert({
      match_id: matchId,
      user_id: currentUserId,
      typing: true,
      updated_at: new Date()
    })
  }

  return (
    <div className="bg-white shadow p-4 rounded max-w-2xl mx-auto mt-10">
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
              <p>{msg.content}</p>
              <div className="text-xs text-gray-500 text-right mt-1">
                {dayjs(msg.created_at).format('HH:mm')}
              </div>
            </div>
          </div>
        ))}
        {isTyping && <p className="text-sm text-gray-500">Đang nhắn...</p>}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={newMessage}
          onChange={e => {
            setNewMessage(e.target.value)
            handleTyping()
          }}
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
