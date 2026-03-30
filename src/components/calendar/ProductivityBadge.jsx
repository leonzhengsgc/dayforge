export default function ProductivityBadge({ percentage, loading }) {
  if (loading) return null

  const size = 52
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - percentage / 100)

  let strokeColor = 'stroke-gray-600'
  if (percentage >= 80) strokeColor = 'stroke-forge-400'
  else if (percentage >= 60) strokeColor = 'stroke-forge-500'
  else if (percentage >= 40) strokeColor = 'stroke-yellow-400'
  else if (percentage > 0) strokeColor = 'stroke-orange-400'

  let textColor = 'text-gray-500'
  if (percentage >= 80) textColor = 'text-forge-400'
  else if (percentage >= 60) textColor = 'text-forge-500'
  else if (percentage >= 40) textColor = 'text-yellow-400'
  else if (percentage > 0) textColor = 'text-orange-400'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        style={{ '--ring-circumference': circumference, '--ring-offset': offset }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${strokeColor} animate-ring-fill transition-all duration-700`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className={`text-sm font-bold ${textColor}`}>{percentage}%</span>
      </div>
    </div>
  )
}
