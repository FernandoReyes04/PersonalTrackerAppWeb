import { create } from 'zustand'

const STORAGE_KEY = 'fer-habit-completions'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {}
}

function save(completions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(completions))
}

// Monday of the ISO week containing `date`
function weekStart(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0=Sun
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return d.getTime()
}

/**
 * Returns true  → habit is done (completed within the recurrence window)
 * Returns null  → no recurrence override, defer to daily_log state
 */
export function computeRecurrenceDone(lastCompleted, recurrence) {
  if (!lastCompleted) return null
  const now = new Date()
  const last = new Date(lastCompleted)

  if (recurrence === 'weekly') {
    return weekStart(now) === weekStart(last) ? true : null
  }
  if (recurrence === 'monthly') {
    const sameMonth =
      now.getFullYear() === last.getFullYear() &&
      now.getMonth() === last.getMonth()
    return sameMonth ? true : null
  }
  if (recurrence === 'annual') {
    return now.getFullYear() === last.getFullYear() ? true : null
  }
  return null
}

// Build { [habitId]: recurrence } from fer-sections without importing useConfigStore
function loadRecurrenceMap() {
  try {
    const raw = localStorage.getItem('fer-sections')
    if (!raw) return {}
    const sections = JSON.parse(raw)
    const map = {}
    sections.forEach(s => s.habits?.forEach(h => {
      if (h.id && h.recurrence) map[h.id] = h.recurrence
    }))
    return map
  } catch { return {} }
}

// Remove completions whose recurrence window has expired or whose habit no longer exists
function purgeStale(completions) {
  const recurrenceMap = loadRecurrenceMap()
  let changed = false
  const cleaned = {}
  for (const [id, ts] of Object.entries(completions)) {
    const rec = recurrenceMap[id]
    if (rec && computeRecurrenceDone(ts, rec) !== null) {
      cleaned[id] = ts  // still within window — keep
    } else {
      changed = true    // expired or habit deleted — drop
    }
  }
  return { completions: cleaned, changed }
}

const rawCompletions = load()
const { completions: initialCompletions, changed: initChanged } = purgeStale(rawCompletions)
if (initChanged) save(initialCompletions)

export const useRecurrenceStore = create((set) => ({
  completions: initialCompletions,

  markDone: (habitId) => {
    set(state => {
      const completions = { ...state.completions, [habitId]: new Date().toISOString() }
      save(completions)
      return { completions }
    })
  },

  markUndone: (habitId) => {
    set(state => {
      const completions = { ...state.completions }
      delete completions[habitId]
      save(completions)
      return { completions }
    })
  },
}))
