import { useEffect } from 'react'

export default function NewsModal({ article, tag, emoji, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!article) return null

  const { title, description, image_url, source_name, link, pubDate } = article
  const formattedDate = pubDate
    ? new Date(pubDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gray-900 border border-gray-700/50 shadow-2xl animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-800/80 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Tag + Source header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-3">
          <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider bg-news-500/15 text-news-400 border border-news-500/20">
            {tag}
          </span>
          {source_name && (
            <span className="text-xs text-gray-500">via {source_name}</span>
          )}
        </div>

        {/* Title + Date */}
        <div className="px-6 pb-4">
          <h2 className="text-xl font-bold text-gray-100 leading-tight">
            <span dangerouslySetInnerHTML={{ __html: emoji }} />{' '}
            {title}
          </h2>
          {formattedDate && (
            <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
          )}
        </div>

        {/* Image */}
        {image_url && (
          <div className="px-6 pb-4">
            <div className="rounded-xl overflow-hidden bg-gray-800/60">
              <img
                src={image_url}
                alt=""
                className="w-full max-h-80 object-cover"
                onError={(e) => { e.target.parentElement.style.display = 'none' }}
              />
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <div className="px-6 pb-5">
            <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 pb-6 flex items-center gap-3">
          {link && link !== '#' && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-news-600 hover:bg-news-500 text-white text-sm font-medium transition-all duration-200"
            >
              Read Original
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
