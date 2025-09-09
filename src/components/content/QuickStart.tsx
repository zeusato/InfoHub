export default function QuickStart() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold">Bắt đầu nhanh</h1>
      <ol className="list-decimal pl-6 text-zinc-300 space-y-2">
        <li>Chọn danh mục ở menu trái.</li>
        <li>Vào mục con thấp nhất để xem nội dung.</li>
        <li>Dán component nội dung của đại ca vào khu vực này.</li>
      </ol>
      <div className="glass rounded-xl p-4 border-brand/40">
        Đây là vùng nội dung có thể scroll nếu dài.
      </div>
    </div>
  )
}
