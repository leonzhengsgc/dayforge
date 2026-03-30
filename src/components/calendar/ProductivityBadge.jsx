export default function ProductivityBadge({ percentage, loading }) {
  if (loading) return null

  let color = 'text-gray-400'
  if (percentage >= 80) color = 'text-forge-400'
  else if (percentage >= 60) color = 'text-forge-500/80'
  else if (percentage >= 40) color = 'text-yellow-400'
  else if (percentage > 0) color = 'text-orange-400'

  return (
    <p className={`text-sm font-medium ${color}`}>
      {percentage}% productivity
    </p>
  )
}
