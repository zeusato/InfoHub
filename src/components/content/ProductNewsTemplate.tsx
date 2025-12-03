// src/components/content/ProductNewsTemplate.tsx
type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }

type Props = {
  title: string
  subtitle?: string
  bannerImg?: string
  content: ContentBlock[]
  /**
   * Raw HTML content from Quill editor. When provided, this field will be
   * rendered directly as HTML inside the article. This allows rich
   * formatting such as links and images to be preserved. When absent,
   * the component falls back to rendering the structured `content` array.
   */
  contentHtml?: string
  endingNote?: string
}

export default function ProductNewsTemplate({
  title,
  subtitle,
  bannerImg,
  content,
  contentHtml,
  endingNote,
}: Props) {
  return (
    <article className="prose prose-invert max-w-none">
      {/* Title & subtitle */}
      <h1 className="text-3xl font-extrabold text-left">{title}</h1>
      {subtitle && <p className="text-sm text-zinc-400 mb-4">{subtitle}</p>}

      {/* Banner image */}
      {bannerImg && (
        <img
          src={bannerImg.startsWith('http') ? bannerImg : new URL(`../../assets/${bannerImg}`, import.meta.url).href}
          alt={title}
          className="rounded-xl my-4"
        />
      )}

      {/* Main content - hiển thị CẢ content blocks VÀ contentHtml */}

      {/* Render content blocks (plain text) nếu có */}
      {content && content.length > 0 && (
        <div className="mb-6">
          {content.map((block, i) => {
            if (block.type === 'paragraph') {
              return <p key={i}>{block.text}</p>
            }
            if (block.type === 'table') {
              return (
                <div key={i} className="overflow-x-auto my-4">
                  <table className="table-auto border-collapse w-full text-sm">
                    <thead>
                      <tr>
                        {block.headers.map((h, j) => (
                          <th
                            key={j}
                            className="border border-white/20 px-3 py-2 text-left bg-white/5"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row, r) => (
                        <tr key={r}>
                          {row.map((cell, c) => (
                            <td
                              key={c}
                              className="border border-white/10 px-3 py-2 text-zinc-200"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
            return null
          })}
        </div>
      )}

      {/* Render contentHtml (formatted HTML) nếu có */}
      {contentHtml && (
        /* eslint-disable react/no-danger */
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      )}

      {/* Ending note */}
      {endingNote && (
        <div className="mt-6 italic text-zinc-400">{endingNote}</div>
      )}
    </article>
  )
}
