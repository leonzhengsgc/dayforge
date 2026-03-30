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

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-lg font-semibold text-gray-100">{label}</h2>
        {totalCount > 0 && (
          <span className="text-xs text-gray-400">
            {completedCount}/{totalCount} done
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-4">{formatDisplayDate(dateStr)}</p>
      <AddTaskForm onAdd={addTask} />
      <div className="mt-4 flex-1 overflow-y-auto max-h-80">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-forge-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
        )}
      </div>
    </div>
  )
}
