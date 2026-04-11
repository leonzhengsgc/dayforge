import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { getUserId } from '../../lib/userScope'

function lsKey() {
  const uid = getUserId()
  return uid ? `dayforge_learning_goals_${uid}` : 'dayforge_learning_goals'
}
function lsLoad() { try { return JSON.parse(localStorage.getItem(lsKey()) || '[]') } catch { return [] } }
function lsSave(goals) { try { localStorage.setItem(lsKey(), JSON.stringify(goals)) } catch {} }

export default function LearningGoalsPanel() {
  const [goals, setGoals] = useState(lsLoad)
  const [input, setInput] = useState('')
  const [adding, setAdding] = useState(false)
  const [targetDate, setTargetDate] = useState('')

  const fetchGoals = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('learning_goals')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) return

      const mapped = (data || []).map(g => ({
        id: g.id,
        text: g.text,
        progress: g.progress,
        done: g.done,
        target_date: g.target_date || null,
        created: new Date(g.created_at).getTime(),
      }))

      if (mapped.length === 0) {
        const local = lsLoad()
        if (local.length > 0) {
          const rows = local.map(g => ({
            text: g.text,
            progress: g.progress || 0,
            done: g.done || false,
            target_date: g.target_date || null,
            user_id: user.id,
          }))
          await supabase.from('learning_goals').insert(rows)
          const { data: refetched } = await supabase
            .from('learning_goals')
            .select('*')
            .order('created_at', { ascending: true })
          if (refetched && refetched.length > 0) {
            const reMapped = refetched.map(g => ({
              id: g.id,
              text: g.text,
              progress: g.progress,
              done: g.done,
              target_date: g.target_date || null,
              created: new Date(g.created_at).getTime(),
            }))
            setGoals(reMapped)
            lsSave(reMapped)
          }
          return
        }
      }

      setGoals(mapped)
      lsSave(mapped)
    } catch {}
  }, [])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  useEffect(() => {
    const channel = supabase
      .channel('learning-goals-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'learning_goals' }, () => {
        fetchGoals()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchGoals])

  async function addGoal(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return

    const date = targetDate || null
    const localGoal = { id: crypto.randomUUID(), text, progress: 0, done: false, target_date: date, created: Date.now() }
    setGoals(prev => {
      const next = [...prev, localGoal]
      lsSave(next)
      return next
    })
    setInput('')
    setTargetDate('')
    setAdding(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('learning_goals')
        .insert({ text, progress: 0, done: false, target_date: date, user_id: user.id })
        .select()
        .single()
      if (data) {
        const remote = { id: data.id, text: data.text, progress: data.progress, done: data.done, target_date: data.target_date || null, created: new Date(data.created_at).getTime() }
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
    supabase.from('learning_goals').update({ progress, done: progress === 100 }).eq('id', id).catch(() => {})
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
    if (updates) supabase.from('learning_goals').update(updates).eq('id', id).catch(() => {})
  }

  function deleteGoal(id) {
    setGoals(prev => {
      const next = prev.filter(g => g.id !== id)
      lsSave(next)
      return next
    })
    supabase.from('learning_goals').delete().eq('id', id).catch(() => {})
  }

  const active = goals.filter(g => !g.done)
  const done = goals.filter(g => g.done)

  return (
    <div className="card p-5 animate-slide-up" style={{ animationDelay: '100ms' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-100">Learning Goals</h2>
            <p className="text-xs text-gray-600 uppercase tracking-wide">
              {active.length} active{done.length > 0 ? ` · ${done.length} done` : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 rounded-lg transition-all duration-200 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add learning goal
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
              placeholder="What do you want to learn?"
              className="flex-1 px-3 py-2 bg-gray-800/50 border border-blue-500/30 rounded-xl text-gray-100 text-sm focus:outline-none focus:border-blue-500/60 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all duration-200"
            />
            <button type="submit" className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer">
              Add
            </button>
            <button type="button" onClick={() => { setAdding(false); setTargetDate('') }} className="px-3 py-2 text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer">
              ✕
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <label className="text-[11px] text-gray-500">Target date</label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="px-2 py-1 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-300 text-xs focus:outline-none focus:border-blue-500/50 transition-all duration-200 [color-scheme:dark]"
            />
            {targetDate && (
              <button
                type="button"
                onClick={() => setTargetDate('')}
                className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
              >
                clear
              </button>
            )}
            {!targetDate && (
              <span className="text-[10px] text-gray-600 italic">optional — leave blank for ongoing</span>
            )}
          </div>
        </form>
      )}

      {/* Empty state */}
      {goals.length === 0 && !adding && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="animate-float">
            <svg className="w-10 h-10 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm font-medium mt-3">No learning goals yet</p>
          <p className="text-gray-600 text-xs mt-1">Track skills and knowledge you want to build</p>
        </div>
      )}

      {/* Active goals */}
      {active.length > 0 && (
        <div className="space-y-3">
          {active.map(goal => (
            <LearningGoalItem
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
              <LearningGoalItem
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

function LearningGoalItem({ goal, onProgress, onToggle, onDelete }) {
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
              : 'border-blue-500/40 hover:border-blue-400 hover:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]'
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
          {goal.target_date && (
            <p className={`text-[10px] mt-0.5 ${
              !goal.done && goal.target_date < new Date().toISOString().slice(0, 10) ? 'text-red-400' :
              !goal.done && goal.target_date === new Date().toISOString().slice(0, 10) ? 'text-amber-400' :
              'text-gray-500'
            }`}>
              {(() => {
                const d = new Date(goal.target_date + 'T00:00:00')
                const today = new Date(); today.setHours(0,0,0,0)
                const diff = Math.round((d - today) / 86400000)
                if (diff === 0) return 'Due today'
                if (diff === 1) return 'Due tomorrow'
                if (diff === -1) return 'Due yesterday'
                if (diff < 0) return `${Math.abs(diff)} days overdue`
                return `Due in ${diff} days — ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              })()}
            </p>
          )}

          {/* Progress bar + slider */}
          {!goal.done && (
            <div className="mt-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500">Progress</span>
                <span className="text-[10px] font-semibold text-blue-400">{goal.progress}%</span>
              </div>
              <div className="relative h-1.5 bg-gray-700/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
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
                  accentColor: 'rgb(59,130,246)',
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
