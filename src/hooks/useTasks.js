import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getToday, getTomorrow } from '../lib/dates'
import { getUserId } from '../lib/userScope'

function lsKey(dateStr) {
  const uid = getUserId()
  return uid ? `dayforge_tasks_${uid}_${dateStr}` : `dayforge_tasks_${dateStr}`
}
function lsLoad(dateStr) { try { return JSON.parse(localStorage.getItem(lsKey(dateStr)) || '[]') } catch { return [] } }
function lsSave(dateStr, tasks) { try { localStorage.setItem(lsKey(dateStr), JSON.stringify(tasks)) } catch {} }

function pruneOldTaskCache() {
  try {
    const now = new Date()
    const cutoff = new Date(now)
    cutoff.setDate(cutoff.getDate() - 7)
    const cutoffStr = cutoff.toISOString().slice(0, 10)
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key && key.startsWith('dayforge_tasks_') && /\d{4}-\d{2}-\d{2}$/.test(key)) {
        const dateStr = key.slice(-10)
        if (dateStr < cutoffStr) localStorage.removeItem(key)
      }
    }
    localStorage.removeItem('dayforge_tasks_today')
    localStorage.removeItem('dayforge_tasks_tomorrow')
  } catch {}
}

let _pruned = false

export function useTasks(scope) {
  const dateStr = scope === 'today' ? getToday() : getTomorrow()
  const [tasks, setTasks] = useState(() => lsLoad(dateStr))
  const [loading, setLoading] = useState(true)
  const subscriptionRef = useRef(null)

  useEffect(() => {
    if (!_pruned) { _pruned = true; pruneOldTaskCache() }
  }, [])

  const fetchTasks = useCallback(async () => {
    const local = lsLoad(dateStr)
    if (local.length > 0) {
      setTasks(local)
    }

    try {
      const today = getToday()
      const tomorrow = getTomorrow()
      let query = supabase.from('tasks').select('*')

      if (scope === 'today') {
        query = query.or(`and(completed.eq.false,target_date.lte.${today}),and(completed.eq.true,target_date.eq.${today})`)
      } else {
        query = query.eq('target_date', tomorrow)
      }

      query = query.order('completed', { ascending: true }).order('created_at', { ascending: true })
      const { data, error } = await query

      if (!error && data) {
        setTasks(data)
        lsSave(dateStr, data)
      }
    } catch {}

    setLoading(false)
  }, [dateStr, scope])

  // Realtime subscription for cross-device sync
  useEffect(() => {
    const channel = supabase
      .channel(`tasks-${scope}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks()
      })
      .subscribe()

    subscriptionRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [scope, fetchTasks])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  async function addTask(title) {
    const targetDate = dateStr

    const localTask = {
      id: crypto.randomUUID(),
      title,
      target_date: targetDate,
      user_id: 'local',
      completed: false,
      created_at: new Date().toISOString(),
    }

    setTasks(prev => {
      const next = [...prev, localTask]
      lsSave(dateStr, next)
      return next
    })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('tasks')
        .insert({ title, target_date: targetDate, user_id: user.id, completed: false })
        .select()
        .single()

      if (data) {
        setTasks(prev => {
          const next = prev.map(t => t.id === localTask.id ? data : t)
          lsSave(dateStr, next)
          return next
        })
      }
    } catch {}
  }

  async function toggleTask(id, currentCompleted) {
    const updates = {
      completed: !currentCompleted,
      completed_at: !currentCompleted ? new Date().toISOString() : null,
    }

    setTasks(prev => {
      const next = prev
        .map(t => t.id === id ? { ...t, ...updates } : t)
        .sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1
          return new Date(a.created_at) - new Date(b.created_at)
        })
      lsSave(dateStr, next)
      return next
    })

    try { await supabase.from('tasks').update(updates).eq('id', id) } catch {}
  }

  async function deleteTask(id) {
    setTasks(prev => {
      const next = prev.filter(t => t.id !== id)
      lsSave(dateStr, next)
      return next
    })
    try { await supabase.from('tasks').delete().eq('id', id) } catch {}
  }

  return { tasks, loading, addTask, toggleTask, deleteTask, refetch: fetchTasks }
}
