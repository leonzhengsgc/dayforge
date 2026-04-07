import { supabase } from './supabase'

let _cachedUserId = null

export function getUserId() {
  if (_cachedUserId) return _cachedUserId

  // Check demo mode
  if (localStorage.getItem('dayforge_demo') === 'true') {
    _cachedUserId = 'demo-user'
    return _cachedUserId
  }

  // Try to get from Supabase session synchronously (stored in localStorage by Supabase)
  try {
    const storageKey = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'))
    if (storageKey) {
      const session = JSON.parse(localStorage.getItem(storageKey))
      if (session?.user?.id) {
        _cachedUserId = session.user.id
        return _cachedUserId
      }
    }
  } catch {}

  return null
}

export function setUserId(id) {
  _cachedUserId = id
}

export function clearUserId() {
  _cachedUserId = null
}

export function clearUserLocalStorage() {
  const uid = getUserId()
  if (!uid) return

  const keysToRemove = []
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key && key.startsWith('dayforge_') && key.includes(`_${uid}_`)) {
      keysToRemove.push(key)
    }
  }
  // Also clear non-scoped legacy keys
  const legacyKeys = ['dayforge_goals', 'dayforge_plans']
  legacyKeys.forEach(k => { if (localStorage.getItem(k)) keysToRemove.push(k) })

  keysToRemove.forEach(k => localStorage.removeItem(k))
}
