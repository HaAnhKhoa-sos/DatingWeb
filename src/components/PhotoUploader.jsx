import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import sanitizeFileName from '../utils/sanitizeFileName'

export default function PhotoUploader({ profileId, onUploaded }) {
  const [uploading, setUploading] = useState(false)

  async function handleChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const clean = sanitizeFileName(file.name)
    const filePath = `${profileId}/${Date.now()}-${clean}`

    const { error: uploadError } = await supabase.storage.from('user-photos').upload(filePath, file)
    if (uploadError) {
      alert('Lỗi upload: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('user-photos').getPublicUrl(filePath)
    const publicUrl = urlData.publicUrl

    const { data: inserted, error: insertError } = await supabase
      .from('photos')
      .insert({ profile_id: profileId, url: publicUrl })
      .select()
      .single()

    if (insertError) {
      alert('Lỗi lưu DB: ' + insertError.message)
    } else {
      if (onUploaded) onUploaded(inserted)
    }

    setUploading(false)
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleChange} disabled={uploading} />
      {uploading && <div className="text-sm text-gray-500">Đang upload...</div>}
    </div>
  )
}
