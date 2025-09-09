export default function Footer() {
  return (
    <footer className="glass rounded-2xl px-4 py-3 text-sm text-zinc-400 flex items-center justify-between">
      <div>© {new Date().getFullYear()} SHS — InfoHub</div>
      <div className="text-brand font-semibold">Made with ♥</div>
    </footer>
  )
}
