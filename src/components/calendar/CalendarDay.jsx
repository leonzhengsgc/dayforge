export default function CalendarDay({ day, stat, isToday, isFuture }) {
  const percentage = stat?.percentage ?? 0
  const hasData = stat && stat.total > 0

  let bgColor = 'bg-gray-800/30'
  if (hasData) {
    if (percentage === 100) bgColor = 'bg-forge-500 shadow-[0_0_8px_rgba(34,197,94,0.35)]'
    else if (percentage >= 75) bgColor = 'bg-forge-600/70'
    else if (percentage >= 50) bgColor = 'bg-forge-700/70'
    else if (percentage >= 25) bgColor = 'bg-forge-800/70'
    else if (percentage > 0) bgColor = 'bg-forge-900/70'
    else bgColor = 'bg-gray-800/50'
  }

  return (
    <div
      className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all duration-300 group cursor-default ${bgColor} ${
        isToday ? 'ring-1 ring-forge-400/60 ring-offset-1 ring-offset-gray-950' : ''
      } ${isFuture ? 'opacity-30' : 'hover:scale-110 hover:z-10'}`}
      title={hasData ? `${stat.completed}/${stat.total} tasks (${percentage}%)` : `Day ${day}`}
    >
      <span className={`text-xs font-medium ${isToday ? 'text-forge-400' : 'text-gray-400'}`}>{day}</span>
      {hasData && percentage === 100 && (
        <span className="text-[9px] font-bold text-white/90">
          {percentage}%
        </span>
      )}
      {hasData && percentage < 100 && (
        <span className="text-[9px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {percentage}%
        </span>
      )}
    </div>
  )
}
