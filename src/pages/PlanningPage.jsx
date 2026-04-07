import { useState, useEffect, useCallback, useRef } from 'react'

import { getUserId } from '../lib/userScope'

function lsKey() {
  const uid = getUserId()
  return uid ? `dayforge_plans_${uid}` : 'dayforge_plans'
}
function lsLoad() { try { return JSON.parse(localStorage.getItem(lsKey()) || '[]') } catch { return [] } }
function lsSave(plans) { try { localStorage.setItem(lsKey(), JSON.stringify(plans)) } catch {} }

function AutoTextarea({ value, onChange, placeholder, className }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [value])
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={1}
      style={{ overflow: 'hidden', resize: 'none' }}
      className={className}
    />
  )
}
import AppShell from '../components/layout/AppShell'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const CUR_Q = Math.ceil((new Date().getMonth() + 1) / 3)
const CUR_YEAR = new Date().getFullYear()

const TEMPLATES = [
  {
    id: 'vision',
    label: 'Vision Doc',
    emoji: '🔭',
    description: 'Clarify where you\'re going and why it matters',
    color: 'purple',
    fill: {
      title: `Vision ${CUR_YEAR + 1}`,
      vision: `━━ PURPOSE ━━\nWhy does this exist? What problem are we ultimately solving?\n[Answer here]\n\n━━ NORTH STAR ━━\nOne sentence that captures where we are going:\n[Answer here]\n\n━━ 3-YEAR PICTURE ━━\nIf everything goes right, in 3 years we will have:\n- \n- \n- \n\n━━ SUCCESS METRICS ━━\nWe will know we've arrived when we can measure:\n- Metric 1: \n- Metric 2: \n- Metric 3: \n\n━━ CORE BELIEFS ━━\nThe non-negotiable principles that guide every decision:\n1. We believe that...\n2. We will never...\n3. We always...`,
      goals: `━━ 12-MONTH MILESTONES ━━\nThe specific things that must be true by end of year:\n[ ] Milestone 1: \n[ ] Milestone 2: \n[ ] Milestone 3: \n[ ] Milestone 4: \n\n━━ MUST ACHIEVE (Top 3 Priorities) ━━\nIf we only do three things this year, they are:\n1. \n2. \n3. \n\n━━ ANTI-GOALS (What We Are NOT Doing) ━━\nExplicitly out of scope — helps avoid distraction:\n- We will NOT: \n- We will NOT: \n- We will NOT: \n\n━━ DEPENDENCIES & RESOURCES ━━\nWhat do we need to make this vision real?\n- People: \n- Budget: \n- Tools/systems: \n- External partners: \n\n━━ BIGGEST RISK TO THIS VISION ━━\nWhat is the single most likely thing to derail us?\n[Answer here]\n\nHow we'll mitigate it:\n[Answer here]`,
      status: 'draft',
    },
  },
  {
    id: 'plan',
    label: 'Strategic Plan',
    emoji: '🗺️',
    description: 'Map out every step from idea to execution',
    color: 'amber',
    fill: {
      title: 'Strategic Plan — ',
      vision: `━━ SITUATION ANALYSIS ━━\nWhat is the current state of play?\n[Describe where things stand today]\n\n━━ PROBLEM STATEMENT ━━\nThe specific problem this plan solves:\n[Answer here]\n\n━━ TARGET OUTCOME ━━\nWhat does success look like when this plan is complete?\n[Answer here]\n\n━━ UNIQUE INSIGHT ━━\nWhat do we know or believe that others don't?\n[The core insight that makes this plan right]\n\n━━ WHO IS THIS FOR ━━\nPrimary audience / stakeholder:\n- Who benefits most: \n- Their biggest pain: \n- What they value: \n\n━━ COMPETITIVE ADVANTAGE ━━\nWhy are WE the ones to execute this?\n[Answer here]`,
      goals: `━━ OBJECTIVES & KEY RESULTS ━━\n\nObjective 1: \n  KR 1.1: \n  KR 1.2: \n  KR 1.3: \n\nObjective 2: \n  KR 2.1: \n  KR 2.2: \n  KR 2.3: \n\nObjective 3: \n  KR 3.1: \n  KR 3.2: \n  KR 3.3: \n\n━━ EXECUTION PHASES ━━\n\nPhase 1 — Foundation (Month 1–2):\n[ ] \n[ ] \n[ ] \nDeliverable: \n\nPhase 2 — Build (Month 3–4):\n[ ] \n[ ] \n[ ] \nDeliverable: \n\nPhase 3 — Launch (Month 5–6):\n[ ] \n[ ] \n[ ] \nDeliverable: \n\n━━ RISKS & MITIGATIONS ━━\nRisk 1: \n  Mitigation: \n\nRisk 2: \n  Mitigation: \n\n━━ DECISION LOG ━━\nKey decisions made while building this plan:\n- [Date]: \n- [Date]: `,
      status: 'active',
    },
  },
  {
    id: 'quarterly',
    label: 'Quarterly Planner',
    emoji: '📅',
    description: 'Nail this quarter with focused priorities',
    color: 'forge',
    fill: {
      title: `Q${CUR_Q} ${CUR_YEAR} Planner`,
      vision: `━━ QUARTER THEME ━━\nOne word or phrase that defines this quarter:\n[e.g. "Foundation", "Growth", "Consolidation"]\n\n━━ TOP 3 PRIORITIES ━━\nIf I only accomplish these three things this quarter, I win:\n1. \n2. \n3. \n\n━━ WHAT DOES A SUCCESSFUL QUARTER LOOK LIKE? ━━\n[Describe the end state. Be specific — numbers, deliverables, feelings]\n\n━━ WHAT AM I CARRYING OVER FROM LAST QUARTER? ━━\nUnfinished business / lessons learned:\n- \n- \n\n━━ WHAT AM I DROPPING THIS QUARTER? ━━\nThings I'm intentionally not doing to stay focused:\n- \n- `,
      goals: `━━ MONTHLY BREAKDOWN ━━\n\nMonth 1 — [Theme]:\n[ ] Week 1: \n[ ] Week 2: \n[ ] Week 3: \n[ ] Week 4: \nMonth 1 goal: \n\nMonth 2 — [Theme]:\n[ ] Week 1: \n[ ] Week 2: \n[ ] Week 3: \n[ ] Week 4: \nMonth 2 goal: \n\nMonth 3 — [Theme]:\n[ ] Week 1: \n[ ] Week 2: \n[ ] Week 3: \n[ ] Week 4: \nMonth 3 goal: \n\n━━ WEEKLY CHECK-IN PROMPTS ━━\nUse these every Monday:\n1. What's the #1 thing I must do this week?\n2. What is threatening my quarterly priorities?\n3. What did I learn last week?\n\n━━ END-OF-QUARTER RETROSPECTIVE ━━\nAnswer these at quarter close:\n- What went well: \n- What didn't: \n- What I'll do differently: \n- Carry into next quarter: `,
      status: 'active',
    },
  },
  {
    id: 'swot',
    label: 'SWOT Analysis',
    emoji: '⚡',
    description: 'Audit your position before making a big move',
    color: 'news',
    fill: {
      title: 'SWOT Analysis — ',
      vision: `━━ CONTEXT ━━\nWhat decision or situation is this analysis for?\n[e.g. "Launching a new product", "Entering a new market", "Evaluating a career pivot"]\n\n━━ SCOPE ━━\nAre we analyzing: [ ] A business  [ ] A product  [ ] A person  [ ] A project\nTime horizon: \nKey question this SWOT must answer: \n\n━━ STRENGTHS (Internal — What We're Good At) ━━\nS1. \nS2. \nS3. \nS4. \nS5. \n\nProbing questions to find real strengths:\n→ What do we do better than anyone else?\n→ What unique resources or knowledge do we have?\n→ What do customers/others praise us for?\n→ What advantages do we have that others can't easily copy?\n\n━━ WEAKNESSES (Internal — What Holds Us Back) ━━\nW1. \nW2. \nW3. \nW4. \nW5. \n\nProbing questions to uncover real weaknesses:\n→ What do we consistently fail at or avoid?\n→ Where do we lose to competitors?\n→ What do we lack (skills, capital, tech, people)?\n→ What would our critics say about us?`,
      goals: `━━ OPPORTUNITIES (External — What We Can Exploit) ━━\nO1. \nO2. \nO3. \nO4. \nO5. \n\nProbing questions to spot real opportunities:\n→ What trends are working in our favour?\n→ What gaps exist in the market right now?\n→ What changes (tech, regulation, culture) could we ride?\n→ What are our competitors failing to do?\n\n━━ THREATS (External — What Could Hurt Us) ━━\nT1. \nT2. \nT3. \nT4. \nT5. \n\nProbing questions to identify real threats:\n→ What are our competitors doing better?\n→ What external changes could undermine us?\n→ What customer behaviours are shifting away from us?\n→ What regulations or market forces could block us?\n\n━━ STRATEGIC ACTIONS (The SO-ST-WO-WT Matrix) ━━\n\nSO Strategies — Use Strengths to seize Opportunities:\n→ \n→ \n\nST Strategies — Use Strengths to neutralise Threats:\n→ \n→ \n\nWO Strategies — Overcome Weaknesses by exploiting Opportunities:\n→ \n→ \n\nWT Strategies — Minimise Weaknesses to avoid Threats:\n→ \n→ \n\n━━ TOP 3 ACTIONS FROM THIS SWOT ━━\n1. \n2. \n3. `,
      status: 'draft',
    },
  },
  {
    id: 'scratch',
    label: 'From Scratch',
    emoji: '✏️',
    description: 'Blank canvas — your rules, your structure',
    color: 'gray',
    fill: {
      title: '',
      vision: '',
      goals: '',
      status: 'draft',
    },
  },
]

const TEMPLATE_COLORS = {
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', hover: 'hover:bg-purple-500/20 hover:border-purple-500/40' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', hover: 'hover:bg-amber-500/20 hover:border-amber-500/40' },
  gray: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', hover: 'hover:bg-gray-500/20 hover:border-gray-500/40' },
  forge: { bg: 'bg-forge-500/10', text: 'text-forge-400', border: 'border-forge-500/20', hover: 'hover:bg-forge-500/20 hover:border-forge-500/40' },
  news: { bg: 'bg-news-500/10', text: 'text-news-400', border: 'border-news-500/20', hover: 'hover:bg-news-500/20 hover:border-news-500/40' },
}

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
  const [showTemplates, setShowTemplates] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [newPlan, setNewPlan] = useState({ title: '', vision: '', goals: '', status: 'draft' })

  const fetchPlans = useCallback(async () => {
    const local = lsLoad()
    if (local.length > 0) {
      setPlans(local)
      setLoading(false)
    }
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error && data) {
        setPlans(data)
        lsSave(data)
      }
    } catch {}
    setLoading(false)
  }, [])

  // Realtime subscription for cross-device sync
  useEffect(() => {
    const channel = supabase
      .channel('plans-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plans' }, () => {
        fetchPlans()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchPlans])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  async function createPlan(e) {
    e.preventDefault()
    if (!newPlan.title.trim()) return

    // Create locally first — instant feedback, always works
    const localPlan = {
      id: crypto.randomUUID(),
      title: newPlan.title.trim(),
      vision: newPlan.vision.trim(),
      goals: newPlan.goals.trim(),
      status: newPlan.status,
      user_id: user?.id || 'local',
      created_at: new Date().toISOString(),
    }
    const updated = [localPlan, ...plans]
    setPlans(updated)
    lsSave(updated)
    setNewPlan({ title: '', vision: '', goals: '', status: 'draft' })
    setShowNew(false)
    setShowTemplates(false)

    // Then sync to Supabase in background
    try {
      const { data } = await supabase
        .from('plans')
        .insert({
          title: localPlan.title,
          vision: localPlan.vision,
          goals: localPlan.goals,
          status: localPlan.status,
          user_id: user?.id,
        })
        .select()
        .single()
      // Replace local ID with Supabase ID
      if (data) {
        setPlans(prev => {
          const next = prev.map(p => p.id === localPlan.id ? data : p)
          lsSave(next)
          return next
        })
      }
    } catch {}
  }

  async function updateStatus(id, status) {
    setPlans(prev => {
      const next = prev.map(p => p.id === id ? { ...p, status } : p)
      lsSave(next)
      return next
    })
    try { await supabase.from('plans').update({ status }).eq('id', id) } catch {}
  }

  async function deletePlan(id) {
    setPlans(prev => {
      const next = prev.filter(p => p.id !== id)
      lsSave(next)
      return next
    })
    try { await supabase.from('plans').delete().eq('id', id) } catch {}
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
              <p className="text-sm text-gray-500">How to achieve your vision</p>
            </div>
          </div>
          <button
            onClick={() => { setShowTemplates(true); setShowNew(false) }}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.97] flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Plan
          </button>
        </div>

        {/* Template picker */}
        {showTemplates && !showNew && (
          <div className="card p-6 mb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-100">Choose a template</h3>
              <button onClick={() => setShowTemplates(false)} className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {TEMPLATES.map(t => {
                const c = TEMPLATE_COLORS[t.color]
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setNewPlan({ ...t.fill })
                      setShowTemplates(false)
                      setShowNew(true)
                    }}
                    className={`flex flex-col items-start gap-2 p-4 rounded-xl border ${c.bg} ${c.border} ${c.hover} transition-all duration-200 cursor-pointer text-left group`}
                  >
                    <span className="text-2xl">{t.emoji}</span>
                    <div>
                      <p className={`text-sm font-semibold ${c.text}`}>{t.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* New plan form */}
        {showNew && (
          <div className="card p-6 mb-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => { setShowNew(false); setShowTemplates(true) }}
                className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-lg font-bold text-gray-100">Create a new plan</h3>
            </div>
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
                <AutoTextarea
                  value={newPlan.vision}
                  onChange={e => setNewPlan(p => ({ ...p, vision: e.target.value }))}
                  placeholder="What does success look like? Describe the end state..."
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 text-sm focus:outline-none focus:border-amber-500/50 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.1)] transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">Key Goals</label>
                <AutoTextarea
                  value={newPlan.goals}
                  onChange={e => setNewPlan(p => ({ ...p, goals: e.target.value }))}
                  placeholder="One goal per line..."
                  className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-100 text-sm focus:outline-none focus:border-amber-500/50 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.1)] transition-all duration-200"
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
                  onClick={() => { setShowNew(false); setShowTemplates(false) }}
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
