import { useState } from 'react'

const OPTIONS = [
  { value: null, label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export default function AddTaskForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [recurrence, setRecurrence] = useState(null)
  const [showOptions, setShowOptions] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed, recurrence)
    setTitle('')
    setRecurrence(null)
    setShowOptions(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setShowOptions(true)}
          placeholder="What needs to be done?"
          className="w-full pl-9 pr-10 py-2.5 bg-gray-800/30 border border-gray-700/40 rounded-xl text-gray-100 text-sm placeholder-gray-600 focus:bg-gray-800/50 focus:border-forge-500/50 focus:outline-none focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] transition-all duration-200"
        />
        <button
          type="button"
          onClick={() => setShowOptions(o => !o)}
          title="Repeat"
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
            recurrence
              ? 'text-forge-400 bg-forge-500/10'
              : 'text-gray-600 hover:text-gray-400 hover:bg-gray-800/60'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      {(showOptions || recurrence) && (
        <div className="flex items-center gap-1.5 mt-2 pl-1 animate-slide-up">
          <span className="text-[10px] uppercase tracking-wider text-gray-600 mr-1">Repeat</span>
          {OPTIONS.map(opt => {
            const active = recurrence === opt.value
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => setRecurrence(opt.value)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-forge-500/15 border-forge-500/40 text-forge-300'
                    : 'bg-gray-800/30 border-gray-700/40 text-gray-500 hover:text-gray-300 hover:border-gray-600/60'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </form>
  )
}
