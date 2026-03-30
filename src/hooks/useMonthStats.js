import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getMonthRange } from '../lib/dates'

export function useMonthStats(year, month) {
  const [days, setDays] = useState({})
  const [monthProductivity, setMonthProductivity] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    const { start, end } = getMonthRange(year, month)

    const { data, error } = await supabase
      .from('tasks')
      .select('target_date, completed')
      .gte('target_date', start)
      .lte('target_date', end)

    if (error) {
      console.error('Error fetching month stats:', error)
      setLoading(false)
      return
    }

    const grouped = {}
    let totalAll = 0
    let completedAll = 0

    for (const task of data || []) {
      const date = task.target_date
      if (!grouped[date]) {
        grouped[date] = { total: 0, completed: 0, percentage: 0 }
      }
      grouped[date].total++
      totalAll++
      if (task.completed) {
        grouped[date].completed++
        completedAll++
      }
    }

    for (const date of Object.keys(grouped)) {
      const d = grouped[date]
      d.percentage = d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0
    }

    setDays(grouped)
    setMonthProductivity(totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0)
    setLoading(false)
  }, [year, month])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { days, monthProductivity, loading, refetch: fetchStats }
}
