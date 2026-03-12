import { useState } from 'react'
import { useFinanceStore } from '../store/useFinanceStore'

// ── Constants ─────────────────────────────────────────────────────────────────

const ACCOUNT_COLORS = ['#7c6af7', '#22d3a0', '#f25c7a', '#f5c542', '#3b82f6', '#f97316']
const GOAL_COLORS    = ['#7c6af7', '#22d3a0', '#f25c7a', '#f5c542', '#3b82f6', '#f97316']
const GOAL_EMOJIS    = ['🎯','🏠','✈️','🚗','💻','📱','💍','🎓','🏋️','🎵']

const ACCOUNT_TYPES = ['debit', 'credit', 'cash', 'transfer']
const ACCOUNT_TYPE_LABEL = { debit: 'Débito', credit: 'Crédito', cash: 'Efectivo', transfer: 'Transferencia' }
const DEBT_TYPES = [
  { id: 'credit_card', label: '💳 Tarjeta' },
  { id: 'i_owe',       label: '📤 Les debo' },
  { id: 'they_owe',    label: '📥 Me deben' },
]
const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

// ── Shared styles ─────────────────────────────────────────────────────────────

const labelStyle = {
  display: 'block', fontSize: '0.65rem', fontWeight: 700,
  letterSpacing: '0.1em', textTransform: 'uppercase',
  color: 'var(--text-2)', fontFamily: 'Inter, sans-serif', marginBottom: 10,
}

const inputStyle = {
  background: 'var(--bg)', border: '1px solid var(--border)',
  color: 'var(--text)', fontFamily: 'Inter, sans-serif',
  fontSize: '0.85rem', padding: '0.5rem 0.75rem',
  borderRadius: '0.75rem', outline: 'none', width: '100%', boxSizing: 'border-box',
}

const divider = { height: 1, background: 'var(--border)', marginBottom: 20 }

// ── BottomSheet ───────────────────────────────────────────────────────────────

function BottomSheet({ onClose, title, children }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)', zIndex: 40 }}
      />
      <div
        className="fade-up"
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, marginLeft: 'auto', marginRight: 'auto', width: '100%', maxWidth: '28rem', background: 'var(--surface)', borderRadius: '20px 20px 0 0', borderTop: '1px solid var(--border)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', padding: '12px 16px 36px', zIndex: 50, maxHeight: '88vh', overflowY: 'auto' }}
      >
        <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'Inter, sans-serif', color: 'var(--text)' }}>{title}</span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.9rem', padding: 0 }}>✕</button>
        </div>
        {children}
      </div>
    </>
  )
}

// ── AddAccountSheet ───────────────────────────────────────────────────────────

function AddAccountSheet({ onClose }) {
  const { addAccount } = useFinanceStore()
  const [name, setName]       = useState('')
  const [type, setType]       = useState('debit')
  const [balance, setBalance] = useState('')
  const [color, setColor]     = useState(ACCOUNT_COLORS[0])

  const canSubmit = name.trim()
  const handle = () => {
    if (!canSubmit) return
    addAccount({ name: name.trim(), type, balance: parseFloat(balance) || 0, color })
    onClose()
  }

  return (
    <BottomSheet onClose={onClose} title="Nueva cuenta">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input type="text" placeholder="Nombre de la cuenta…" value={name} onChange={e => setName(e.target.value)} style={inputStyle} autoFocus onKeyDown={e => e.key === 'Enter' && handle()} />

        <div>
          <span style={labelStyle}>Tipo</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ACCOUNT_TYPES.map(t => (
              <button key={t} onClick={() => setType(t)} style={{ padding: '5px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', background: type === t ? 'var(--accent)' : 'transparent', color: type === t ? '#fff' : 'var(--muted)', border: `1px solid ${type === t ? 'var(--accent)' : 'var(--border)'}`, fontFamily: 'Inter, sans-serif' }}>
                {ACCOUNT_TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        <input type="number" inputMode="decimal" placeholder="Saldo inicial (MXN)" value={balance} onChange={e => setBalance(e.target.value)} style={inputStyle} />

        <div>
          <span style={labelStyle}>Color</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {ACCOUNT_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: `3px solid ${color === c ? 'var(--text)' : 'transparent'}`, cursor: 'pointer', padding: 0, flexShrink: 0 }} />
            ))}
          </div>
        </div>

        <button onClick={handle} disabled={!canSubmit} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.75rem', background: canSubmit ? 'var(--accent)' : 'var(--border)', color: canSubmit ? '#fff' : 'var(--muted)', border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700, marginTop: 4, minHeight: 48 }}>
          Crear cuenta
        </button>
      </div>
    </BottomSheet>
  )
}

// ── AddIncomeSheet ────────────────────────────────────────────────────────────

function AddIncomeSheet({ onClose }) {
  const { addIncome } = useFinanceStore()
  const [amount, setAmount] = useState('')
  const [label, setLabel]   = useState('')
  const [date, setDate]     = useState(new Date().toISOString().split('T')[0])

  const canSubmit = !!amount
  const handle = () => {
    if (!canSubmit) return
    addIncome({ amount: parseFloat(amount), label: label.trim() || 'Ingreso', date: new Date(date + 'T12:00:00').toISOString() })
    onClose()
  }

  return (
    <BottomSheet onClose={onClose} title="Nuevo ingreso">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input type="number" inputMode="decimal" placeholder="Monto (MXN)" value={amount} onChange={e => setAmount(e.target.value)} style={inputStyle} autoFocus />
        <input type="text" placeholder="Etiqueta (ej. Quincena)" value={label} onChange={e => setLabel(e.target.value)} style={inputStyle} />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
        <button onClick={handle} disabled={!canSubmit} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.75rem', background: canSubmit ? 'var(--accent)' : 'var(--border)', color: canSubmit ? '#fff' : 'var(--muted)', border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700, marginTop: 4, minHeight: 48 }}>
          Registrar ingreso
        </button>
      </div>
    </BottomSheet>
  )
}

// ── AddGoalSheet ──────────────────────────────────────────────────────────────

function AddGoalSheet({ onClose }) {
  const { addGoal } = useFinanceStore()
  const [label, setLabel]   = useState('')
  const [emoji, setEmoji]   = useState('🎯')
  const [target, setTarget] = useState('')
  const [color, setColor]   = useState(GOAL_COLORS[0])

  const canSubmit = label.trim() && target
  const handle = () => {
    if (!canSubmit) return
    addGoal({ label: label.trim(), emoji, targetAmount: parseFloat(target), color })
    onClose()
  }

  return (
    <BottomSheet onClose={onClose} title="Nueva meta">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {GOAL_EMOJIS.map(em => (
            <button key={em} onClick={() => setEmoji(em)} style={{ width: 36, height: 36, borderRadius: 10, cursor: 'pointer', background: em === emoji ? 'color-mix(in srgb, var(--accent) 20%, transparent)' : 'transparent', border: `1px solid ${em === emoji ? 'var(--accent)' : 'var(--border)'}`, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {em}
            </button>
          ))}
        </div>
        <input type="text" placeholder="Nombre de la meta…" value={label} onChange={e => setLabel(e.target.value)} style={inputStyle} autoFocus />
        <input type="number" inputMode="decimal" placeholder="Monto objetivo (MXN)" value={target} onChange={e => setTarget(e.target.value)} style={inputStyle} />
        <div>
          <span style={labelStyle}>Color</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {GOAL_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: `3px solid ${color === c ? 'var(--text)' : 'transparent'}`, cursor: 'pointer', padding: 0, flexShrink: 0 }} />
            ))}
          </div>
        </div>
        <button onClick={handle} disabled={!canSubmit} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.75rem', background: canSubmit ? 'var(--accent)' : 'var(--border)', color: canSubmit ? '#fff' : 'var(--muted)', border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700, marginTop: 4, minHeight: 48 }}>
          Crear meta
        </button>
      </div>
    </BottomSheet>
  )
}

// ── AddDebtSheet ──────────────────────────────────────────────────────────────

function AddDebtSheet({ onClose }) {
  const { addDebt } = useFinanceStore()
  const [type, setType]     = useState('i_owe')
  const [label, setLabel]   = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote]     = useState('')

  const canSubmit = label.trim() && amount
  const handle = () => {
    if (!canSubmit) return
    addDebt({ type, label: label.trim(), amount: parseFloat(amount), note: note.trim() })
    onClose()
  }

  return (
    <BottomSheet onClose={onClose} title="Nueva deuda">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {DEBT_TYPES.map(t => (
            <button key={t.id} onClick={() => setType(t.id)} style={{ flex: 1, padding: '6px 4px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', background: type === t.id ? 'var(--accent)' : 'transparent', color: type === t.id ? '#fff' : 'var(--muted)', border: `1px solid ${type === t.id ? 'var(--accent)' : 'var(--border)'}`, fontFamily: 'Inter, sans-serif', textAlign: 'center', minHeight: 36 }}>
              {t.label}
            </button>
          ))}
        </div>
        <input type="text" placeholder="¿A quién / qué?" value={label} onChange={e => setLabel(e.target.value)} style={inputStyle} autoFocus />
        <input type="number" inputMode="decimal" placeholder="Monto (MXN)" value={amount} onChange={e => setAmount(e.target.value)} style={inputStyle} />
        <input type="text" placeholder="Nota (opcional)" value={note} onChange={e => setNote(e.target.value)} style={inputStyle} />
        <button onClick={handle} disabled={!canSubmit} style={{ width: '100%', padding: '0.65rem', borderRadius: '0.75rem', background: canSubmit ? 'var(--accent)' : 'var(--border)', color: canSubmit ? '#fff' : 'var(--muted)', border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700, marginTop: 4, minHeight: 48 }}>
          Agregar deuda
        </button>
      </div>
    </BottomSheet>
  )
}

// ── AccountCard ───────────────────────────────────────────────────────────────

function AccountCard({ account }) {
  const { updateAccount } = useFinanceStore()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState('')

  const startEdit = () => { setDraft(String(account.balance)); setEditing(true) }
  const commit = () => {
    setEditing(false)
    const val = parseFloat(draft)
    if (!isNaN(val)) updateAccount(account.id, { balance: val })
  }

  return (
    <div style={{ flexShrink: 0, width: 160, background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', borderLeft: `4px solid ${account.color}`, padding: '12px 14px' }}>
      <div style={{ fontSize: '0.6rem', fontFamily: 'Inter, sans-serif', color: 'var(--text-2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {ACCOUNT_TYPE_LABEL[account.type]}
      </div>
      <div style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', color: 'var(--text)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {account.name}
      </div>
      {editing ? (
        <input
          type="number" inputMode="decimal" autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit() }}
          style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--accent)', outline: 'none', color: 'var(--text)', fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums', fontSize: '1rem', fontWeight: 700, width: '100%', padding: '1px 0' }}
        />
      ) : (
        <div
          onClick={startEdit}
          style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums', color: account.balance < 0 ? 'var(--red)' : 'var(--text)', cursor: 'text', borderBottom: '1px dashed var(--border)', paddingBottom: 1 }}
        >
          ${fmt(account.balance)}
        </div>
      )}
    </div>
  )
}

// ── GoalCard ──────────────────────────────────────────────────────────────────

function GoalCard({ goal }) {
  const { addToGoal, deleteGoal } = useFinanceStore()
  const [adding, setAdding] = useState(false)
  const [draft, setDraft]   = useState('')

  const pct       = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100)) : 0
  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount)

  const handleAdd = () => {
    const val = parseFloat(draft)
    if (!isNaN(val) && val > 0) addToGoal(goal.id, val)
    setDraft('')
    setAdding(false)
  }

  return (
    <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', borderTop: `3px solid ${goal.color}`, padding: 12, position: 'relative' }}>
      <button onClick={() => deleteGoal(goal.id)} style={{ position: 'absolute', top: 6, right: 8, background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.9rem', padding: 4, opacity: 0.5, lineHeight: 1 }}>×</button>
      <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{goal.emoji}</div>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', color: 'var(--text)', marginBottom: 8, paddingRight: 16 }}>{goal.label}</div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginBottom: 6, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: goal.color, borderRadius: 2, transition: 'width 0.4s ease' }} />
      </div>

      <div style={{ fontSize: '0.6rem', fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums', color: 'var(--text-2)', marginBottom: 8 }}>
        ${fmt(goal.savedAmount)} / ${fmt(goal.targetAmount)}
        {pct === 100
          ? <span style={{ color: 'var(--green)', display: 'block', marginTop: 2 }}>¡Meta alcanzada! 🎉</span>
          : <span style={{ display: 'block', marginTop: 2 }}>faltan ${fmt(remaining)}</span>
        }
      </div>

      {adding ? (
        <div style={{ display: 'flex', gap: 4 }}>
          <input
            type="number" inputMode="decimal" autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
            placeholder="Cuánto…"
            style={{ ...inputStyle, fontSize: '0.75rem', padding: '4px 8px', flex: 1 }}
          />
          <button onClick={handleAdd} style={{ padding: '4px 10px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, minHeight: 32 }}>OK</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ width: '100%', padding: '5px', borderRadius: 8, background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'Inter, sans-serif', fontWeight: 600, minHeight: 32 }}>
          + Apartar
        </button>
      )}
    </div>
  )
}

// ── DebtItem ──────────────────────────────────────────────────────────────────

function DebtItem({ debt }) {
  const { deleteDebt, updateDebt } = useFinanceStore()
  const [confirm, setConfirm] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState('')

  const debtColor = debt.type === 'credit_card' ? 'var(--red)' : debt.type === 'i_owe' ? 'var(--yellow)' : 'var(--green)'

  const startEdit = () => { setDraft(String(debt.amount)); setEditing(true) }
  const commitEdit = () => {
    setEditing(false)
    const val = parseFloat(draft)
    if (!isNaN(val) && val > 0) updateDebt(debt.id, { amount: val })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', minHeight: 48, gap: 8 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{debt.label}</div>
        {debt.note && <div style={{ fontSize: '0.6rem', fontFamily: 'Inter, sans-serif', color: 'var(--text-2)', marginTop: 2 }}>{debt.note}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {editing ? (
          <input
            type="number" inputMode="decimal" autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => { if (e.key === 'Enter') commitEdit() }}
            style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--accent)', outline: 'none', color: debtColor, fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums', fontSize: '0.9rem', fontWeight: 700, width: 80, padding: '1px 0', textAlign: 'right' }}
          />
        ) : (
          <span onClick={startEdit} style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums', color: debtColor, cursor: 'text', borderBottom: '1px dashed var(--border)', paddingBottom: 1 }}>
            ${fmt(debt.amount)}
          </span>
        )}
        {confirm ? (
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => deleteDebt(debt.id)} style={{ padding: '4px 8px', borderRadius: 6, background: 'var(--green)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, minHeight: 30, fontFamily: 'Inter, sans-serif' }}>✓ Saldar</button>
            <button onClick={() => setConfirm(false)} style={{ padding: '4px 8px', borderRadius: 6, background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.65rem', minHeight: 30 }}>No</button>
          </div>
        ) : (
          <button onClick={() => setConfirm(true)} style={{ padding: '4px 10px', borderRadius: 6, background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.65rem', fontFamily: 'Inter, sans-serif', fontWeight: 600, minHeight: 30 }}>Saldar</button>
        )}
      </div>
    </div>
  )
}

// ── DebtGroup ─────────────────────────────────────────────────────────────────

function DebtGroup({ label, color, items }) {
  const total = items.reduce((s, d) => s + d.amount, 0)
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', color }}>{label}</span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums', fontSize: '0.75rem', color, fontWeight: 700 }}>${fmt(total)}</span>
      </div>
      {items.length === 0 && (
        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'Inter, sans-serif', padding: '4px 0' }}>—</div>
      )}
      {items.map(d => <DebtItem key={d.id} debt={d} />)}
    </div>
  )
}

// ── FinanceView ───────────────────────────────────────────────────────────────

export default function FinanceView() {
  const {
    accounts, expenses, categories, goals, debts, incomes,
    addExpense, deleteExpense, deleteIncome, getTotalBalance,
  } = useFinanceStore()

  const now = new Date()
  const [viewYear, setViewYear]   = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  const [showAddAccount, setShowAddAccount] = useState(false)
  const [showAddIncome,  setShowAddIncome]  = useState(false)
  const [showAddGoal,    setShowAddGoal]    = useState(false)
  const [showAddDebt,    setShowAddDebt]    = useState(false)

  // Quick expense form
  const [expAmount,   setExpAmount]   = useState('')
  const [expCategory, setExpCategory] = useState(categories[0]?.id ?? '')
  const [expAccount,  setExpAccount]  = useState(accounts[0]?.id ?? '')
  const [expNote,     setExpNote]     = useState('')

  // Derived
  const totalBalance = getTotalBalance()

  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.date)
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth
  })
  const monthIncomes = incomes.filter(i => {
    const d = new Date(i.date)
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth
  })

  const totalMonthExpenses = monthExpenses.reduce((s, e) => s + e.amount, 0)
  const totalMonthIncomes  = monthIncomes.reduce((s, i) => s + i.amount, 0)
  const progressPct = totalMonthIncomes > 0
    ? Math.min(100, Math.round((totalMonthExpenses / totalMonthIncomes) * 100))
    : 0

  // Month nav
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  // Register expense
  const effectiveAccount  = expAccount  && accounts.find(a => a.id === expAccount)  ? expAccount  : accounts[0]?.id  ?? ''
  const effectiveCategory = expCategory && categories.find(c => c.id === expCategory) ? expCategory : categories[0]?.id ?? ''

  const handleAddExpense = () => {
    if (!expAmount || !effectiveAccount) return
    addExpense({ amount: parseFloat(expAmount), categoryId: effectiveCategory, accountId: effectiveAccount, note: expNote.trim(), date: new Date().toISOString() })
    setExpAmount('')
    setExpNote('')
  }

  // Group expenses by day (desc)
  const expensesByDay = {}
  ;[...monthExpenses].sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(e => {
    const day = e.date.split('T')[0]
    if (!expensesByDay[day]) expensesByDay[day] = []
    expensesByDay[day].push(e)
  })

  // Debts by group
  const creditCardDebts = debts.filter(d => d.type === 'credit_card')
  const iOweDebts       = debts.filter(d => d.type === 'i_owe')
  const theyOweDebts    = debts.filter(d => d.type === 'they_owe')

  return (
    <div className="fade-up" style={{ animationDelay: '80ms' }}>

      {/* ── S1: BALANCE TOTAL ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: '0.6rem', fontFamily: 'Inter, sans-serif', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Total ahorrado</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums', color: totalBalance < 0 ? 'var(--red)' : 'var(--text)', lineHeight: 1.1 }}>
            ${fmt(totalBalance)}
          </div>
          <div style={{ fontSize: '0.6rem', fontFamily: 'Inter, sans-serif', color: 'var(--text-2)', marginTop: 4 }}>MXN</div>
        </div>

        {/* Account cards */}
        <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', gap: 8, paddingBottom: 4 }}>
          {accounts.map(acc => <AccountCard key={acc.id} account={acc} />)}
          <button
            onClick={() => setShowAddAccount(true)}
            style={{ flexShrink: 0, width: 90, minHeight: 90, background: 'transparent', border: '1.5px dashed var(--border)', borderRadius: 14, color: 'var(--muted)', cursor: 'pointer', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >+</button>
        </div>
      </div>

      <div style={divider} />

      {/* ── S2: REGISTRO RÁPIDO ────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <span style={labelStyle}>Registrar gasto</span>

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            type="number" inputMode="decimal"
            placeholder="Monto"
            value={expAmount}
            onChange={e => setExpAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddExpense()}
            style={{ ...inputStyle, flex: '0 0 100px' }}
          />
          <input
            type="text"
            placeholder="Nota (opcional)"
            value={expNote}
            onChange={e => setExpNote(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4, marginBottom: 8 }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setExpCategory(cat.id)}
              style={{ flexShrink: 0, padding: '4px 10px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', background: effectiveCategory === cat.id ? 'var(--accent)' : 'transparent', color: effectiveCategory === cat.id ? '#fff' : 'var(--muted)', border: `1px solid ${effectiveCategory === cat.id ? 'var(--accent)' : 'var(--border)'}`, fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', minHeight: 30 }}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Account chips */}
        {accounts.length > 0 && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4, marginBottom: 8 }}>
            {accounts.map(acc => (
              <button
                key={acc.id}
                onClick={() => setExpAccount(acc.id)}
                style={{ flexShrink: 0, padding: '4px 10px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', background: effectiveAccount === acc.id ? acc.color : 'transparent', color: effectiveAccount === acc.id ? '#fff' : 'var(--muted)', border: `1px solid ${effectiveAccount === acc.id ? acc.color : 'var(--border)'}`, fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', minHeight: 30 }}
              >
                {acc.name}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleAddExpense}
          disabled={!expAmount || !effectiveAccount}
          style={{ width: '100%', padding: '0.6rem', borderRadius: '0.75rem', background: expAmount && effectiveAccount ? 'var(--accent)' : 'var(--border)', color: expAmount && effectiveAccount ? '#fff' : 'var(--muted)', border: 'none', cursor: expAmount && effectiveAccount ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700, minHeight: 48 }}
        >
          Registrar
        </button>
      </div>

      <div style={divider} />

      {/* ── S3: GASTOS DEL MES ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--muted)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', color: 'var(--text)' }}>{MONTH_NAMES[viewMonth]} {viewYear}</div>
            <div style={{ fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums', color: 'var(--red)', fontWeight: 700, marginTop: 2 }}>−${fmt(totalMonthExpenses)}</div>
          </div>
          <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--muted)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
        </div>

        {/* Progress vs incomes */}
        {totalMonthIncomes > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontFamily: 'Inter, sans-serif', color: 'var(--text-2)', marginBottom: 4 }}>
              <span>gastado {progressPct}%</span>
              <span>ingresos ${fmt(totalMonthIncomes)}</span>
            </div>
            <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: progressPct > 90 ? 'var(--red)' : progressPct > 70 ? 'var(--yellow)' : 'var(--green)', borderRadius: 3, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        )}

        {/* Expense list */}
        {Object.keys(expensesByDay).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--muted)', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif' }}>Sin gastos este mes</div>
        ) : (
          Object.entries(expensesByDay).map(([day, dayExps]) => {
            const dayDate  = new Date(day + 'T12:00:00')
            const dayLabel = dayDate.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
            const dayTotal = dayExps.reduce((s, e) => s + e.amount, 0)
            return (
              <div key={day} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: '0.62rem', fontFamily: 'Inter, sans-serif', color: 'var(--text-2)', textTransform: 'capitalize' }}>{dayLabel}</span>
                  <span style={{ fontSize: '0.62rem', fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums', color: 'var(--text-2)' }}>−${fmt(dayTotal)}</span>
                </div>
                {dayExps.map(exp => {
                  const cat = categories.find(c => c.id === exp.categoryId)
                  const acc = accounts.find(a => a.id === exp.accountId)
                  return (
                    <div key={exp.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', minHeight: 48 }}>
                      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{cat?.emoji ?? '📦'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontFamily: 'Inter, sans-serif', color: 'var(--text)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.note || cat?.label || 'Gasto'}</div>
                        {acc && <div style={{ fontSize: '0.6rem', fontFamily: 'Inter, sans-serif', color: acc.color, marginTop: 1 }}>{acc.name}</div>}
                      </div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', flexShrink: 0 }}>−${fmt(exp.amount)}</span>
                      <button onClick={() => deleteExpense(exp.id)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1rem', padding: 4, opacity: 0.5, flexShrink: 0, minWidth: 30, minHeight: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                  )
                })}
              </div>
            )
          })
        )}
      </div>

      <div style={divider} />

      {/* ── S4: INGRESOS DEL MES ───────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={labelStyle}>Ingresos — {MONTH_NAMES[viewMonth]}</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: '0.9rem', color: 'var(--green)' }}>+${fmt(totalMonthIncomes)}</span>
        </div>

        {monthIncomes.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', marginBottom: 10 }}>Sin ingresos registrados</div>
        ) : (
          [...monthIncomes].sort((a, b) => new Date(b.date) - new Date(a.date)).map(inc => (
            <div key={inc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', minHeight: 48, gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', color: 'var(--text)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.label}</div>
                <div style={{ fontSize: '0.6rem', fontFamily: 'Inter, sans-serif', color: 'var(--text-2)', marginTop: 1 }}>
                  {new Date(inc.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: '0.9rem', color: 'var(--green)' }}>+${fmt(inc.amount)}</span>
                <button onClick={() => deleteIncome(inc.id)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1rem', padding: 4, opacity: 0.5, minWidth: 30, minHeight: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            </div>
          ))
        )}

        <button onClick={() => setShowAddIncome(true)} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.75rem', background: 'transparent', color: 'var(--muted)', border: '1px dashed var(--border)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 600, marginTop: 10, minHeight: 40 }}>
          + Ingreso
        </button>
      </div>

      <div style={divider} />

      {/* ── S5: METAS DE AHORRO ────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <span style={labelStyle}>Metas de ahorro</span>

        {goals.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', marginBottom: 10 }}>Sin metas todavía</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            {goals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
          </div>
        )}

        <button onClick={() => setShowAddGoal(true)} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.75rem', background: 'transparent', color: 'var(--muted)', border: '1px dashed var(--border)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 600, minHeight: 40 }}>
          + Meta
        </button>
      </div>

      <div style={divider} />

      {/* ── S6: DEUDAS ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 8 }}>
        <span style={labelStyle}>Deudas</span>
        <DebtGroup label="💳 Tarjetas de crédito" color="var(--red)"    items={creditCardDebts} />
        <DebtGroup label="📤 Les debo"             color="var(--yellow)" items={iOweDebts} />
        <DebtGroup label="📥 Me deben"             color="var(--green)"  items={theyOweDebts} />
        <button onClick={() => setShowAddDebt(true)} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.75rem', background: 'transparent', color: 'var(--muted)', border: '1px dashed var(--border)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 600, minHeight: 40 }}>
          + Deuda
        </button>
      </div>

      {/* ── Bottom sheets ──────────────────────────────────────────────────── */}
      {showAddAccount && <AddAccountSheet onClose={() => setShowAddAccount(false)} />}
      {showAddIncome  && <AddIncomeSheet  onClose={() => setShowAddIncome(false)}  />}
      {showAddGoal    && <AddGoalSheet    onClose={() => setShowAddGoal(false)}    />}
      {showAddDebt    && <AddDebtSheet    onClose={() => setShowAddDebt(false)}    />}
    </div>
  )
}
