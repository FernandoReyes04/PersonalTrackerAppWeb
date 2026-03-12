import { create } from 'zustand'

const ROUTINES_KEY = 'fer-gym-routines'
const TIMER_KEY    = 'fer-gym-timer'
const LABELS_KEY   = 'fer-gym-labels'

function loadRoutines() {
  try {
    const stored = localStorage.getItem(ROUTINES_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  // Empty by default — user builds their own
  return { push: [], pull: [], legs: [], cardio: [] }
}

function loadLabels() {
  try {
    const stored = localStorage.getItem(LABELS_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return {}
}

function persist(routines) {
  localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines))
}

export const useGymStore = create((set, get) => ({
  routines: loadRoutines(),
  gymLabels: loadLabels(),
  timerDefault: parseInt(localStorage.getItem(TIMER_KEY) || '90', 10),

  getRoutine: (dayType, pushPullChoice = null) => {
    const { routines } = get()
    const key = dayType === 'push_pull' ? pushPullChoice : dayType
    return key ? (routines[key] ?? []) : []
  },

  setGymLabel: (key, label) => {
    const labels = { ...get().gymLabels, [key]: label }
    localStorage.setItem(LABELS_KEY, JSON.stringify(labels))
    set({ gymLabels: labels })
  },

  updateExercise: (routineKey, exerciseId, changes) => {
    const { routines } = get()
    const updated = {
      ...routines,
      [routineKey]: routines[routineKey].map(ex =>
        ex.id === exerciseId ? { ...ex, ...changes } : ex
      ),
    }
    persist(updated)
    set({ routines: updated })
  },

  addExercise: (routineKey, exercise) => {
    const { routines } = get()
    const updated = {
      ...routines,
      [routineKey]: [...(routines[routineKey] ?? []), exercise],
    }
    persist(updated)
    set({ routines: updated })
  },

  removeExercise: (routineKey, exerciseId) => {
    const { routines } = get()
    const updated = {
      ...routines,
      [routineKey]: routines[routineKey].filter(ex => ex.id !== exerciseId),
    }
    persist(updated)
    set({ routines: updated })
  },

  setTimerDefault: (seconds) => {
    localStorage.setItem(TIMER_KEY, String(seconds))
    set({ timerDefault: seconds })
  },
}))
