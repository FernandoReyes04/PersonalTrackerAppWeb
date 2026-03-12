import { create } from 'zustand'

const STORAGE_KEY = 'fer-custom-panels'

let counter = Date.now()
const uid = () => `cp${++counter}`

function normalizeHabit(h) {
  return {
    recurrence: 'none',
    lastCompleted: null,
    type: 'checkbox',
    sets: 3,
    reps: 12,
    weight: 0,
    unit: 'kg',
    ...h,
  }
}

function normalizePanels(panels) {
  return panels.map(p => ({
    ...p,
    sections: p.sections.map(s => ({
      ...s,
      habits: s.habits.map(normalizeHabit),
    })),
  }))
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return normalizePanels(JSON.parse(raw))
  } catch { /* ignore */ }
  return []
}

function save(panels) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(panels))
}

function weekStart(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return d.getTime()
}

function shouldReset(habit) {
  const { recurrence, lastCompleted, done } = habit
  if (!done || !lastCompleted || recurrence === 'none') return false

  const now = new Date()
  const last = new Date(lastCompleted)

  if (recurrence === 'daily') {
    return now.toISOString().split('T')[0] !== last.toISOString().split('T')[0]
  }
  if (recurrence === 'weekly') {
    return weekStart(now) !== weekStart(last)
  }
  if (recurrence === 'monthly') {
    return now.getFullYear() !== last.getFullYear() || now.getMonth() !== last.getMonth()
  }
  if (recurrence === 'annual') {
    return now.getFullYear() !== last.getFullYear()
  }
  return false
}

function applyResets(panels) {
  let changed = false
  const result = panels.map(p => ({
    ...p,
    sections: p.sections.map(s => ({
      ...s,
      habits: s.habits.map(h => {
        if (shouldReset(h)) {
          changed = true
          return { ...h, done: false, lastCompleted: null }
        }
        return h
      }),
    })),
  }))
  return { panels: result, changed }
}

// Run resets at module init
const rawPanels = load()
const { panels: initialPanels, changed: initChanged } = applyResets(rawPanels)
if (initChanged) save(initialPanels)

export const useCustomPanelsStore = create((set) => ({
  panels: initialPanels,

  addPanel: (label, emoji) => {
    const id = uid()
    set(state => {
      const panels = [...state.panels, { id, label, emoji, sections: [] }]
      save(panels)
      return { panels }
    })
    return id
  },

  removePanel: (panelId) => {
    set(state => {
      const panels = state.panels.filter(p => p.id !== panelId)
      save(panels)
      return { panels }
    })
  },

  addSection: (panelId, label, emoji) => {
    const id = uid()
    set(state => {
      const panels = state.panels.map(p =>
        p.id === panelId
          ? { ...p, sections: [...p.sections, { id, label, emoji, habits: [] }] }
          : p
      )
      save(panels)
      return { panels }
    })
    return id
  },

  removeSection: (panelId, sectionId) => {
    set(state => {
      const panels = state.panels.map(p =>
        p.id === panelId
          ? { ...p, sections: p.sections.filter(s => s.id !== sectionId) }
          : p
      )
      save(panels)
      return { panels }
    })
  },

  addHabit: (panelId, sectionId, label) => {
    const id = uid()
    set(state => {
      const panels = state.panels.map(p =>
        p.id === panelId
          ? {
              ...p,
              sections: p.sections.map(s =>
                s.id === sectionId
                  ? {
                      ...s,
                      habits: [
                        ...s.habits,
                        {
                          id, label,
                          done: false,
                          recurrence: 'none',
                          lastCompleted: null,
                          type: 'checkbox',
                          sets: 3, reps: 12, weight: 0, unit: 'kg',
                        },
                      ],
                    }
                  : s
              ),
            }
          : p
      )
      save(panels)
      return { panels }
    })
    return id
  },

  removeHabit: (panelId, sectionId, habitId) => {
    set(state => {
      const panels = state.panels.map(p =>
        p.id === panelId
          ? {
              ...p,
              sections: p.sections.map(s =>
                s.id === sectionId
                  ? { ...s, habits: s.habits.filter(h => h.id !== habitId) }
                  : s
              ),
            }
          : p
      )
      save(panels)
      return { panels }
    })
  },

  toggleHabit: (panelId, sectionId, habitId) => {
    set(state => {
      const panels = state.panels.map(p =>
        p.id === panelId
          ? {
              ...p,
              sections: p.sections.map(s =>
                s.id === sectionId
                  ? {
                      ...s,
                      habits: s.habits.map(h => {
                        if (h.id !== habitId) return h
                        const nowDone = !h.done
                        return {
                          ...h,
                          done: nowDone,
                          lastCompleted: nowDone ? new Date().toISOString() : null,
                        }
                      }),
                    }
                  : s
              ),
            }
          : p
      )
      save(panels)
      return { panels }
    })
  },

  updateHabitRecurrence: (panelId, sectionId, habitId, recurrence) => {
    set(state => {
      const panels = state.panels.map(p =>
        p.id === panelId
          ? {
              ...p,
              sections: p.sections.map(s =>
                s.id === sectionId
                  ? {
                      ...s,
                      habits: s.habits.map(h =>
                        h.id === habitId ? { ...h, recurrence } : h
                      ),
                    }
                  : s
              ),
            }
          : p
      )
      save(panels)
      return { panels }
    })
  },

  // Update any metadata field(s) on a habit (type, sets, reps, weight, unit, etc.)
  updateHabitMeta: (panelId, sectionId, habitId, meta) => {
    set(state => {
      const panels = state.panels.map(p =>
        p.id === panelId
          ? {
              ...p,
              sections: p.sections.map(s =>
                s.id === sectionId
                  ? {
                      ...s,
                      habits: s.habits.map(h =>
                        h.id === habitId ? { ...h, ...meta } : h
                      ),
                    }
                  : s
              ),
            }
          : p
      )
      save(panels)
      return { panels }
    })
  },
}))
