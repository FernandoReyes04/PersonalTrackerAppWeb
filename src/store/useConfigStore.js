import { create } from 'zustand'

const DEFAULT_SECTIONS = [
    {
        id: 'morning',
        label: 'Rutina Mañanera',
        emoji: '🌅',
        habits: [
            { id: 'morning_face',  label: 'Lavarse la cara',    recurrence: 'daily', type: 'checkbox', sets: 3, reps: 12, weight: 0, unit: 'kg' },
            { id: 'morning_teeth', label: 'Cepillado mañana',   recurrence: 'daily', type: 'checkbox', sets: 3, reps: 12, weight: 0, unit: 'kg' },
            { id: 'morning_cream', label: 'Crema humectante',    recurrence: 'daily', type: 'checkbox', sets: 3, reps: 12, weight: 0, unit: 'kg' },
        ],
    },
    {
        id: 'gym',
        label: 'Gym',
        emoji: '💪',
        habits: [
            { id: 'gym', label: 'Sesión de gym', recurrence: 'daily', type: 'checkbox', sets: 3, reps: 12, weight: 0, unit: 'kg' },
        ],
    },
    {
        id: 'content',
        label: 'Contenido',
        emoji: '🎬',
        habits: [
            { id: 'content', label: 'Grabar / Editar video', recurrence: 'daily', type: 'checkbox', sets: 3, reps: 12, weight: 0, unit: 'kg' },
        ],
    },
    {
        id: 'hygiene',
        label: 'Higiene',
        emoji: '🚿',
        habits: [
            { id: 'teeth_afternoon', label: 'Cepillado tarde',         recurrence: 'daily', type: 'checkbox', sets: 3, reps: 12, weight: 0, unit: 'kg' },
            { id: 'teeth_night',     label: 'Cepillado noche',         recurrence: 'daily', type: 'checkbox', sets: 3, reps: 12, weight: 0, unit: 'kg' },
            { id: 'elbow_cream',     label: 'Crema codos (post-baño)', recurrence: 'daily', type: 'checkbox', sets: 3, reps: 12, weight: 0, unit: 'kg' },
        ],
    },
]

function normalizeHabit(h) {
    return {
        recurrence: 'daily',
        type: 'checkbox',
        sets: 3,
        reps: 12,
        weight: 0,
        unit: 'kg',
        ...h,
    }
}

function loadSections() {
    try {
        const raw = localStorage.getItem('fer-sections')
        if (raw) {
            const parsed = JSON.parse(raw)
            return parsed.map(s => ({ ...s, habits: s.habits.map(normalizeHabit) }))
        }
    } catch { /* ignore */ }
    return DEFAULT_SECTIONS
}

function saveSections(sections) {
    localStorage.setItem('fer-sections', JSON.stringify(sections))
}

let counter = Date.now()
function uid() {
    return `s${++counter}`
}

export const useConfigStore = create((set) => ({
    sections: loadSections(),

    addSection: (label, emoji) => {
        const id = uid()
        set(state => {
            const sections = [...state.sections, { id, label, emoji, habits: [] }]
            saveSections(sections)
            return { sections }
        })
        return id
    },

    removeSection: (sectionId) => {
        set(state => {
            const sections = state.sections.filter(s => s.id !== sectionId)
            saveSections(sections)
            return { sections }
        })
    },

    addHabit: (sectionId, label) => {
        const habitId = uid()
        set(state => {
            const sections = state.sections.map(s =>
                s.id === sectionId
                    ? {
                          ...s,
                          habits: [
                              ...s.habits,
                              {
                                  id: habitId, label,
                                  recurrence: 'daily',
                                  type: 'checkbox',
                                  sets: 3, reps: 12, weight: 0, unit: 'kg',
                              },
                          ],
                      }
                    : s
            )
            saveSections(sections)
            return { sections }
        })
        return habitId
    },

    removeHabit: (sectionId, habitId) => {
        set(state => {
            const sections = state.sections.map(s =>
                s.id === sectionId
                    ? { ...s, habits: s.habits.filter(h => h.id !== habitId) }
                    : s
            )
            saveSections(sections)
            return { sections }
        })
    },

    updateHabitRecurrence: (sectionId, habitId, recurrence) => {
        set(state => {
            const sections = state.sections.map(s =>
                s.id === sectionId
                    ? {
                          ...s,
                          habits: s.habits.map(h =>
                              h.id === habitId ? { ...h, recurrence } : h
                          ),
                      }
                    : s
            )
            saveSections(sections)
            return { sections }
        })
    },

    // Update any metadata field(s) on a habit (type, sets, reps, weight, unit, etc.)
    updateHabitMeta: (sectionId, habitId, meta) => {
        set(state => {
            const sections = state.sections.map(s =>
                s.id === sectionId
                    ? {
                          ...s,
                          habits: s.habits.map(h =>
                              h.id === habitId ? { ...h, ...meta } : h
                          ),
                      }
                    : s
            )
            saveSections(sections)
            return { sections }
        })
    },
}))
