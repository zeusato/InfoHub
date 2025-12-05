// src/hooks/usePWAInstall.ts
import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent
    }
}

export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isInstallable, setIsInstallable] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // Check if already installed (standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
            return
        }

        // Capture the install prompt event and PREVENT default browser prompt
        const handleBeforeInstall = (e: BeforeInstallPromptEvent) => {
            e.preventDefault() // Chặn prompt mặc định của browser
            setDeferredPrompt(e)
            setIsInstallable(true)
        }

        // Handle app installed event
        const handleAppInstalled = () => {
            setIsInstalled(true)
            setIsInstallable(false)
            setDeferredPrompt(null)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstall)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [])

    const promptInstall = async () => {
        if (!deferredPrompt) return false

        try {
            await deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice

            if (outcome === 'accepted') {
                setIsInstalled(true)
            }

            // Clear the prompt - can only be used once
            setDeferredPrompt(null)
            setIsInstallable(false)

            return outcome === 'accepted'
        } catch (error) {
            console.error('Install prompt error:', error)
            return false
        }
    }

    return {
        isInstallable,
        isInstalled,
        promptInstall
    }
}
