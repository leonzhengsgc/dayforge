import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useDayLog } from '../../hooks/useDayLog'
import { formatDisplayDate, getToday } from '../../lib/dates'

function shiftDate(dateStr, delta) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d + delta)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function DailyLogModal({ dateStr, onClose, onNavigate }) {
  const { tasks, loading, stats } = useDayLog(dateStr)
  const today = getToday()
  const canGoNext = dateStr < today
  const isToday = dateStr === today

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onNavigate(shiftDate(dateStr, -1))
      if (e.key === 'ArrowRight' && canGoNext) onNavigate(shiftDate(dateStr, 1))
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, onNavigate, dateStr, canGoNext])

  const { total, completed, percentage } = stats
  const allDone = total > 0 && completed === total

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-gray-900 border border-gray-700/50 shadow-2xl animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-800/80 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation arrows */}
        <div className="flex items-center justify-between px-6 pt-5 pb-1">
          <button
            onClick={() => onNavigate(shiftDate(dateStr, -1))}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-100">
              {isToday ? 'Today' : formatDisplayDate(dateStr)}
            </h2>
            {!isToday && (
              <p className="text-xs text-gray-500">{dateStr}</p>
            )}
            {isToday && (
              <p className="text-xs text-gray-500">{formatDisplayDate(dateStr)}</p>
            )}
          </div>

          <button
            onClick={() => canGoNext && onNavigate(shiftDate(dateStr, 1))}
            disabled={!canGoNext}
            className={`p-2 rounded-lg transition-all duration-200 active:scale-95 ${
              canGoNext
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 cursor-pointer'
                : 'text-gray-700 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Stats + progress bar */}
        {!loading && total > 0 && (
          <div className="px-6 pb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 font-medium">
                {completed} of {total} tasks completed
              </span>
              <span className={`text-sm font-bold ${allDone ? 'text-forge-400' : 'text-gray-400'}`}>
                {percentage}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-forge-600 to-forge-400 rounded-full transition-all duration-500 ${
                  allDone ? 'shadow-[0_0_8px_rgba(34,197,94,0.5)]' : ''
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            {allDone && (
              <div className="flex items-center gap-1.5 mt-2">
                <svg className="w-3.5 h-3.5 text-forge-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-forge-400 font-medium">All done — great day</span>
              </div>
            )}
          </div>
        )}

        {/* Task list */}
        <div className="px-6 pb-6">
          {loading ? (
            <div className="space-y-2 py-4">
              <div className="h-10 bg-gray-800/40 rounded-lg animate-shimmer" />
              <div className="h-10 bg-gray-800/40 rounded-lg animate-shimmer w-[85%]" />
              <div className="h-10 bg-gray-800/40 rounded-lg animate-shimmer w-[70%]" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-10 text-center">
              <svg className="w-10 h-10 text-gray-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <p className="text-sm text-gray-500">No tasks logged for this day</p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {tasks.map(task => (
                <li
                  key={task.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ${
                    task.completed ? 'bg-gray-800/20' : 'bg-gray-800/40'
                  }`}
                >
                  {/* Checkbox visual (read-only) */}
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                    task.completed
                      ? 'bg-forge-500 border-forge-500'
                      : 'border-gray-600'
                  }`}>
                    {task.completed && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  <span className={`text-sm ${
                    task.completed
                      ? 'text-gray-500 line-through'
                      : 'text-gray-200'
                  }`}>
                    {task.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
