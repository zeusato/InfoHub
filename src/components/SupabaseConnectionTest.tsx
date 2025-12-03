import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { validateSupabaseConfig } from '../lib/supabase-config'

/**
 * Component để test và hiển thị Supabase connection status
 * Thêm component này vào App để verify connection
 */
export function SupabaseConnectionTest() {
    const [status, setStatus] = useState<{
        configured: boolean
        connected: boolean
        error?: string
        tables: {
            articles: number
            slides: number
            menuItems: number
        }
    }>({
        configured: false,
        connected: false,
        tables: {
            articles: 0,
            slides: 0,
            menuItems: 0
        }
    })

    useEffect(() => {
        async function testConnection() {
            // Check configuration
            const config = validateSupabaseConfig()
            if (!config.valid) {
                setStatus({
                    configured: false,
                    connected: false,
                    error: `Missing: ${config.missing.join(', ')}`,
                    tables: { articles: 0, slides: 0, menuItems: 0 }
                })
                return
            }

            // Try to connect and query
            try {
                const [articlesRes, slidesRes, menuRes] = await Promise.all([
                    supabase.from('articles').select('id', { count: 'exact', head: true }),
                    supabase.from('slides').select('id', { count: 'exact', head: true }),
                    supabase.from('menu_items').select('id', { count: 'exact', head: true })
                ])

                setStatus({
                    configured: true,
                    connected: true,
                    tables: {
                        articles: articlesRes.count || 0,
                        slides: slidesRes.count || 0,
                        menuItems: menuRes.count || 0
                    }
                })
            } catch (error) {
                setStatus({
                    configured: true,
                    connected: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    tables: { articles: 0, slides: 0, menuItems: 0 }
                })
            }
        }

        testConnection()
    }, [])

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-white border-2 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start gap-3">
                {/* Status Icon */}
                <div className="flex-shrink-0 mt-1">
                    {!status.configured ? (
                        <div className="w-3 h-3 rounded-full bg-gray-400 animate-pulse"></div>
                    ) : status.connected ? (
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    ) : (
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    )}
                </div>

                {/* Status Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">
                        Supabase Connection
                    </h3>

                    {!status.configured ? (
                        <div className="text-xs text-gray-600">
                            ⚠️ Not configured
                            {status.error && (
                                <div className="mt-1 text-red-600">{status.error}</div>
                            )}
                        </div>
                    ) : status.connected ? (
                        <div className="text-xs space-y-1">
                            <div className="text-green-600 font-medium">✅ Connected</div>
                            <div className="text-gray-600 space-y-0.5">
                                <div>📄 Articles: {status.tables.articles}</div>
                                <div>🎨 Slides: {status.tables.slides}</div>
                                <div>📋 Menu: {status.tables.menuItems}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs space-y-1">
                            <div className="text-red-600 font-medium">❌ Connection Failed</div>
                            {status.error && (
                                <div className="text-gray-600 break-words">{status.error}</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SupabaseConnectionTest
