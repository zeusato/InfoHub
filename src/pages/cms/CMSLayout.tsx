// CMS Layout with sidebar navigation
import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
    Home,
    FileText,
    Menu as MenuIcon,
    HelpCircle,
    ImageIcon,
    Briefcase,
    LogOut,
    BarChart3
} from 'lucide-react'
import HamburgerButton from '@/components/HamburgerButton'

export default function CMSLayout() {
    const location = useLocation()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const navItems = [
        { path: '/CMS', label: 'Dashboard', icon: Home },
        { path: '/CMS/articles', label: 'Articles', icon: FileText },
        { path: '/CMS/menu', label: 'Menu', icon: MenuIcon },
        { path: '/CMS/faq', label: 'FAQ', icon: HelpCircle },
        { path: '/CMS/carousel', label: 'Carousel', icon: ImageIcon },
        { path: '/CMS/workspace', label: 'Workspace', icon: Briefcase },
        { path: '/CMS/analytics', label: 'Analytics', icon: BarChart3 },
    ]

    const handleLogout = () => {
        // TODO: Implement logout
        navigate('/CMS/login')
    }

    // Close sidebar when clicking a nav item on mobile
    const handleNavClick = () => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(false)
        }
    }

    // Close sidebar on Escape key
    useEffect(() => {
        if (sidebarOpen) {
            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === 'Escape') setSidebarOpen(false)
            }
            window.addEventListener('keydown', handleEscape)
            return () => window.removeEventListener('keydown', handleEscape)
        }
    }, [sidebarOpen])

    return (
        <div className="flex h-screen bg-[#0b0b0d]">
            {/* Hamburger Menu Button (Mobile only) */}
            <HamburgerButton isOpen={sidebarOpen} onClick={() => setSidebarOpen(!sidebarOpen)} />

            {/* Mobile overlay backdrop */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside className={`w-64 border-r border-white/10 flex flex-col bg-[#0b0b0d] lg:static lg:translate-x-0 ${sidebarOpen ? 'sidebar-mobile open' : 'sidebar-mobile closed'}`}>
                <div className="p-4 border-b border-white/10">
                    <h1 className="text-xl font-bold text-brand">InfoHub CMS</h1>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={handleNavClick}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive
                                    ? 'bg-brand/20 text-brand border border-brand/40'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon size={18} />
                                <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 w-full transition-colors"
                    >
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    )
}
