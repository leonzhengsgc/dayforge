import { useState } from 'react'

export default function AddTaskForm({ onAdd }) {
  const [title, setTitle] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className="w-full pl-9 pr-4 py-2.5 bg-gray-800/30 border border-gray-700/40 rounded-xl text-gray-100 text-sm placeholder-gray-600 focus:bg-gray-800/50 focus:border-forge-500/50 focus:outline-none focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] transition-all duration-200"
      />
    </form>
  )
}
