import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getUserId } from '../lib/userScope'

function lsKey(dateStr) {
  const uid = getUserId()
  return uid ? `dayforge_tasks_${uid}_${dateStr}` : `dayforge_tasks_${dateStr}`
}
function lsLoad(dateStr) { try { return JSON.parse(localStorage.getItem(lsKey(dateStr)) || '[]') } catch { return [] } }
function lsSave(dateStr, tasks) { try { localStorage.setItem(lsKey(dateStr), JSON.stringify(tasks)) } catch {} }

export function useDayLog(dateStr) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLog = useCallback(async () => {
    if (!dateStr) { setLoading(false); return }

    setLoading(true)

    const local = lsLoad(dateStr)
    setTasks(local)

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('target_date', dateStr)
        .order('completed', { ascending: true })
        .order('created_at', { ascending: true })

      if (!error && data) {
        setTasks(data)
        lsSave(dateStr, data)
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
