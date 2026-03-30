import { useState, useEffect } from 'react'
import AppShell from '../components/layout/AppShell'
import NewsCard from '../components/news/NewsCard'
import NewsModal from '../components/news/NewsModal'

const AI_NEWS_API = 'https://newsdata.io/api/1/news?apikey=pub_84299c3aa9e4eb4a88c1b18a5a4a0eb891e94&q=artificial+intelligence+OR+AI+OR+machine+learning&language=en&category=technology&size=10'

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
    const date = article.pubDate?.split(' ')[0] || new Date().toISOString().split('T')[0]
    if (!groups[date]) groups[date] = []
    groups[date].push(article)
  }
  return Object.entries(groups).sort(([a], [b]) => new Date(b) - new Date(a))
}

const CATEGORY_TAGS = ['AI RESEARCH', 'MACHINE LEARNING', 'GENERATIVE AI', 'LLM', 'COMPUTER VISION', 'ROBOTICS', 'AI POLICY', 'DEEP LEARNING', 'AI AGENTS', 'AI SAFETY']

function getTagForArticle(article, index) {
  const text = (article.title + ' ' + (article.description || '')).toLowerCase()
  if (text.includes('llm') || text.includes('language model') || text.includes('gpt') || text.includes('claude')) return 'LLM'
  if (text.includes('robot')) return 'ROBOTICS'
  if (text.includes('vision') || text.includes('image')) return 'COMPUTER VISION'
  if (text.includes('policy') || text.includes('regulation') || text.includes('ban') || text.includes('law')) return 'AI POLICY'
  if (text.includes('agent')) return 'AI AGENTS'
  if (text.includes('safety') || text.includes('alignment')) return 'AI SAFETY'
  if (text.includes('generat')) return 'GENERATIVE AI'
  if (text.includes('research') || text.includes('paper') || text.includes('study')) return 'AI RESEARCH'
  return CATEGORY_TAGS[index % CATEGORY_TAGS.length]
}

function getEmojiForArticle(article) {
  const text = (article.title + ' ' + (article.source_name || '')).toLowerCase()
  if (text.includes('openai')) return '&#x1F916;'
  if (text.includes('google')) return '&#x1F50D;'
  if (text.includes('meta')) return '&#x1F9E0;'
  if (text.includes('apple')) return '&#x1F34E;'
  if (text.includes('microsoft')) return '&#x1F4BB;'
  if (text.includes('nvidia')) return '&#x1F3AE;'
  if (text.includes('anthropic') || text.includes('claude')) return '&#x2728;'
  const emojis = ['&#x26A1;', '&#x2699;', '&#x1F4A1;', '&#x1F680;', '&#x1F50C;', '&#x1F4CA;', '&#x1F310;', '&#x1F916;']
  return emojis[Math.abs(text.length) % emojis.length]
}

const MOCK_NEWS = [
  { title: 'Claude 4 sets new benchmarks across reasoning tasks', description: 'Anthropic released Claude 4 today, demonstrating significant improvements in mathematical reasoning, code generation, and long-context understanding compared to previous models.', pubDate: new Date().toISOString().split('T')[0] + ' 10:00:00', source_name: 'Anthropic Blog', image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=300&fit=crop', link: '#' },
  { title: 'OpenAI launches GPT-5 with real-time multimodal capabilities', description: 'The latest model from OpenAI can process video, audio, and text simultaneously in real-time, opening new possibilities for AI assistants and creative tools.', pubDate: new Date().toISOString().split('T')[0] + ' 09:00:00', source_name: 'The Verge', image_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=300&fit=crop', link: '#' },
  { title: 'Google DeepMind achieves breakthrough in protein folding prediction', description: 'AlphaFold 4 can now predict protein-protein interactions with near-experimental accuracy, potentially accelerating drug discovery by years.', pubDate: new Date().toISOString().split('T')[0] + ' 08:00:00', source_name: 'Nature', image_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=300&fit=crop', link: '#' },
  { title: 'Meta open-sources Llama 4 with 1T parameters', description: 'Meta continues its open-source AI strategy with Llama 4, featuring a mixture-of-experts architecture that runs efficiently on consumer hardware.', pubDate: new Date().toISOString().split('T')[0] + ' 07:00:00', source_name: 'Meta AI', image_url: 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=600&h=300&fit=crop', link: '#' },
  { title: 'EU passes comprehensive AI Act enforcement guidelines', description: 'The European Union has finalized detailed enforcement guidelines for its landmark AI Act, setting strict requirements for high-risk AI systems deployed in member states.', pubDate: new Date(Date.now() - 86400000).toISOString().split('T')[0] + ' 14:00:00', source_name: 'Reuters', image_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&h=300&fit=crop', link: '#' },
  { title: 'NVIDIA unveils next-gen AI chips at 2x performance per watt', description: "NVIDIA's new Blackwell Ultra architecture promises to double AI training throughput while halving energy consumption, addressing growing concerns about AI's carbon footprint.", pubDate: new Date(Date.now() - 86400000).toISOString().split('T')[0] + ' 12:00:00', source_name: 'TechCrunch', image_url: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=600&h=300&fit=crop', link: '#' },
  { title: 'Autonomous AI agents now handle 30% of customer service at Fortune 500 firms', description: 'A new survey reveals rapid adoption of AI agents in enterprise customer service, with leading companies reporting significant cost savings and improved satisfaction scores.', pubDate: new Date(Date.now() - 86400000).toISOString().split('T')[0] + ' 10:00:00', source_name: 'Bloomberg', image_url: 'https://images.unsplash.com/photo-1531746790095-e5995fef8f01?w=600&h=300&fit=crop', link: '#' },
  { title: 'Apple Intelligence expands to support third-party AI models', description: "Apple announces that iOS 27 will allow developers to integrate their own AI models into Siri and Apple Intelligence features, breaking the platform's walled garden approach.", pubDate: new Date(Date.now() - 172800000).toISOString().split('T')[0] + ' 16:00:00', source_name: 'Apple Newsroom', image_url: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=300&fit=crop', link: '#' },
  { title: 'Stanford HAI report: AI research spending hits $300B globally', description: 'The annual AI Index report shows record investment in AI research and development, with the US and China accounting for over 70% of global spending.', pubDate: new Date(Date.now() - 172800000).toISOString().split('T')[0] + ' 09:00:00', source_name: 'Stanford HAI', image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=300&fit=crop', link: '#' },
]

export default function NewsPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('')

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch(AI_NEWS_API)
        const data = await res.json()
        if (data.results && data.results.length > 0) {
          setArticles(data.results)
        } else {
          setArticles(MOCK_NEWS)
        }
      } catch {
        setArticles(MOCK_NEWS)
      } finally {
        setLoading(false)
      }
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
