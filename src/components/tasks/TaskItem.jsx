export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg group transition-colors ${task.completed ? 'bg-gray-800/30' : 'bg-gray-800/60 hover:bg-gray-800'}`}>
      <button
        onClick={() => onToggle(task.id, task.completed)}
        className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
          task.completed
            ? 'bg-forge-600 border-forge-600'
            : 'border-gray-600 hover:border-forge-500'
        }`}
      >
        {task.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
        {task.title}
      </span>
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )
}
