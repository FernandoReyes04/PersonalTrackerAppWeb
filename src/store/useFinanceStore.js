import { create } from 'zustand'

const STORAGE_KEY = 'fer-finance'

let counter = Date.now()
const uid = (prefix) => `${prefix}_${++counter}`

const DEFAULT_CATEGORIES = [
  { id: 'cat_food',      label: 'Comida',      emoji: '🍔' },
  { id: 'cat_transport', label: 'Transporte',   emoji: '🚗' },
  { id: 'cat_school',    label: 'Escuela',      emoji: '📚' },
  { id: 'cat_leisure',   label: 'Ocio',         emoji: '🎮' },
  { id: 'cat_health',    label: 'Salud',        emoji: '💊' },
  { id: 'cat_clothes',   label: 'Ropa',         emoji: '👗' },
  { id: 'cat_home',      label: 'Casa',         emoji: '🏠' },
  { id: 'cat_other',     label: 'Otro',         emoji: '📦' },
]

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function persist(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    accounts:   state.accounts,
    expenses:   state.expenses,
    categories: state.categories,
    goals:      state.goals,
    debts:      state.debts,
    incomes:    state.incomes,
  }))
}

const stored = load()
const initial = stored ?? {
  accounts:   [],
  expenses:   [],
  categories: DEFAULT_CATEGORIES,
  goals:      [],
  debts:      [],
  incomes:    [],
}

export const useFinanceStore = create((set, get) => ({
  ...initial,

  // ── ACCOUNTS ─────────────────────────────────────────────────────────────────

  addAccount: (data) => {
    const id = uid('account')
    set(state => {
      const accounts = [...state.accounts, { id, ...data }]
      persist({ ...state, accounts })
      return { accounts }
    })
    return id
  },

  updateAccount: (id, changes) => {
    set(state => {
      const accounts = state.accounts.map(a => a.id === id ? { ...a, ...changes } : a)
      persist({ ...state, accounts })
      return { accounts }
    })
  },

  deleteAccount: (id) => {
    set(state => {
      const accounts = state.accounts.filter(a => a.id !== id)
      persist({ ...state, accounts })
      return { accounts }
    })
  },

  // ── EXPENSES ─────────────────────────────────────────────────────────────────

  addExpense: (data) => {
    const id = uid('expense')
    set(state => {
      const expense = { id, ...data, date: data.date || new Date().toISOString() }
      const expenses = [...state.expenses, expense]
      // Deduct from account balance
      const accounts = state.accounts.map(a =>
        a.id === data.accountId ? { ...a, balance: a.balance - data.amount } : a
      )
      persist({ ...state, expenses, accounts })
      return { expenses, accounts }
    })
  },

  deleteExpense: (id) => {
    set(state => {
      const expense = state.expenses.find(e => e.id === id)
      const expenses = state.expenses.filter(e => e.id !== id)
      // Refund account balance
      const accounts = expense
        ? state.accounts.map(a =>
            a.id === expense.accountId ? { ...a, balance: a.balance + expense.amount } : a
          )
        : state.accounts
      persist({ ...state, expenses, accounts })
      return { expenses, accounts }
    })
  },

  // ── CATEGORIES ───────────────────────────────────────────────────────────────

  addCategory: (label, emoji) => {
    const id = uid('cat')
    set(state => {
      const categories = [...state.categories, { id, label, emoji }]
      persist({ ...state, categories })
      return { categories }
    })
  },

  deleteCategory: (id) => {
    set(state => {
      const categories = state.categories.filter(c => c.id !== id)
      persist({ ...state, categories })
      return { categories }
    })
  },

  // ── INCOMES ──────────────────────────────────────────────────────────────────

  addIncome: (data) => {
    const id = uid('income')
    set(state => {
      const incomes = [...state.incomes, { id, ...data, date: data.date || new Date().toISOString() }]
      persist({ ...state, incomes })
      return { incomes }
    })
  },

  deleteIncome: (id) => {
    set(state => {
      const incomes = state.incomes.filter(i => i.id !== id)
      persist({ ...state, incomes })
      return { incomes }
    })
  },

  // ── GOALS ────────────────────────────────────────────────────────────────────

  addGoal: (data) => {
    const id = uid('goal')
    set(state => {
      const goals = [...state.goals, { id, savedAmount: 0, ...data }]
      persist({ ...state, goals })
      return { goals }
    })
  },

  addToGoal: (goalId, amount) => {
    set(state => {
      const goals = state.goals.map(g =>
        g.id === goalId ? { ...g, savedAmount: g.savedAmount + amount } : g
      )
      persist({ ...state, goals })
      return { goals }
    })
  },

  deleteGoal: (id) => {
    set(state => {
      const goals = state.goals.filter(g => g.id !== id)
      persist({ ...state, goals })
      return { goals }
    })
  },

  // ── DEBTS ────────────────────────────────────────────────────────────────────

  addDebt: (data) => {
    const id = uid('debt')
    set(state => {
      const debts = [...state.debts, { id, ...data, createdAt: new Date().toISOString() }]
      persist({ ...state, debts })
      return { debts }
    })
  },

  updateDebt: (id, changes) => {
    set(state => {
      const debts = state.debts.map(d => d.id === id ? { ...d, ...changes } : d)
      persist({ ...state, debts })
      return { debts }
    })
  },

  deleteDebt: (id) => {
    set(state => {
      const debts = state.debts.filter(d => d.id !== id)
      persist({ ...state, debts })
      return { debts }
    })
  },

  // ── COMPUTED ─────────────────────────────────────────────────────────────────

  getTotalBalance: () => get().accounts.reduce((sum, a) => sum + a.balance, 0),

  getMonthlyExpenses: (year, month) =>
    get().expenses.filter(e => {
      const d = new Date(e.date)
      return d.getFullYear() === year && d.getMonth() === month
    }),

  getMonthlyIncomes: (year, month) =>
    get().incomes.filter(i => {
      const d = new Date(i.date)
      return d.getFullYear() === year && d.getMonth() === month
    }),
}))
