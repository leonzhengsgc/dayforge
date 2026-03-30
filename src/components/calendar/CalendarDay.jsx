export default function CalendarDay({ day, stat, isToday, isFuture }) {
  const percentage = stat?.percentage ?? 0
  const hasData = stat && stat.total > 0

  let bgColor = 'bg-gray-800/40'
  if (hasData) {
    if (percentage === 100) bgColor = 'bg-forge-500'
    else if (percentage >= 75) bgColor = 'bg-forge-500/75'
    else if (percentage >= 50) bgColor = 'bg-forge-500/50'
    else if (percentage >= 25) bgColor = 'bg-forge-500/30'
    else if (percentage > 0) bgColor = 'bg-forge-500/15'
    else bgColor = 'bg-gray-800/60'
  }

  return (
    <div
      className={`aspect-square rounded-md flex flex-col items-center justify-center relative transition-all ${bgColor} ${
        isToday ? 'ring-2 ring-forge-400 ring-offset-1 ring-offset-gray-950' : ''
      } ${isFuture ? 'opacity-40' : ''}`}
      title={hasData ? `${stat.completed}/${stat.total} tasks (${percentage}%)` : `Day ${day}`}
    >
      <span className="text-xs font-medium text-gray-300">{day}</span>
      {hasData && (
        <span className={`text-[10px] font-bold ${percentage === 100 ? 'text-white' : 'text-gray-400'}`}>
          {percentage}%
        </span>
      )}
    </div>
  )
}
