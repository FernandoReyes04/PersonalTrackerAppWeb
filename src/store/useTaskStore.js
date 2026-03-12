import { create } from 'zustand'
import { db } from '../db/db'

// status: 'pending' | 'in_progress' | 'done'
const STATUS_CYCLE = { pending: 'in_progress', in_progress: 'done', done: 'pending' }

function nowISO() {
  return new Date().toISOString()
}

export const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: true,

  loadTasks: async () => {
    const tasks = await db.tasks.orderBy('createdAt').reverse().toArray()
    set({ tasks, loading: false })
  },

  addTask: async (title) => {
    if (!title.trim()) return
    const task = {
      id: `task_${Date.now()}`,
      title: title.trim(),
      status: 'pending',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    }
    await db.tasks.put(task)
    set(s => ({ tasks: [task, ...s.tasks] }))
  },

  cycleStatus: async (id) => {
    const { tasks } = get()
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const updated = { ...task, status: STATUS_CYCLE[task.status], updatedAt: nowISO() }
    await db.tasks.put(updated)
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? updated : t) }))
  },

  setStatus: async (id, status) => {
    const { tasks } = get()
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const updated = { ...task, status, updatedAt: nowISO() }
    await db.tasks.put(updated)
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? updated : t) }))
  },

  updateTitle: async (id, title) => {
    if (!title.trim()) return
    const { tasks } = get()
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const updated = { ...task, title: title.trim(), updatedAt: nowISO() }
    await db.tasks.put(updated)
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? updated : t) }))
  },

  deleteTask: async (id) => {
    await db.tasks.delete(id)
    set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }))
  },
}))
