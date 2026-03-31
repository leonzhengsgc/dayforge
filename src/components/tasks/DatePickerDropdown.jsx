import { useState, useEffect, useRef } from 'react'
import { getDaysInMonth, getFirstDayOfWeek, getToday } from '../../lib/dates'

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function DatePickerDropdown({ onSelectDate, onClose }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const ref = useRef(null)
  const today = getToday()

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)

  const monthLabel = new Date(year, month).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function handleDayClick(day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (dateStr > today) return
    onSelectDate(dateStr)
    onClose()
  }

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-2 z-50 w-64 bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl p-3 animate-scale-in"
    >
      {/* Month nav */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={prevMonth}
          className="p-1 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-gray-200">{monthLabel}</span>
        <button
          onClick={nextMonth}
          className="p-1 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] uppercase tracking-wider text-gray-600 font-semibold py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isToday = dateStr === today
          const isFuture = dateStr > today

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={isFuture}
              className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all duration-150 ${
                isFuture
                  ? 'text-gray-700 cursor-not-allowed'
                  : isToday
                    ? 'bg-forge-500/20 text-forge-400 ring-1 ring-forge-500/40 cursor-pointer hover:bg-forge-500/30'
                    : 'text-gray-300 cursor-pointer hover:bg-gray-800/60 hover:text-white'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
