// src/components/HamburgerButton.tsx
type Props = {
  isOpen: boolean
  onClick: () => void
}

export default function HamburgerButton({ isOpen, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed top-5 left-4 z-50 p-2 rounded-lg glass hover:bg-white/10 transition-all"
      aria-label="Toggle menu"
    >
      <div className="w-6 h-5 flex flex-col justify-between">
        <span
          className={`block h-0.5 w-full bg-[var(--text-primary)] transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''
            }`}
        />
        <span
          className={`block h-0.5 w-full bg-[var(--text-primary)] transition-all duration-300 ${isOpen ? 'opacity-0' : ''
            }`}
        />
        <span
          className={`block h-0.5 w-full bg-[var(--text-primary)] transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
        />
      </div>
    </button>
  )
}
