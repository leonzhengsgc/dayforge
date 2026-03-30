export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 group transition-all duration-200 ${
        task.completed
          ? 'opacity-50 hover:opacity-70'
          : 'hover:bg-gray-800/40 hover:translate-x-0.5'
      }`}
    >
      <button
        onClick={() => onToggle(task.id, task.completed)}
        className={`w-[18px] h-[18px] rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 cursor-pointer ${
          task.completed
            ? 'bg-forge-600 border-forge-600 animate-check-pop'
            : 'border-gray-600 hover:border-forge-400 hover:shadow-[0_0_0_3px_rgba(34,197,94,0.1)]'
        }`}
      >
        {task.completed && (
          <svg className="w-2.5 h-2.5 text-white animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <span
        className={`flex-1 text-sm transition-all duration-300 ${
          task.completed ? 'line-through text-gray-500' : 'text-gray-200'
        }`}
      >
        {task.title}
      </span>
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400/80 transition-all duration-200 cursor-pointer p-1 rounded-md hover:bg-red-400/10"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
