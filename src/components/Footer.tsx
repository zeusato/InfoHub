import TradingViewWidget from "@/components/Index/TradingViewWidget";

export default function Footer() {
  return (
    <footer className="glass rounded-2xl px-4 py-3 flex items-center gap-3 text-sm text-zinc-400">
      <div className="basis-[200px] shrink-0 hidden md:block">
        © {new Date().getFullYear()} SHS — InfoHub
      </div>

      <div className="flex-1 min-w-0">
        {/* tuỳ chiều cao ticker */}
        <div className="flex-1 min-w-0 flex items-center h-[46px]">
          <TradingViewWidget refreshMs={1000} />
        </div>
      </div>

      <div className="basis-[100px] shrink-0 text-brand text-right font-semibold hidden md:block">
        Made with ♥
      </div>
    </footer>
  )
}
