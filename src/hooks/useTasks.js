import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getToday, getTomorrow, nextRecurrenceDate } from '../lib/dates'
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
let _migrated = false

// Migrate tasks from old unscoped localStorage keys into Supabase
async function migrateLocalTasks() {
  if (_migrated) return
  _migrated = true

  try {
    const uid = getUserId()
    if (!uid || uid === 'demo-user') return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Find all old-style unscoped task keys: dayforge_tasks_YYYY-MM-DD (no user ID segment)
    const legacyKeys = []
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key && /^dayforge_tasks_\d{4}-\d{2}-\d{2}$/.test(key)) {
        legacyKeys.push(key)
      }
    }

    if (legacyKeys.length === 0) return

    // Get all existing task titles from Supabase to avoid duplicates
    const { data: remote } = await supabase.from('tasks').select('title, target_date')
    const remoteSet = new Set((remote || []).map(t => `${t.title}|||${t.target_date}`))

    const toUpload = []
    for (const key of legacyKeys) {
      const dateStr = key.slice(-10)
      try {
        const tasks = JSON.parse(localStorage.getItem(key) || '[]')
        for (const t of tasks) {
          const sig = `${t.title}|||${t.target_date || dateStr}`
          if (!remoteSet.has(sig)) {
            toUpload.push({
              title: t.title,
              target_date: t.target_date || dateStr,
              completed: t.completed || false,
              completed_at: t.completed_at || null,
              user_id: user.id,
            })
            remoteSet.add(sig)
          }
        }
      } catch {}
      // Remove old key after processing
      localStorage.removeItem(key)
    }

    if (toUpload.length > 0) {
      await supabase.from('tasks').insert(toUpload)
    }
  } catch {}
}

export function useTasks(scope) {
  const dateStr = scope === 'today' ? getToday() : getTomorrow()
  const [tasks, setTasks] = useState(() => lsLoad(dateStr))
  const [loading, setLoading] = useState(true)
  const subscriptionRef = useRef(null)
  const pendingLocalIds = useRef(new Set())

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
        // Deduplicate: keep server versions, remove local optimistic entries that now have server copies
        const serverIds = new Set(data.map(t => t.id))
        setTasks(prev => {
          // Keep any pending local tasks that aren't yet on the server
          const localOnly = prev.filter(t => pendingLocalIds.current.has(t.id) && !serverIds.has(t.id))
          const merged = [...data, ...localOnly]
          lsSave(dateStr, merged)
          return merged
        })
      }
    } catch {}

    setLoading(false)
  }, [dateStr, scope])

  // On mount: migrate old localStorage tasks to Supabase, then fetch
  useEffect(() => {
    migrateLocalTasks().then(() => fetchTasks())
  }, [fetchTasks])

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

  async function addTask(title, recurrence = null) {
    const targetDate = dateStr

    const localTask = {
      id: crypto.randomUUID(),
      title,
      target_date: targetDate,
      user_id: 'local',
      completed: false,
      recurrence,
      created_at: new Date().toISOString(),
    }

    pendingLocalIds.current.add(localTask.id)

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
        .insert({ title, target_date: targetDate, user_id: user.id, completed: false, recurrence })
        .select()
        .single()

      if (data) {
        pendingLocalIds.current.delete(localTask.id)
        setTasks(prev => {
          const next = prev.map(t => t.id === localTask.id ? data : t)
          lsSave(dateStr, next)
          return next
        })
      }
    } catch {
      pendingLocalIds.current.delete(localTask.id)
    }
  }

  // Spawn the next instance of a recurring task. Deduped by title +
  // target_date so rapid toggle-uncheck-toggle doesn't create duplicates.
  async function spawnNextRecurrence(task) {
    if (!task?.recurrence) return
    const nextDate = nextRecurrenceDate(task.recurrence)
    if (!nextDate) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: existing } = await supabase
        .from('tasks')
        .select('id')
        .eq('title', task.title)
        .eq('target_date', nextDate)
        .eq('completed', false)
        .limit(1)
      if (existing && existing.length > 0) return

      await supabase.from('tasks').insert({
        title: task.title,
        target_date: nextDate,
        user_id: user.id,
        completed: false,
        recurrence: task.recurrence,
      })
    } catch {}
  }

  async function toggleTask(id, currentCompleted) {
    const today = getToday()
    // When marking complete, re-anchor target_date to today so the monthly
    // calendar attributes the completion to the day it actually happened,
    // not the day the task was originally scheduled (rolled-over tasks).
    const updates = !currentCompleted
      ? { completed: true, completed_at: new Date().toISOString(), target_date: today }
      : { completed: false, completed_at: null }

    let toggledTask = null
    setTasks(prev => {
      toggledTask = prev.find(t => t.id === id) || null
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

    // If this was a recurring task and we just completed it, create the
    // next occurrence. If it's not completed by its next date, the existing
    // rollover behavior will keep it visible on Today's panel.
    if (!currentCompleted && toggledTask?.recurrence) {
      await spawnNextRecurrence(toggledTask)
    }
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
