// Reusable Image Upload Button Component
import { useState } from 'react'
import { Upload } from 'lucide-react'
import { useImageUpload } from '@/hooks/useImageUpload'

type Props = {
    folder: 'hdsd' | 'banners' | 'workspace' | 'faqs'
    onUploadComplete: (path: string) => void
    label?: string
    accept?: string
    multiple?: boolean
}

export function ImageUploadButton({ folder, onUploadComplete, label = 'Upload', accept = 'image/*', multiple = false }: Props) {
    const { uploadImage, uploading } = useImageUpload()

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        try {
            if (multiple) {
                const paths: string[] = []
                for (let i = 0; i < files.length; i++) {
                    const path = await uploadImage(files[i], folder)
                    paths.push(path)
                }
                onUploadComplete(paths.join(', '))
            } else {
                const path = await uploadImage(files[0], folder)
                onUploadComplete(path)
            }
            alert('Upload success!')
        } catch (error: any) {
            alert('Upload failed: ' + error.message)
        }
    }

    return (
        <label className={`inline-flex items-center gap-2 px-3 py-2 border border-brand/40 bg-brand/20 text-brand rounded-lg cursor-pointer hover:bg-brand/30 transition-colors text-sm ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Upload size={16} />
            {uploading ? 'Uploading...' : label}
            <input
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
            />
        </label>
    )
}
