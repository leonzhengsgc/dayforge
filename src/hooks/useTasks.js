import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getToday, getTomorrow } from '../lib/dates'

export function useTasks(scope) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
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
    if (error) {
      console.error('Error fetching tasks:', error)
    } else {
      setTasks(data || [])
    }
    setLoading(false)
  }, [scope])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  async function addTask(title) {
    const targetDate = scope === 'today' ? getToday() : getTomorrow()
    const { data: { user } } = await supabase.auth.getUser()

    const newTask = {
      title,
      target_date: targetDate,
      user_id: user.id,
      completed: false,
    }

    const { data, error } = await supabase.from('tasks').insert(newTask).select().single()
    if (error) {
      console.error('Error adding task:', error)
      return
    }
    setTasks(prev => [...prev, data])
  }

  async function toggleTask(id, currentCompleted) {
    const updates = {
      completed: !currentCompleted,
      completed_at: !currentCompleted ? new Date().toISOString() : null,
    }

    const { error } = await supabase.from('tasks').update(updates).eq('id', id)
    if (error) {
      console.error('Error toggling task:', error)
      return
    }

    setTasks(prev =>
      prev.map(t => t.id === id ? { ...t, ...updates } : t)
        .sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1
          return new Date(a.created_at) - new Date(b.created_at)
        })
    )
  }

  async function deleteTask(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) {
      console.error('Error deleting task:', error)
      return
    }
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return { tasks, loading, addTask, toggleTask, deleteTask, refetch: fetchTasks }
}
