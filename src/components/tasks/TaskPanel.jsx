import { useState } from 'react'
import { useTasks } from '../../hooks/useTasks'
import { getToday, getTomorrow, formatDisplayDate } from '../../lib/dates'
import AddTaskForm from './AddTaskForm'
import TaskList from './TaskList'
import DatePickerDropdown from './DatePickerDropdown'

export default function TaskPanel({ scope, onViewDate }) {
  const { tasks, loading, addTask, toggleTask, deleteTask } = useTasks(scope)
  const [pickerOpen, setPickerOpen] = useState(false)
  const dateStr = scope === 'today' ? getToday() : getTomorrow()
  const label = scope === 'today' ? 'Today' : 'Tomorrow'

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const allDone = totalCount > 0 && completedCount === totalCount

  return (
    <div className="card p-5 animate-slide-up">
      <div className="flex items-baseline justify-between mb-0.5">
        <div className="flex items-center gap-2 relative">
          <h2 className="text-xl font-bold text-gray-100">{label}</h2>
          {scope === 'today' && onViewDate && (
            <button
              onClick={() => setPickerOpen(o => !o)}
              title="View any day"
              className="p-1.5 rounded-lg text-gray-500 hover:text-forge-400 hover:bg-forge-500/10 transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </button>
          )}
          {pickerOpen && (
            <DatePickerDropdown
              onSelectDate={(date) => { onViewDate(date); setPickerOpen(false) }}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </div>
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
      <div className="mt-4">
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
