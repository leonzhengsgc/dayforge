import { useTasks } from '../../hooks/useTasks'
import { getToday, getTomorrow, formatDisplayDate } from '../../lib/dates'
import AddTaskForm from './AddTaskForm'
import TaskList from './TaskList'

export default function TaskPanel({ scope }) {
  const { tasks, loading, addTask, toggleTask, deleteTask } = useTasks(scope)
  const dateStr = scope === 'today' ? getToday() : getTomorrow()
  const label = scope === 'today' ? 'Today' : 'Tomorrow'

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const allDone = totalCount > 0 && completedCount === totalCount

  return (
    <div className="card p-5 flex flex-col animate-slide-up">
      <div className="flex items-baseline justify-between mb-0.5">
        <h2 className="text-xl font-bold text-gray-100">{label}</h2>
        {totalCount > 0 && (
          <span className="text-sm text-gray-500 font-medium">
            {completedCount} of {totalCount}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-600 tracking-wide uppercase mb-4">{formatDisplayDate(dateStr)}</p>

      {totalCount > 0 && (
        <div className="mb-4">
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-forge-600 to-forge-400 rounded-full transition-all duration-500 ${
                allDone ? 'shadow-[0_0_8px_rgba(34,197,94,0.5)]' : ''
              }`}
              style={{ width: `${percentage}%`, transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          </div>
          {allDone && (
            <div className="flex items-center gap-1.5 mt-2">
              <svg className="w-3.5 h-3.5 text-forge-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs text-forge-400 font-medium">All done — nice work</span>
            </div>
          )}
        </div>
      )}

      <AddTaskForm onAdd={addTask} />
      <div className="mt-4 flex-1 overflow-y-auto max-h-80">
        {loading ? (
          <div className="space-y-2 py-2">
            <div className="h-10 bg-gray-800/40 rounded-lg animate-shimmer" />
            <div className="h-10 bg-gray-800/40 rounded-lg animate-shimmer w-[85%]" />
            <div className="h-10 bg-gray-800/40 rounded-lg animate-shimmer w-[70%]" />
          </div>
        ) : (
          <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} scope={scope} />
        )}
      </div>
    </div>
  )
}
