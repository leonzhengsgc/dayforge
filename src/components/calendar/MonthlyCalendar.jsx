import { useState } from 'react'
import { useMonthStats } from '../../hooks/useMonthStats'
import { getDaysInMonth, getFirstDayOfWeek, getToday } from '../../lib/dates'
import CalendarDay from './CalendarDay'
import ProductivityBadge from './ProductivityBadge'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function MonthlyCalendar({ onDayClick }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const { days, monthProductivity, loading } = useMonthStats(year, month)

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)
  const today = getToday()

  const monthName = new Date(year, month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  function prevMonth() {
    if (month === 0) {
      setMonth(11)
      setYear(y => y - 1)
    } else {
      setMonth(m => m - 1)
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0)
      setYear(y => y + 1)
    } else {
      setMonth(m => m + 1)
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 transition-all duration-200 cursor-pointer active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-100">{monthName}</h2>
          </div>
          <div className="relative">
            <ProductivityBadge percentage={monthProductivity} loading={loading} />
          </div>
        </div>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 transition-all duration-200 cursor-pointer active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-[11px] uppercase tracking-wider text-gray-600 font-semibold py-1">
            {day}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 35 }, (_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-gray-800/30 animate-shimmer" />
          ))}
        </div>
      ) : (
        <div key={`${year}-${month}`} className="grid grid-cols-7 gap-1.5 animate-fade-in">
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isToday = dateStr === today
            const isFuture = dateStr > today

            return (
              <CalendarDay
                key={day}
                day={day}
                stat={days[dateStr]}
                isToday={isToday}
                isFuture={isFuture}
                dateStr={dateStr}
                onDayClick={onDayClick}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
