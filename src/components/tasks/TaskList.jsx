import TaskItem from './TaskItem'

export default function TaskList({ tasks, onToggle, onDelete, scope }) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="animate-float">
          <svg className="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm font-medium mt-3">
          {scope === 'today' ? 'What will you forge today?' : 'Plan ahead for tomorrow'}
        </p>
        <p className="text-gray-600 text-xs mt-1">
          Type a task above and press Enter
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-800/30">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
