// src/hooks/usePWAInstall.ts
import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent
    }
}

// Store the event globally so it persists across component remounts
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null

export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt)
    const [isInstallable, setIsInstallable] = useState(globalDeferredPrompt !== null)
    const [isInstalled, setIsInstalled] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        // Detect iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        setIsIOS(iOS)

        // Check if already running as installed PWA (standalone mode)
        const standalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone === true
        setIsStandalone(standalone)

        if (standalone) {
            setIsInstalled(true)
            return
        }

        // Capture the install prompt event and PREVENT default browser prompt
        const handleBeforeInstall = (e: BeforeInstallPromptEvent) => {
            console.log('[PWA] beforeinstallprompt event captured')
            e.preventDefault() // Chặn prompt mặc định của browser
            globalDeferredPrompt = e
            setDeferredPrompt(e)
            setIsInstallable(true)
        }

        // Handle app installed event
        const handleAppInstalled = () => {
            console.log('[PWA] App installed')
            setIsInstalled(true)
            setIsInstallable(false)
            globalDeferredPrompt = null
            setDeferredPrompt(null)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstall)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [])

    const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
        const prompt = deferredPrompt || globalDeferredPrompt

        if (!prompt) {
            console.log('[PWA] No install prompt available')
            return 'unavailable'
        }

        try {
            console.log('[PWA] Triggering install prompt')
            await prompt.prompt()
            const { outcome } = await prompt.userChoice
            console.log('[PWA] User choice:', outcome)

            if (outcome === 'accepted') {
                setIsInstalled(true)
            }

            // Clear the prompt - can only be used once
            globalDeferredPrompt = null
            setDeferredPrompt(null)
            setIsInstallable(false)

            return outcome
        } catch (error) {
            console.error('[PWA] Install prompt error:', error)
            return 'unavailable'
        }
    }, [deferredPrompt])

    return {
        isInstallable,  // true if native prompt is available
        isInstalled,    // true if running as installed PWA
        isIOS,          // true if iOS device
        isStandalone,   // true if running in standalone mode
        promptInstall   // function to trigger native install prompt
    }
}
