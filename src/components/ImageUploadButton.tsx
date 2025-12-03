import { useState, useRef } from 'react'
import { Upload, Check, Loader2 } from 'lucide-react'
import { useImageUpload } from '@/hooks/useImageUpload'

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

type Props = {
    folder: 'hdsd' | 'banners' | 'workspace' | 'faqs'
    onUploadComplete: (path: string) => void
    label?: string
    accept?: string
    multiple?: boolean
    onProgress?: (percent: number) => void
    onStatusChange?: (status: UploadStatus) => void
}

export function ImageUploadButton({
    folder,
    onUploadComplete,
    label = 'Upload',
    accept = 'image/*',
    multiple = false,
    onProgress,
    onStatusChange
}: Props) {
    const { uploadImage, uploading } = useImageUpload()
    const progressInterval = useRef<NodeJS.Timeout>()

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        try {
            // Start upload
            onStatusChange?.('uploading')
            onProgress?.(0)

            // Simulate progress
            let progress = 0
            progressInterval.current = setInterval(() => {
                progress += Math.random() * 10
                if (progress > 90) progress = 90
                onProgress?.(Math.round(progress))
            }, 200)

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

            // Complete
            clearInterval(progressInterval.current)
            onProgress?.(100)
            onStatusChange?.('success')

            // Reset status after delay
            setTimeout(() => {
                onStatusChange?.('idle')
                onProgress?.(0)
            }, 3000)

        } catch (error: any) {
            clearInterval(progressInterval.current)
            onStatusChange?.('error')
            console.error('Upload failed:', error)
            alert('Upload failed: ' + error.message) // Keep alert only for error
        }
    }

    return (
        <label className={`inline-flex items-center gap-2 px-3 py-2 border border-brand/40 bg-brand/20 text-brand rounded-lg cursor-pointer hover:bg-brand/30 transition-colors text-sm ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
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
