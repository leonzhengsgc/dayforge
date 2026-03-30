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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task..."
        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-forge-500 focus:ring-1 focus:ring-forge-500 transition-colors placeholder-gray-500"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-forge-600 hover:bg-forge-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
      >
        Add
      </button>
    </form>
  )
}
