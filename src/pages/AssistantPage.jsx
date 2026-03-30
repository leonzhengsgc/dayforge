import { useState, useRef, useEffect } from 'react'
import AppShell from '../components/layout/AppShell'

const SYSTEM_PROMPT = `You are DayForge Assistant — a sharp, strategic thinking partner. Your role is to:

1. QUESTION the user's ideas constructively — poke holes, find blind spots, play devil's advocate
2. BUILD ON ideas — add layers, suggest angles they haven't considered
3. IDEATE together — brainstorm freely, connect dots, generate options
4. DRAFT vision documents and plans when asked — structured, clear, actionable

You understand business, product, tech, and strategy. You're direct, not sycophantic. When an idea is weak, say so and explain why. When it's strong, amplify it.

Keep responses concise but substantive. Use bullet points and structure for plans. Ask clarifying questions when needed.`

const WELCOME_MESSAGES = [
  "What's on your mind? Drop an idea and I'll stress-test it with you.",
  "Ready to ideate. What problem are you trying to solve?",
  "Let's think through something together. What are you working on?",
]

function getWelcome() {
  return WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]
}

const STARTERS = [
  { label: 'Brainstorm a feature', prompt: "I have an idea for a new feature. Help me think through it." },
  { label: 'Draft a vision doc', prompt: "Help me draft a vision document for a new project." },
  { label: 'Stress-test my plan', prompt: "I have a plan I want you to poke holes in." },
  { label: 'Business model ideas', prompt: "Help me explore business model options for my product." },
]

export default function AssistantPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('dayforge_api_key') || '')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function saveApiKey(key) {
    setApiKey(key)
    localStorage.setItem('dayforge_api_key', key)
    setShowKeyInput(false)
  }

  async function sendMessage(content) {
    if (!content.trim()) return
    if (!apiKey) {
      setShowKeyInput(true)
      return
    }

    const userMsg = { role: 'user', content: content.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || `API error: ${res.status}`)
      }

      const data = await res.json()
      const assistantContent = data.content?.[0]?.text || 'No response received.'
      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}. Check your API key.`, isError: true }])
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-4rem)] -my-8 -mx-6">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-100 mb-1">DayForge Assistant</h2>
              <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
                {getWelcome()}
              </p>

              {!apiKey && (
                <div className="mb-6 card p-4 max-w-sm w-full">
                  <p className="text-sm text-gray-400 mb-3">Enter your Anthropic API key to start chatting:</p>
                  <form onSubmit={(e) => { e.preventDefault(); saveApiKey(e.target.key.value) }} className="flex gap-2">
                    <input
                      name="key"
                      type="password"
                      placeholder="sk-ant-..."
                      className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] transition-all duration-200"
                    />
                    <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer">
                      Save
                    </button>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 max-w-md w-full">
                {STARTERS.map(s => (
                  <button
                    key={s.label}
                    onClick={() => sendMessage(s.prompt)}
                    className="card px-4 py-3 text-left hover:bg-gray-800/40 transition-all duration-200 cursor-pointer group"
                  >
                    <p className="text-sm text-gray-300 font-medium group-hover:text-purple-400 transition-colors">{s.label}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-purple-600/20 border border-purple-500/20 text-gray-100'
                      : msg.isError
                        ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                        : 'bg-gray-800/50 border border-gray-700/30 text-gray-200'
                  }`}>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-gray-800/50 border border-gray-700/30 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-[pulse_1s_ease-in-out_infinite]" />
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-[pulse_1s_ease-in-out_0.2s_infinite]" />
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-[pulse_1s_ease-in-out_0.4s_infinite]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-gray-800/50 px-6 py-4 bg-gray-950/80">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your idea or question..."
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-800/40 border border-gray-700/40 rounded-xl text-gray-100 text-sm placeholder-gray-600 focus:bg-gray-800/60 focus:border-purple-500/50 focus:outline-none focus:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] transition-all duration-200 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
          <div className="max-w-3xl mx-auto mt-2 flex items-center justify-between">
            <p className="text-[10px] text-gray-600">Powered by Claude. Responses may not always be accurate.</p>
            {apiKey && (
              <button
                onClick={() => setShowKeyInput(true)}
                className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors cursor-pointer"
              >
                Change API key
              </button>
            )}
          </div>
        </div>

        {/* API Key modal */}
        {showKeyInput && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowKeyInput(false)} />
            <div className="relative card p-6 max-w-sm w-full animate-scale-in">
              <h3 className="text-lg font-bold text-gray-100 mb-2">Anthropic API Key</h3>
              <p className="text-sm text-gray-400 mb-4">Enter your API key to chat with Claude. Your key is stored locally and never sent to our servers.</p>
              <form onSubmit={(e) => { e.preventDefault(); saveApiKey(e.target.key.value) }} className="space-y-3">
                <input
                  name="key"
                  type="password"
                  defaultValue={apiKey}
                  placeholder="sk-ant-api03-..."
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 text-sm focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] transition-all duration-200"
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer">
                    Save Key
                  </button>
                  <button type="button" onClick={() => setShowKeyInput(false)} className="px-4 py-2.5 text-gray-400 hover:text-gray-200 text-sm rounded-xl transition-all duration-200 cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
