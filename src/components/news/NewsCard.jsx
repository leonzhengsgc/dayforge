export default function NewsCard({ article, tag, emoji, onClick }) {
  const { title, description, image_url, source_name } = article

  return (
    <button
      onClick={() => onClick(article)}
      className="news-card hover:news-card-hover block overflow-hidden group text-left w-full cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="h-44 bg-gray-800/60 overflow-hidden relative">
        {image_url ? (
          <img
            src={image_url}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none'
              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div
          className={`w-full h-full items-center justify-center bg-gradient-to-br from-news-900/60 to-gray-900 absolute inset-0 ${image_url ? 'hidden' : 'flex'}`}
        >
          <span className="text-5xl opacity-30" dangerouslySetInnerHTML={{ __html: emoji }} />
        </div>
        {source_name && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-gray-300 font-medium">
            {source_name}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-100 leading-snug mb-2 group-hover:text-news-400 transition-colors duration-200" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          <span dangerouslySetInnerHTML={{ __html: emoji }} />{' '}
          {title}
        </h3>
        {description && (
          <p className="text-xs text-gray-400 leading-relaxed mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {description}
          </p>
        )}
        <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider bg-news-500/10 text-news-400 border border-news-500/20">
          {tag}
        </span>
      </div>
    </button>
  )
}
