import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { getUserId } from '../../lib/userScope'

function lsKey() {
  const uid = getUserId()
  return uid ? `dayforge_goals_${uid}` : 'dayforge_goals'
}
function lsLoad() { try { return JSON.parse(localStorage.getItem(lsKey()) || '[]') } catch { return [] } }
function lsSave(goals) { try { localStorage.setItem(lsKey(), JSON.stringify(goals)) } catch {} }

export default function GoalsPanel() {
  const [goals, setGoals] = useState(lsLoad)
  const [input, setInput] = useState('')
  const [adding, setAdding] = useState(false)

  const fetchGoals = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: true })
      if (!error && data) {
        const mapped = data.map(g => ({
          id: g.id,
          text: g.text,
          progress: g.progress,
          done: g.done,
          created: new Date(g.created_at).getTime(),
        }))
        setGoals(mapped)
        lsSave(mapped)
      }
    } catch {}
  }, [])

  // Realtime subscription for cross-device sync
  useEffect(() => {
    const channel = supabase
      .channel('goals-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, () => {
        fetchGoals()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchGoals])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  async function addGoal(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return

    const localGoal = { id: crypto.randomUUID(), text, progress: 0, done: false, created: Date.now() }
    setGoals(prev => {
      const next = [...prev, localGoal]
      lsSave(next)
      return next
    })
    setInput('')
    setAdding(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('goals')
        .insert({ text, progress: 0, done: false, user_id: user.id })
        .select()
        .single()
      if (data) {
        const remote = { id: data.id, text: data.text, progress: data.progress, done: data.done, created: new Date(data.created_at).getTime() }
        setGoals(prev => {
          const next = prev.map(g => g.id === localGoal.id ? remote : g)
          lsSave(next)
          return next
        })
      }
    } catch {}
  }

  function setProgress(id, progress) {
    setGoals(prev => {
      const next = prev.map(g => g.id === id ? { ...g, progress, done: progress === 100 } : g)
      lsSave(next)
      return next
    })
    supabase.from('goals').update({ progress, done: progress === 100 }).eq('id', id).catch(() => {})
  }

  function toggleDone(id) {
    let updates
    setGoals(prev => {
      const goal = prev.find(g => g.id === id)
      if (!goal) return prev
      updates = { done: !goal.done, progress: !goal.done ? 100 : goal.progress }
      const next = prev.map(g => g.id === id ? { ...g, ...updates } : g)
      lsSave(next)
      return next
    })
    if (updates) supabase.from('goals').update(updates).eq('id', id).catch(() => {})
  }

  function deleteGoal(id) {
    setGoals(prev => {
      const next = prev.filter(g => g.id !== id)
      lsSave(next)
      return next
    })
    supabase.from('goals').delete().eq('id', id).catch(() => {})
  }

  const active = goals.filter(g => !g.done)
  const done = goals.filter(g => g.done)

  return (
    <div className="card p-5 animate-slide-up" style={{ animationDelay: '50ms' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-100">Goals</h2>
            <p className="text-xs text-gray-600 uppercase tracking-wide">
              {active.length} active{done.length > 0 ? ` · ${done.length} done` : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 rounded-lg transition-all duration-200 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add goal
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <form onSubmit={addGoal} className="mb-4 animate-slide-up">
          <div className="flex gap-2">
            <input
              autoFocus
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="What do you want to achieve?"
              className="flex-1 px-3 py-2 bg-gray-800/50 border border-purple-500/30 rounded-xl text-gray-100 text-sm focus:outline-none focus:border-purple-500/60 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] transition-all duration-200"
            />
            <button type="submit" className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer">
              Add
            </button>
            <button type="button" onClick={() => setAdding(false)} className="px-3 py-2 text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer">
              ✕
            </button>
          </div>
        </form>
      )}

      {/* Empty state */}
      {goals.length === 0 && !adding && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="animate-float">
            <svg className="w-10 h-10 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm font-medium mt-3">No goals yet</p>
          <p className="text-gray-600 text-xs mt-1">Set a goal and track your progress</p>
        </div>
      )}

      {/* Active goals */}
      {active.length > 0 && (
        <div className="space-y-3">
          {active.map(goal => (
            <GoalItem
              key={goal.id}
              goal={goal}
              onProgress={setProgress}
              onToggle={toggleDone}
              onDelete={deleteGoal}
            />
          ))}
        </div>
      )}

      {/* Completed goals */}
      {done.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800/50">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-2">Completed</p>
          <div className="space-y-2">
            {done.map(goal => (
              <GoalItem
                key={goal.id}
                goal={goal}
                onProgress={setProgress}
                onToggle={toggleDone}
                onDelete={deleteGoal}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function GoalItem({ goal, onProgress, onToggle, onDelete }) {
  const [dragging, setDragging] = useState(false)

  return (
    <div className={`group rounded-xl p-3.5 border transition-all duration-200 ${
      goal.done
        ? 'bg-forge-500/5 border-forge-500/15 opacity-60'
        : 'bg-gray-800/30 border-gray-700/40 hover:border-gray-600/50'
    }`}>
      <div className="flex items-start gap-3">
        {/* Check button */}
        <button
          onClick={() => onToggle(goal.id)}
          className={`mt-0.5 w-[18px] h-[18px] rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 cursor-pointer ${
            goal.done
              ? 'bg-forge-600 border-forge-600'
              : 'border-purple-500/40 hover:border-purple-400 hover:shadow-[0_0_0_3px_rgba(168,85,247,0.1)]'
          }`}
        >
          {goal.done && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug ${goal.done ? 'line-through text-gray-500' : 'text-gray-200'}`}>
            {goal.text}
          </p>

          {/* Progress bar + label */}
          {!goal.done && (
            <div className="mt-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500">Progress</span>
                <span className="text-[10px] font-semibold text-purple-400">{goal.progress}%</span>
              </div>
              <div className="relative h-1.5 bg-gray-700/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              {/* Scrubber */}
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={goal.progress}
                onChange={e => onProgress(goal.id, Number(e.target.value))}
                className="w-full mt-1.5 h-1 opacity-0 cursor-pointer absolute"
                style={{ marginTop: '-10px' }}
              />
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={goal.progress}
                onChange={e => onProgress(goal.id, Number(e.target.value))}
                className="w-full mt-1 cursor-pointer"
                style={{
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  height: '3px',
                  background: 'transparent',
                  outline: 'none',
                  accentColor: 'rgb(168,85,247)',
                }}
              />
            </div>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(goal.id)}
          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400/80 transition-all duration-200 cursor-pointer p-1 rounded-md hover:bg-red-400/10 flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
