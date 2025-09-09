export default function NewsReleaseNotes({ title }: { title: string }) {
  return (
    <article className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4">
          <h3 className="font-semibold text-brand">Cải tiến</h3>
          <ul className="list-disc pl-5 text-zinc-300">
            <li>Nâng cấp hiệu năng tải trang.</li>
            <li>Cải thiện tính ổn định của hệ thống.</li>
          </ul>
        </div>
        <div className="glass rounded-xl p-4">
          <h3 className="font-semibold text-brand">Sửa lỗi</h3>
          <ul className="list-disc pl-5 text-zinc-300">
            <li>Fix hiển thị trên màn hình nhỏ.</li>
            <li>Fix không tương thích trình duyệt cũ.</li>
          </ul>
        </div>
      </div>
    </article>
  )
}
