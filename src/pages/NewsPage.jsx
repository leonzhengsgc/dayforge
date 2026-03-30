import { useState, useEffect } from 'react'
import AppShell from '../components/layout/AppShell'
import NewsCard from '../components/news/NewsCard'
import NewsModal from '../components/news/NewsModal'

// Real RSS feeds via rss2json.com — free, no key needed, CORS-safe
const RSS2JSON = 'https://api.rss2json.com/v1/api.json'
const RSS_FEEDS = [
  { url: 'https://rss.beehiiv.com/feeds/2R3C6Bt5wj.xml', source: 'The Rundown AI' },
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', source: 'The Verge' },
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch' },
  { url: 'https://www.wired.com/feed/category/artificial-intelligence/latest/rss', source: 'Wired' },
  { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', source: 'Ars Technica' },
  { url: 'https://www.technologyreview.com/feed/', source: 'MIT Tech Review' },
  { url: 'https://venturebeat.com/category/ai/feed/', source: 'VentureBeat' },
]

function stripHTML(html) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim()
}

function extractImage(item) {
  // 1. Direct thumbnail
  if (item.thumbnail && item.thumbnail.startsWith('http')) return item.thumbnail
  // 2. Enclosure with image type or image URL
  if (item.enclosure?.link && (item.enclosure.type?.startsWith('image') || item.enclosure.link.match(/\.(jpg|jpeg|png|webp|gif)/i))) {
    return item.enclosure.link
  }
  // 3. First <img src="..."> in full content
  const allHtml = (item.content || '') + (item.description || '')
  const srcMatch = allHtml.match(/src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp|gif)[^"']*)/i)
  if (srcMatch?.[1]) return srcMatch[1]
  // 4. Any https image URL anywhere in the text
  const urlMatch = allHtml.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)/i)
  if (urlMatch) return urlMatch[0]
  return null
}

function normalizeRSS(items, sourceName) {
  return items
    .filter(item => item.title && item.link)
    .map(item => ({
      title: stripHTML(item.title),
      description: stripHTML(item.description || item.content || '').slice(0, 400),
      date: item.pubDate || new Date().toISOString(),
      image_url: extractImage(item),
      source_name: sourceName,
      link: item.link,
    }))
}

// Static fallback articles — shown when both APIs are unavailable
const today = new Date().toISOString()
const yesterday = new Date(Date.now() - 86400000).toISOString()
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString()

const MOCK_ARTICLES = [
  {
    title: 'OpenAI Releases GPT-5 with Unprecedented Reasoning Capabilities',
    description: 'The latest model from OpenAI demonstrates human-level performance on graduate-level math, coding benchmarks, and complex multi-step reasoning tasks that stumped previous generations. The model scored 95th percentile on the Bar Exam and achieved perfect scores on several graduate-level science benchmarks. OpenAI says GPT-5 is their most capable model yet, and the first to demonstrate what they call "reliable reasoning" across domains — able to catch its own mistakes and self-correct mid-response.',
    date: today,
    image_url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
    source_name: 'The Verge',
    link: 'https://theverge.com/ai-artificial-intelligence',
  },
  {
    title: 'Google DeepMind Achieves Breakthrough in Protein Structure Prediction',
    description: "Building on AlphaFold's success, DeepMind's new model can now predict the structure of entire protein complexes in seconds, potentially accelerating drug discovery by decades. The new system — AlphaFold 3 — extends beyond single proteins to model DNA, RNA, and small molecules simultaneously. Researchers at institutions worldwide are already using the system to identify new drug candidates for diseases including Alzheimer's and antibiotic-resistant bacteria.",
    date: today,
    image_url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80',
    source_name: 'Nature',
    link: 'https://nature.com/subjects/machine-learning',
  },
  {
    title: 'Anthropic\'s Claude Now Powers Over 1,000 Enterprise Applications',
    description: "Claude's API usage has surged as Fortune 500 companies integrate the AI assistant into customer service, legal document review, and software development pipelines. Anthropic reported a 10x increase in API calls year-over-year. The company has also launched Claude for Work, a new product tier that gives teams shared memory, custom instructions, and usage analytics. Industries seeing the highest adoption include financial services, healthcare documentation, and legal tech.",
    date: today,
    image_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
    source_name: 'TechCrunch',
    link: 'https://techcrunch.com/category/artificial-intelligence/',
  },
  {
    title: 'New EU AI Act Enforcement Guidelines Take Effect — What It Means for Developers',
    description: 'The European Union has published detailed enforcement guidelines for the AI Act, outlining compliance requirements for high-risk AI systems and the penalties for non-compliance. Developers building AI systems for healthcare, critical infrastructure, law enforcement, and education are most affected. The guidelines set out a tiered risk framework, with fines of up to €35 million or 7% of global annual revenue for the most serious violations. Companies have 12 months to bring existing systems into compliance.',
    date: today,
    image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
    source_name: 'Wired',
    link: 'https://wired.com/category/artificial-intelligence/',
  },
  {
    title: 'NVIDIA Unveils Next-Generation Blackwell Ultra GPU Architecture',
    description: "NVIDIA's latest GPU architecture delivers 4x the inference performance of its predecessor, with specialized tensor cores designed specifically for large language model workloads. The Blackwell Ultra chips feature 288GB of HBM3e memory per GPU and a new NVLink interconnect that allows up to 576 GPUs to act as a single massive accelerator. CEO Jensen Huang announced the chips will begin shipping to cloud providers in Q3, with consumer variants to follow in 2025.",
    date: yesterday,
    image_url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80',
    source_name: 'Ars Technica',
    link: 'https://arstechnica.com/ai/',
  },
  {
    title: 'Mistral AI Raises $600M Series C to Compete with OpenAI and Google',
    description: "The French AI startup continues its rapid growth with a new funding round that values the company at $6 billion, funding expansion of its open-weight model lineup and a new European data centre. Mistral has positioned itself as the open-source alternative to proprietary models, releasing powerful models that companies can run on their own infrastructure. The new funding will accelerate their multimodal roadmap and enterprise sales efforts across the US and Asia Pacific.",
    date: yesterday,
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    source_name: 'Financial Times',
    link: 'https://ft.com/artificial-intelligence',
  },
  {
    title: 'Researchers Develop AI Agent That Autonomously Fixes Security Vulnerabilities',
    description: 'A new AI agent from MIT CSAIL can scan codebases, identify CVEs, write patches, and submit pull requests — all without human intervention, achieving 78% accuracy on real-world bugs. The system, called AXON, uses a combination of static analysis, fuzzing, and a fine-tuned LLM to understand root causes rather than just symptoms. In a study of 1,000 open-source repositories, AXON fixed 78% of confirmed vulnerabilities faster than the average human security researcher.',
    date: yesterday,
    image_url: 'https://images.unsplash.com/photo-1555066931-4365d14431b9?w=800&q=80',
    source_name: 'MIT News',
    link: 'https://news.mit.edu/topic/artificial-intelligence2',
  },
  {
    title: 'Meta Open-Sources Llama 4 with Vision, Audio and 128K Context',
    description: 'Meta AI releases its most capable open-source model yet, supporting text, images, and audio understanding in a single architecture — available under a permissive commercial license. Llama 4 Scout (17B active parameters) and Llama 4 Maverick (17B active/400B total) are both now available on Hugging Face. Maverick outperforms GPT-4o on most standard benchmarks while being free to run commercially. Meta says it represents their strongest commitment yet to open AI development.',
    date: yesterday,
    image_url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
    source_name: 'Meta AI Blog',
    link: 'https://ai.meta.com/blog/',
  },
  {
    title: 'AI-Powered Code Generation Now Writes 40% of Code at Major Tech Companies',
    description: "A new survey of 500 engineering teams shows that AI coding assistants now contribute to nearly half of all code written, with the biggest gains in test generation and boilerplate code. GitHub Copilot, Cursor, and Claude Code were the most widely adopted tools. Engineers reported saving an average of 2.5 hours per day on repetitive tasks, though the survey also found that code review time has increased as teams adapt to validating AI-generated code at scale.",
    date: twoDaysAgo,
    image_url: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80',
    source_name: 'Stack Overflow Blog',
    link: 'https://stackoverflow.blog/ai/',
  },
  {
    title: 'OpenAI o3 Sets New Records on ARC-AGI Benchmark with 88% Score',
    description: "The reasoning model achieves unprecedented performance on the Abstraction and Reasoning Corpus, a benchmark specifically designed to be difficult for AI systems trained on existing internet data. The previous best score on ARC-AGI was 53% from GPT-4o. François Chollet, who created the benchmark, called the result 'a genuine surprise' and noted that o3 appeared to be doing something qualitatively different from pattern matching — possibly constructing novel programs to solve each puzzle.",
    date: twoDaysAgo,
    image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
    source_name: 'OpenAI Blog',
    link: 'https://openai.com/news/',
  },
]

function getRelativeDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  if (diff <= 0) return 'Today'
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
    // Use LOCAL calendar date so all articles from the same day group together
    // regardless of timezone offsets in the RSS pubDate
    const d = new Date(article.date || Date.now())
    const date = isNaN(d.getTime())
      ? new Date().toLocaleDateString('en-CA')
      : d.toLocaleDateString('en-CA') // always YYYY-MM-DD in local time
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


export default function NewsPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('')

  useEffect(() => {
    async function fetchNews() {
      // Fetch all RSS feeds in parallel
      const results = await Promise.allSettled(
        RSS_FEEDS.map(async ({ url, source }) => {
          const res = await fetch(`${RSS2JSON}?rss_url=${encodeURIComponent(url)}`)
          const data = await res.json()
          if (data.status === 'ok' && data.items?.length > 0) {
            return normalizeRSS(data.items, source)
          }
          return []
        })
      )

      // Merge all successful results
      const all = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value)
        .filter(a => a.title)

      if (all.length > 0) {
        // Sort by date descending
        all.sort((a, b) => new Date(b.date) - new Date(a.date))
        setArticles(all)
        setLoading(false)
        return
      }

      // All feeds failed — use static fallback
      setArticles(MOCK_ARTICLES)
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
                <div className="news-grid grid gap-4">
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
                <div className="news-grid grid gap-4">
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
