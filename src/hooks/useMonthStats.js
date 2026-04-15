import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getMonthRange, getToday } from '../lib/dates'

// Convert an ISO timestamp or date string to a local YYYY-MM-DD.
// We bucket by the user's local day, not UTC, so late-night completions
// land on the same calendar cell the user was looking at.
function toLocalDate(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useMonthStats(year, month) {
  const [days, setDays] = useState({})
  const [monthProductivity, setMonthProductivity] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    const { start, end } = getMonthRange(year, month)
    const today = getToday()

    // Pull every task that could be visible on any day this month.
    // A task is visible on day X if it existed on X (created_at <= X) AND
    // was not already completed before X (completed_at is null OR >= X).
    // To keep the query simple we fetch all tasks created on or before
    // the month's last day; filtering per-day happens client-side.
    const { data, error } = await supabase
      .from('tasks')
      .select('created_at, completed, completed_at, target_date')
      .lte('created_at', `${end}T23:59:59.999Z`)

    if (error) {
      console.error('Error fetching month stats:', error)
      setLoading(false)
      return
    }

    // Normalise each task to local dates once.
    const tasks = (data || []).map(t => ({
      createdDate: toLocalDate(t.created_at) || t.target_date || null,
      completedDate: t.completed && t.completed_at ? toLocalDate(t.completed_at) : null,
      completed: !!t.completed,
    }))

    const grouped = {}
    let totalAll = 0
    let completedAll = 0

    // Iterate every day of the month up to today. Future days stay empty.
    const [yyyy, mm] = start.split('-').map(Number)
    const lastDay = new Date(yyyy, mm, 0).getDate()

    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${yyyy}-${String(mm).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      if (dateStr > today) break // don't count future days

      let total = 0
      let completed = 0

      for (const t of tasks) {
        if (!t.createdDate || t.createdDate > dateStr) continue
        // Was the task still "live" on dateStr (incomplete or completed that day)?
        const stillLive = !t.completedDate || t.completedDate >= dateStr
        if (!stillLive) continue

        total++
        if (t.completedDate === dateStr) completed++
      }

      if (total > 0) {
        grouped[dateStr] = {
          total,
          completed,
          percentage: Math.round((completed / total) * 100),
        }
        totalAll += total
        completedAll += completed
      }
    }

    setDays(grouped)
    setMonthProductivity(totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0)
    setLoading(false)
  }, [year, month])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Keep calendar numbers in sync when tasks are added / completed / deleted.
  useEffect(() => {
    const channel = supabase
      .channel('month-stats-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchStats()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchStats])

  return { days, monthProductivity, loading, refetch: fetchStats }
}
