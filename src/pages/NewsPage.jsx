import { useState, useEffect } from 'react'
import AppShell from '../components/layout/AppShell'
import NewsCard from '../components/news/NewsCard'
import NewsModal from '../components/news/NewsModal'

// GNews free tier: 100 req/day, returns real articles with images & source links
const GNEWS_API = 'https://gnews.io/api/v4/search?q=artificial+intelligence+OR+AI+technology&lang=en&max=10&apikey=9a6e8b3c9f03bd0ddbafc76ab3b0e8e0'
// Fallback: NewsData.io
const NEWSDATA_API = 'https://newsdata.io/api/1/news?apikey=pub_84299c3aa9e4eb4a88c1b18a5a4a0eb891e94&q=artificial+intelligence+OR+AI+OR+machine+learning&language=en&category=technology&size=10'

function getRelativeDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return `${diff} days ago`
}

function formatDateHeading(dateStr) {
  const date = new Date(dateStr)
  const day = date.getDate()
  const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th'
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  return `${day}${suffix} ${month}`
}

function groupByDate(articles) {
  const groups = {}
  for (const article of articles) {
    const date = article.date?.split('T')[0] || new Date().toISOString().split('T')[0]
    if (!groups[date]) groups[date] = []
    groups[date].push(article)
  }
  return Object.entries(groups).sort(([a], [b]) => new Date(b) - new Date(a))
}

const CATEGORY_TAGS = ['AI RESEARCH', 'MACHINE LEARNING', 'GENERATIVE AI', 'LLM', 'COMPUTER VISION', 'ROBOTICS', 'AI POLICY', 'DEEP LEARNING', 'AI AGENTS', 'AI SAFETY']

function getTagForArticle(article, index) {
  const text = (article.title + ' ' + (article.description || '')).toLowerCase()
  if (text.includes('llm') || text.includes('language model') || text.includes('gpt') || text.includes('claude') || text.includes('chatgpt')) return 'LLM'
  if (text.includes('robot')) return 'ROBOTICS'
  if (text.includes('vision') || text.includes('image') || text.includes('video')) return 'COMPUTER VISION'
  if (text.includes('policy') || text.includes('regulation') || text.includes('ban') || text.includes('law') || text.includes('govern')) return 'AI POLICY'
  if (text.includes('agent')) return 'AI AGENTS'
  if (text.includes('safety') || text.includes('alignment') || text.includes('risk')) return 'AI SAFETY'
  if (text.includes('generat') || text.includes('diffusion') || text.includes('midjourney')) return 'GENERATIVE AI'
  if (text.includes('research') || text.includes('paper') || text.includes('study') || text.includes('benchmark')) return 'AI RESEARCH'
  if (text.includes('chip') || text.includes('nvidia') || text.includes('gpu') || text.includes('hardware')) return 'AI HARDWARE'
  if (text.includes('startup') || text.includes('funding') || text.includes('invest') || text.includes('billion')) return 'AI BUSINESS'
  return CATEGORY_TAGS[index % CATEGORY_TAGS.length]
}

function getEmojiForArticle(article) {
  const text = (article.title + ' ' + (article.source?.name || '')).toLowerCase()
  if (text.includes('openai')) return '&#x1F916;'
  if (text.includes('google')) return '&#x1F50D;'
  if (text.includes('meta')) return '&#x1F9E0;'
  if (text.includes('apple')) return '&#x1F34E;'
  if (text.includes('microsoft')) return '&#x1F4BB;'
  if (text.includes('nvidia')) return '&#x1F3AE;'
  if (text.includes('anthropic') || text.includes('claude')) return '&#x2728;'
  if (text.includes('amazon') || text.includes('aws')) return '&#x1F4E6;'
  const emojis = ['&#x26A1;', '&#x2699;', '&#x1F4A1;', '&#x1F680;', '&#x1F50C;', '&#x1F4CA;', '&#x1F310;', '&#x1F916;']
  return emojis[Math.abs(text.length) % emojis.length]
}

// Normalize different API response formats to a consistent shape
function normalizeGNews(articles) {
  return articles.map(a => ({
    title: a.title,
    description: a.description,
    date: a.publishedAt,
    image_url: a.image,
    source_name: a.source?.name || '',
    link: a.url,
  }))
}

function normalizeNewsData(articles) {
  return articles.map(a => ({
    title: a.title,
    description: a.description,
    date: a.pubDate,
    image_url: a.image_url,
    source_name: a.source_name || a.source_id || '',
    link: a.link,
  }))
}

export default function NewsPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('')

  useEffect(() => {
    async function fetchNews() {
      // Try GNews first (better images + source links)
      try {
        const res = await fetch(GNEWS_API)
        const data = await res.json()
        if (data.articles && data.articles.length > 0) {
          setArticles(normalizeGNews(data.articles))
          setLoading(false)
          return
        }
      } catch {}

      // Fallback to NewsData.io
      try {
        const res = await fetch(NEWSDATA_API)
        const data = await res.json()
        if (data.results && data.results.length > 0) {
          setArticles(normalizeNewsData(data.results))
          setLoading(false)
          return
        }
      } catch {}

      setLoading(false)
    }
    fetchNews()
  }, [])

  const grouped = groupByDate(articles)

  function openArticle(article, tag, emoji) {
    setSelectedArticle(article)
    setSelectedTag(tag)
    setSelectedEmoji(emoji)
  }

  return (
    <AppShell>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-news-500/10 border border-news-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-news-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">AI News</h1>
            <p className="text-sm text-gray-500">Top AI stories, refreshed daily</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-8">
            {[0, 1].map(g => (
              <div key={g}>
                <div className="h-6 w-40 bg-gray-800/40 rounded animate-shimmer mb-4" />
                <div className="news-grid grid grid-cols-1 gap-4">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="news-card overflow-hidden">
                      <div className="h-44 bg-gray-800/40 animate-shimmer" />
                      <div className="p-4 space-y-3">
                        <div className="h-5 bg-gray-800/40 rounded animate-shimmer" />
                        <div className="h-4 bg-gray-800/40 rounded animate-shimmer w-3/4" />
                        <div className="h-3 bg-gray-800/40 rounded animate-shimmer w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg className="w-16 h-16 text-gray-700 animate-float" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
            </svg>
            <p className="text-gray-500 text-sm font-medium mt-4">Could not load news right now</p>
            <p className="text-gray-600 text-xs mt-1">Try refreshing the page</p>
          </div>
        ) : (
          <div className="space-y-10">
            {grouped.map(([date, items]) => (
              <section key={date} className="animate-slide-up">
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-lg font-bold text-gray-200">{formatDateHeading(date)}</h2>
                  <span className="text-sm text-gray-600">{getRelativeDate(date)}</span>
                  <div className="flex-1 h-px bg-gray-800/60" />
                </div>
                <div className="news-grid grid grid-cols-1 gap-4">
                  {items.map((article, i) => {
                    const tag = getTagForArticle(article, i)
                    const emoji = getEmojiForArticle(article)
                    return (
                      <NewsCard
                        key={i}
                        article={article}
                        tag={tag}
                        emoji={emoji}
                        onClick={() => openArticle(article, tag, emoji)}
                      />
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {selectedArticle && (
        <NewsModal
          article={selectedArticle}
          tag={selectedTag}
          emoji={selectedEmoji}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </AppShell>
  )
}
