import { create } from 'zustand'
import { getOrCreateLog, saveLog, getLast7Days, rebuildLogHabits } from '../db/db'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export const useTrackerStore = create((set, get) => ({
  currentDate: todayStr(),
  currentLog: null,
  weekLogs: [],
  loading: true,

  setDate: async (dateStr, sections) => {
    set({ loading: true, currentDate: dateStr })
    const log = await getOrCreateLog(dateStr, sections)
    set({ currentLog: log, loading: false })
  },

  loadToday: async (sections) => {
    const today = todayStr()
    set({ loading: true, currentDate: today })
    const log = await getOrCreateLog(today, sections)
    const weekLogs = await getLast7Days()
    set({ currentLog: log, weekLogs, loading: false })
  },

  // Re-sync the current log when sections/habits are added or removed
  syncSections: async (sections) => {
    const { currentLog } = get()
    if (!currentLog) return
    const updated = rebuildLogHabits(currentLog, sections)
    await saveLog(updated)
    const weekLogs = await getLast7Days()
    set({ currentLog: updated, weekLogs })
  },

  updateDayLabel: async (label) => {
    const { currentLog } = get()
    if (!currentLog) return
    const updated = { ...currentLog, dayLabel: label }
    await saveLog(updated)
    set({ currentLog: updated })
  },

  toggleHabit: async (habitKey) => {
    const { currentLog } = get()
    if (!currentLog) return
    const updated = {
      ...currentLog,
      habits: {
        ...currentLog.habits,
        [habitKey]: {
          ...currentLog.habits[habitKey],
          done: !currentLog.habits[habitKey].done,
        },
      },
    }
    await saveLog(updated)
    const weekLogs = await getLast7Days()
    set({ currentLog: updated, weekLogs })
  },
}))

