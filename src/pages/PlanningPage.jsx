import { useState, useEffect, useCallback } from 'react'
import AppShell from '../components/layout/AppShell'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const PLAN_STATUSES = [
  { key: 'draft', label: 'Draft', color: 'gray' },
  { key: 'active', label: 'Active', color: 'amber' },
  { key: 'completed', label: 'Completed', color: 'forge' },
]

const STATUS_COLORS = {
  draft: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', dot: 'bg-gray-400' },
  active: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400' },
  completed: { bg: 'bg-forge-500/10', text: 'text-forge-400', border: 'border-forge-500/20', dot: 'bg-forge-400' },
}

export default function PlanningPage() {
  const { user } = useAuth()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [newPlan, setNewPlan] = useState({ title: '', vision: '', goals: '', status: 'draft' })

  const fetchPlans = useCallback(async () => {
    const { data } = await supabase
      .from('plans')
      .select('*')
      .order('created_at', { ascending: false })
    setPlans(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  async function createPlan(e) {
    e.preventDefault()
    if (!newPlan.title.trim()) return

    const { data, error } = await supabase
      .from('plans')
      .insert({
        title: newPlan.title.trim(),
        vision: newPlan.vision.trim(),
        goals: newPlan.goals.trim(),
        status: newPlan.status,
        user_id: user.id,
      })
      .select()
      .single()

    if (!error && data) {
      setPlans(prev => [data, ...prev])
      setNewPlan({ title: '', vision: '', goals: '', status: 'draft' })
      setShowNew(false)
    }
  }

  async function updateStatus(id, status) {
    await supabase.from('plans').update({ status }).eq('id', id)
    setPlans(prev => prev.map(p => p.id === id ? { ...p, status } : p))
  }

  async function deletePlan(id) {
    await supabase.from('plans').delete().eq('id', id)
    setPlans(prev => prev.filter(p => p.id !== id))
  }

  const grouped = {
    active: plans.filter(p => p.status === 'active'),
    draft: plans.filter(p => p.status === 'draft'),
    completed: plans.filter(p => p.status === 'completed'),
  }

  return (
    <AppShell>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Planning</h1>
              <p className="text-sm text-gray-500">Vision docs, goals, and strategic plans</p>
            </div>
          </div>
          <button
            onClick={() => setShowNew(!showNew)}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.97] flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Plan
          </button>
        </div>

        {/* New plan form */}
        {showNew && (
          <div className="card p-6 mb-8 animate-slide-up">
            <h3 className="text-lg font-bold text-gray-100 mb-4">Create a new plan</h3>
            <form onSubmit={createPlan} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">Title</label>
                <input
                  type="text"
                  value={newPlan.title}
                  onChange={e => setNewPlan(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Q2 Product Roadmap"
                  required
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 text-sm focus:outline-none focus:border-amber-500/50 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.1)] transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">Vision</label>
                <textarea
                  value={newPlan.vision}
                  onChange={e => setNewPlan(p => ({ ...p, vision: e.target.value }))}
                  placeholder="What does success look like? Describe the end state..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 text-sm focus:outline-none focus:border-amber-500/50 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.1)] transition-all duration-200 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">Key Goals</label>
                <textarea
                  value={newPlan.goals}
                  onChange={e => setNewPlan(p => ({ ...p, goals: e.target.value }))}
                  placeholder="One goal per line..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 text-sm focus:outline-none focus:border-amber-500/50 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.1)] transition-all duration-200 resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={newPlan.status}
                  onChange={e => setNewPlan(p => ({ ...p, status: e.target.value }))}
                  className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-100 text-sm focus:outline-none cursor-pointer"
                >
                  {PLAN_STATUSES.map(s => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer"
                >
                  Create Plan
                </button>
                <button
                  type="button"
                  onClick={() => setShowNew(false)}
                  className="px-4 py-2.5 text-gray-400 hover:text-gray-200 text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="card p-5 animate-shimmer">
                <div className="h-5 bg-gray-800/40 rounded w-1/3 mb-3" />
                <div className="h-4 bg-gray-800/40 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="animate-float">
              <svg className="w-16 h-16 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm font-medium mt-4">No plans yet</p>
            <p className="text-gray-600 text-xs mt-1">Create your first vision doc or strategic plan</p>
          </div>
        ) : (
          <div className="space-y-8">
            {['active', 'draft', 'completed'].map(statusKey => {
              const items = grouped[statusKey]
              if (items.length === 0) return null
              const statusInfo = PLAN_STATUSES.find(s => s.key === statusKey)
              const colors = STATUS_COLORS[statusKey]

              return (
                <section key={statusKey}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                    <h2 className={`text-sm font-semibold uppercase tracking-wider ${colors.text}`}>
                      {statusInfo.label} ({items.length})
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {items.map(plan => (
                      <div key={plan.id} className={`card p-5 transition-all duration-200 ${expandedId === plan.id ? '' : 'cursor-pointer hover:bg-gray-800/30'}`}>
                        <div className="flex items-start justify-between" onClick={() => setExpandedId(expandedId === plan.id ? null : plan.id)}>
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-gray-100">{plan.title}</h3>
                            {plan.vision && !expandedId && (
                              <p className="text-sm text-gray-500 mt-1" style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {plan.vision}
                              </p>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${colors.bg} ${colors.text} border ${colors.border} ml-3 flex-shrink-0`}>
                            {statusInfo.label.toUpperCase()}
                          </span>
                        </div>

                        {expandedId === plan.id && (
                          <div className="mt-4 pt-4 border-t border-gray-800/50 animate-slide-up space-y-4">
                            {plan.vision && (
                              <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Vision</p>
                                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{plan.vision}</p>
                              </div>
                            )}
                            {plan.goals && (
                              <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Goals</p>
                                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{plan.goals}</p>
                              </div>
                            )}
                            <div className="flex items-center gap-2 pt-2">
                              {PLAN_STATUSES.filter(s => s.key !== plan.status).map(s => (
                                <button
                                  key={s.key}
                                  onClick={(e) => { e.stopPropagation(); updateStatus(plan.id, s.key) }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${STATUS_COLORS[s.key].bg} ${STATUS_COLORS[s.key].text} border ${STATUS_COLORS[s.key].border} hover:opacity-80`}
                                >
                                  Move to {s.label}
                                </button>
                              ))}
                              <button
                                onClick={(e) => { e.stopPropagation(); deletePlan(plan.id) }}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 transition-all duration-200 cursor-pointer ml-auto"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
