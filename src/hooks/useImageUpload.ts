// Image upload utility hook
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useImageUpload() {
    const [uploading, setUploading] = useState(false)

    const uploadImage = async (file: File, folder: string): Promise<string> => {
        setUploading(true)
        try {
            // Generate filename: folder/timestamp-filename
            const timestamp = Date.now()
            const fileName = `${folder}/${timestamp}-${file.name.replace(/\s+/g, '-')}`

            const { data, error } = await supabase.storage
                .from('infohub-images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true // Overwrite if exists
                })

            if (error) throw error

            // Return relative path (not full URL)
            return fileName
        } finally {
            setUploading(false)
        }
    }

    return { uploadImage, uploading }
}
