import TradingViewWidget from "@/components/Index/TradingViewWidget";

export default function Footer() {
  return (
    <footer className="glass rounded-2xl px-4 py-3 text-sm text-zinc-400 flex items-center justify-between">
      <div className="min-w-[200px]">© {new Date().getFullYear()} SHS — InfoHub</div>
      <TradingViewWidget/>
      <div className="text-brand text-right font-semibold min-w-[200px]">Made with ♥</div>
    </footer>
  )
}
