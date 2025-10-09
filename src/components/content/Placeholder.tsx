export default function Placeholder({ title, path }: { title: string, path: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-zinc-400 mt-2">Path: <code className="text-brand">{path}</code></p>
      <div className="mt-4 glass rounded-xl p-4">
        Comming soon...
      </div>
    </div>
  )
}
