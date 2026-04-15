import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function toLocalDate(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Tasks visible on dateStr's panel = existed on that day AND weren't
// already completed before it. Matches the calendar's bucketing logic.
export function useDayLog(dateStr) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLog = useCallback(async () => {
    if (!dateStr) { setLoading(false); return }

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .lte('created_at', `${dateStr}T23:59:59.999Z`)
        .order('completed', { ascending: true })
        .order('created_at', { ascending: true })

      if (!error && data) {
        const visible = data.filter(t => {
          const createdDate = toLocalDate(t.created_at) || t.target_date
          if (!createdDate || createdDate > dateStr) return false
          if (!t.completed || !t.completed_at) return true // still open
          const completedDate = toLocalDate(t.completed_at)
          return completedDate >= dateStr // completed on or after this day
        }).map(t => ({
          ...t,
          // For display: completion counts on the day it happened
          completed: t.completed && toLocalDate(t.completed_at) === dateStr,
        }))
        setTasks(visible)
      }
    } catch {}

    setLoading(false)
  }, [dateStr])

  useEffect(() => {
    fetchLog()
  }, [fetchLog])

  const completed = tasks.filter(t => t.completed).length
  const total = tasks.length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return {
    tasks,
    loading,
    stats: { total, completed, percentage },
  }
}
