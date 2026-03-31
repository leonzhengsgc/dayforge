export default function CalendarDay({ day, stat, isToday, isFuture, dateStr, onDayClick }) {
  const percentage = stat?.percentage ?? 0
  const hasData = stat && stat.total > 0
  const clickable = !isFuture && (hasData || isToday)

  let bgColor = 'bg-gray-800/30'
  if (hasData) {
    if (percentage === 100) bgColor = 'bg-forge-500 shadow-[0_0_8px_rgba(34,197,94,0.35)]'
    else if (percentage >= 75) bgColor = 'bg-forge-600/70'
    else if (percentage >= 50) bgColor = 'bg-forge-700/70'
    else if (percentage >= 25) bgColor = 'bg-forge-800/70'
    else if (percentage > 0) bgColor = 'bg-forge-900/70'
    else bgColor = 'bg-gray-800/50'
  }

  function handleClick() {
    if (clickable && onDayClick) onDayClick(dateStr)
  }

  return (
    <div
      onClick={handleClick}
      className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all duration-300 group ${clickable ? 'cursor-pointer' : 'cursor-default'} ${bgColor} ${
        isToday ? 'ring-1 ring-forge-400/60 ring-offset-1 ring-offset-gray-950' : ''
      } ${isFuture ? 'opacity-30' : 'hover:scale-110 hover:z-10'} ${clickable && !isToday ? 'hover:ring-1 hover:ring-forge-500/30' : ''}`}
      title={hasData ? `${stat.completed}/${stat.total} tasks (${percentage}%) — click to view` : `Day ${day}`}
    >
      <span className={`text-xs font-medium ${isToday ? 'text-forge-400' : 'text-gray-400'}`}>{day}</span>
      {hasData && percentage === 100 && (
        <span className="text-[9px] font-bold text-white/90">
          {percentage}%
        </span>
      )}
      {hasData && percentage < 100 && (
        <span className="text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {percentage}%
        </span>
      )}
    </div>
  )
}
