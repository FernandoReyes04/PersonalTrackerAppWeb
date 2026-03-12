import { useState, useEffect } from 'react'
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, Legend,
} from 'recharts'
import { db } from '../db/db'
import { useTaskStore } from '../store/useTaskStore'
import { useFinanceStore } from '../store/useFinanceStore'

// ── Shared helpers ─────────────────────────────────────────────────────────────

function SectionHeader({ children }) {
  return (
    <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-2)', marginBottom: 14 }}>
      {children}
    </div>
  )
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: 'var(--surface-2)', borderRadius: 16, padding: '14px 16px', marginBottom: 12, ...style }}>
      {children}
    </div>
  )
}

function StatRow({ stats }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 8, marginTop: 12 }}>
      {stats.map(({ val, label, color = 'var(--accent)' }) => (
        <div key={label} style={{ textAlign: 'center', background: 'var(--surface)', borderRadius: 12, padding: '10px 6px' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>{val}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-2)', marginTop: 3, lineHeight: 1.3 }}>{label}</div>
        </div>
      ))}
    </div>
  )
}

// Custom tooltip style
const tooltipStyle = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 10, fontSize: 11, color: 'var(--text)',
  padding: '6px 10px',
}

// ── Date helpers ───────────────────────────────────────────────────────────────

function getLastNDays(n) {
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

function getWeekStart(date) {
  const d = new Date(date + 'T12:00:00')
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return d.toISOString().split('T')[0]
}

function getLastNWeeks(n) {
  const weeks = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i * 7)
    const ws = getWeekStart(d.toISOString().split('T')[0])
    if (!weeks.includes(ws)) weeks.push(ws)
  }
  return weeks
}

function shortDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return `${d.getDate()}/${d.getMonth() + 1}`
}

function shortWeek(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return `${d.getDate()}/${d.getMonth() + 1}`
}

// ── Heatmap ────────────────────────────────────────────────────────────────────

function HabitHeatmap({ logMap }) {
  const weeks = getLastNWeeks(8)
  const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

  const cells = weeks.map(weekStart => {
    const days = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(weekStart + 'T12:00:00')
      date.setDate(date.getDate() + d)
      const ds = date.toISOString().split('T')[0]
      const log = logMap[ds]
      const pct = log?.totalCount ? Math.round((log.completedCount / log.totalCount) * 100) : 0
      days.push({ date: ds, pct })
    }
    return { weekStart, days }
  })

  const getColor = (pct) => {
    if (pct === 0) return 'var(--border)'
    if (pct < 40) return 'rgba(99,102,241,0.25)'
    if (pct < 70) return 'rgba(99,102,241,0.55)'
    return 'rgba(99,102,241,0.9)'
  }

  return (
    <div>
      {/* Day labels */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 4, paddingLeft: 2 }}>
        {DAY_LABELS.map(l => (
          <div key={l} style={{ width: 10, fontSize: '8px', color: 'var(--muted)', textAlign: 'center' }}>{l}</div>
        ))}
      </div>
      {/* Grid: rows = weeks, cols = days */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {cells.map(({ weekStart, days }) => (
          <div key={weekStart} style={{ display: 'flex', gap: 3 }}>
            {days.map(({ date, pct }) => (
              <div
                key={date}
                title={`${date}: ${pct}%`}
                style={{
                  width: 10, height: 10, borderRadius: 2,
                  background: getColor(pct),
                  transition: 'background 0.2s',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Hábitos section ────────────────────────────────────────────────────────────

function HabitsSection({ logs }) {
  const logMap = {}
  logs.forEach(l => { logMap[l.date] = l })

  const last14 = getLastNDays(14).map(date => {
    const log = logMap[date]
    const pct = log?.totalCount ? Math.round((log.completedCount / log.totalCount) * 100) : 0
    return { date: shortDate(date), pct }
  })

  // Stats
  const activeDays = logs.filter(l => l.totalCount > 0 && l.completedCount > 0).length
  const totalPct = logs.reduce((s, l) => s + (l.totalCount ? Math.round((l.completedCount / l.totalCount) * 100) : 0), 0)
  const avgPct = logs.length > 0 ? Math.round(totalPct / logs.filter(l => l.totalCount > 0).length) || 0 : 0

  // Racha actual (consecutive days from today backwards with at least 1 done)
  let streak = 0
  const today = new Date().toISOString().split('T')[0]
  for (let i = 0; i < 60; i++) {
    const d = new Date(today + 'T12:00:00')
    d.setDate(d.getDate() - i)
    const ds = d.toISOString().split('T')[0]
    const log = logMap[ds]
    if (log && log.completedCount > 0) streak++
    else if (i > 0) break
  }

  // Most consistent habit
  const habitCounts = {}
  logs.forEach(l => {
    if (!l.habits) return
    Object.values(l.habits).forEach(h => {
      if (h.done) habitCounts[h.label] = (habitCounts[h.label] || 0) + 1
    })
  })
  const topHabit = Object.entries(habitCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
  const topHabitShort = topHabit.length > 10 ? topHabit.slice(0, 9) + '…' : topHabit

  return (
    <div>
      <SectionHeader>Hábitos</SectionHeader>

      <Card>
        <div style={{ fontSize: '11px', color: 'var(--text-2)', marginBottom: 8 }}>Últimas 8 semanas</div>
        <HabitHeatmap logMap={logMap} />
      </Card>

      <Card>
        <div style={{ fontSize: '11px', color: 'var(--text-2)', marginBottom: 10 }}>% completado — últimos 14 días</div>
        <ResponsiveContainer width="100%" height={90}>
          <BarChart data={last14} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-2)' }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--text-2)' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v}%`, 'Completado']} />
            <Bar dataKey="pct" fill="var(--accent)" radius={[3, 3, 0, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
        <StatRow stats={[
          { val: `${streak}d`, label: 'Racha', color: 'var(--accent)' },
          { val: `${avgPct}%`, label: 'Promedio', color: 'var(--green)' },
          { val: activeDays, label: 'Días activos', color: 'var(--yellow)' },
          { val: topHabitShort, label: 'Más consistente', color: 'var(--text-2)' },
        ]} />
      </Card>
    </div>
  )
}

// ── Gym section ────────────────────────────────────────────────────────────────

const GYM_COLORS = {
  push: 'var(--accent)',
  pull: 'var(--green)',
  legs: 'var(--yellow)',
  cardio: '#06b6d4',
}

function GymSection({ logs }) {
  const logMap = {}
  logs.forEach(l => { logMap[l.date] = l })

  const weeks = getLastNWeeks(8)
  const weekData = weeks.map(ws => {
    const entry = { week: shortWeek(ws), push: 0, pull: 0, legs: 0, cardio: 0 }
    for (let d = 0; d < 7; d++) {
      const date = new Date(ws + 'T12:00:00')
      date.setDate(date.getDate() + d)
      const ds = date.toISOString().split('T')[0]
      const log = logMap[ds]
      if (!log) continue
      const type = log.dayType
      if (type === 'push') entry.push++
      else if (type === 'pull') entry.pull++
      else if (type === 'legs') entry.legs++
      else if (type === 'cardio') entry.cardio++
    }
    return entry
  })

  // Stats
  const now = new Date()
  const thisMonth = logs.filter(l => {
    const d = new Date(l.date + 'T12:00:00')
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })
  const gymDays = thisMonth.filter(l => ['push','pull','legs','cardio','push_pull'].includes(l.dayType))
  const totalSessions = gymDays.length

  const typeCounts = {}
  logs.forEach(l => {
    const t = l.dayType
    if (['push','pull','legs','cardio'].includes(t)) typeCounts[t] = (typeCounts[t] || 0) + 1
  })
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  // Gym streak
  let gymStreak = 0
  const today = new Date().toISOString().split('T')[0]
  for (let i = 0; i < 60; i++) {
    const d = new Date(today + 'T12:00:00')
    d.setDate(d.getDate() - i)
    const ds = d.toISOString().split('T')[0]
    const log = logMap[ds]
    if (log && ['push','pull','legs','cardio','push_pull'].includes(log.dayType)) gymStreak++
    else if (i > 0) break
  }

  return (
    <div>
      <SectionHeader>Gym</SectionHeader>

      <Card>
        <div style={{ fontSize: '11px', color: 'var(--text-2)', marginBottom: 10 }}>Sesiones por semana — últimas 8</div>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={weekData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
            <XAxis dataKey="week" tick={{ fontSize: 9, fill: 'var(--text-2)' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: 'var(--text-2)' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="push" stackId="a" fill={GYM_COLORS.push} radius={[0, 0, 0, 0]} maxBarSize={20} />
            <Bar dataKey="pull" stackId="a" fill={GYM_COLORS.pull} maxBarSize={20} />
            <Bar dataKey="legs" stackId="a" fill={GYM_COLORS.legs} maxBarSize={20} />
            <Bar dataKey="cardio" stackId="a" fill={GYM_COLORS.cardio} radius={[3, 3, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
        <StatRow stats={[
          { val: totalSessions, label: 'Sesiones mes', color: 'var(--accent)' },
          { val: topType, label: 'Más frecuente', color: 'var(--green)' },
          { val: `${gymStreak}d`, label: 'Racha', color: 'var(--yellow)' },
        ]} />
      </Card>
    </div>
  )
}

// ── Finanzas section ───────────────────────────────────────────────────────────

const FINANCE_COLORS = ['var(--accent)', 'var(--green)', 'var(--yellow)', 'var(--red)', '#06b6d4', '#f97316', '#a78bfa', '#34d399']

function FinanceSection({ expenses, accounts, categories, incomes }) {
  const now = new Date()
  const thisMonthExp = expenses.filter(e => {
    const d = new Date(e.date)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })

  // Pie by category
  const catMap = {}
  thisMonthExp.forEach(e => {
    const cat = categories.find(c => c.id === e.categoryId)
    const label = cat?.name || 'Otros'
    catMap[label] = (catMap[label] || 0) + e.amount
  })
  const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  // Area chart: last 6 months net (incomes - expenses)
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ year: d.getFullYear(), month: d.getMonth(), label: `${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}` })
  }
  const areaData = months.map(({ year, month, label }) => {
    const monthExp = expenses.filter(e => {
      const d = new Date(e.date)
      return d.getFullYear() === year && d.getMonth() === month
    }).reduce((s, e) => s + e.amount, 0)
    const monthInc = incomes.filter(e => {
      const d = new Date(e.date)
      return d.getFullYear() === year && d.getMonth() === month
    }).reduce((s, e) => s + e.amount, 0)
    return { label, gastos: Math.round(monthExp * 100) / 100, ingresos: Math.round(monthInc * 100) / 100 }
  })

  const totalMonthExp = thisMonthExp.reduce((s, e) => s + e.amount, 0)
  const totalMonthInc = incomes.filter(e => {
    const d = new Date(e.date)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).reduce((s, e) => s + e.amount, 0)
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)

  const fmt = n => new Intl.NumberFormat('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

  if (expenses.length === 0 && accounts.length === 0) {
    return (
      <div>
        <SectionHeader>Finanzas</SectionHeader>
        <Card>
          <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-2)', fontSize: '13px' }}>
            Sin datos de finanzas todavía
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <SectionHeader>Finanzas</SectionHeader>

      {pieData.length > 0 && (
        <Card>
          <div style={{ fontSize: '11px', color: 'var(--text-2)', marginBottom: 10 }}>Gastos por categoría — este mes</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ResponsiveContainer width="50%" height={110}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={48} dataKey="value" paddingAngle={2}>
                  {pieData.map((_, i) => <Cell key={i} fill={FINANCE_COLORS[i % FINANCE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={v => [`$${fmt(v)}`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {pieData.slice(0, 5).map((item, i) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0, background: FINANCE_COLORS[i % FINANCE_COLORS.length] }} />
                  <span style={{ fontSize: '10px', color: 'var(--text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>${fmt(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div style={{ fontSize: '11px', color: 'var(--text-2)', marginBottom: 10 }}>Gastos vs Ingresos — 6 meses</div>
        <ResponsiveContainer width="100%" height={90}>
          <AreaChart data={areaData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--text-2)' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: 'var(--text-2)' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={v => [`$${fmt(v)}`, '']} />
            <Area type="monotone" dataKey="ingresos" stroke="var(--green)" fill="rgba(16,185,129,0.15)" strokeWidth={1.5} />
            <Area type="monotone" dataKey="gastos" stroke="var(--red)" fill="rgba(239,68,68,0.12)" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
        <StatRow stats={[
          { val: `$${fmt(totalBalance)}`, label: 'Saldo total', color: 'var(--accent)' },
          { val: `$${fmt(totalMonthInc)}`, label: 'Ingresos mes', color: 'var(--green)' },
          { val: `$${fmt(totalMonthExp)}`, label: 'Gastos mes', color: 'var(--red)' },
        ]} />
      </Card>
    </div>
  )
}

// ── Tareas section ─────────────────────────────────────────────────────────────

function TasksSection({ tasks }) {
  const weeks = getLastNWeeks(8)

  const weekData = weeks.map(ws => {
    let done = 0
    tasks.forEach(t => {
      if (t.status === 'done' && t.updatedAt) {
        const taskWeek = getWeekStart(t.updatedAt.split('T')[0])
        if (taskWeek === ws) done++
      }
    })
    return { week: shortWeek(ws), done }
  })

  const totalDone = tasks.filter(t => t.status === 'done').length
  const totalPending = tasks.filter(t => t.status === 'pending').length
  const totalInProgress = tasks.filter(t => t.status === 'in_progress').length

  return (
    <div>
      <SectionHeader>Tareas</SectionHeader>

      <Card>
        <div style={{ fontSize: '11px', color: 'var(--text-2)', marginBottom: 10 }}>Completadas por semana — últimas 8</div>
        <ResponsiveContainer width="100%" height={90}>
          <BarChart data={weekData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
            <XAxis dataKey="week" tick={{ fontSize: 9, fill: 'var(--text-2)' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: 'var(--text-2)' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={v => [v, 'Completadas']} />
            <Bar dataKey="done" fill="var(--green)" radius={[3, 3, 0, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
        <StatRow stats={[
          { val: totalDone, label: 'Completadas', color: 'var(--green)' },
          { val: totalInProgress, label: 'En proceso', color: 'var(--yellow)' },
          { val: totalPending, label: 'Pendientes', color: 'var(--text-2)' },
        ]} />
      </Card>
    </div>
  )
}

// ── Main MetricsView ───────────────────────────────────────────────────────────

export default function MetricsView() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const { tasks, loadTasks } = useTaskStore()
  const { expenses, accounts, categories, incomes } = useFinanceStore()

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const allLogs = await db.daily_logs.toArray()
        setLogs(allLogs)
      } catch {
        setLogs([])
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
    loadTasks()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 0' }}>
        <span style={{ color: 'var(--text-2)', fontSize: '13px' }}>cargando métricas...</span>
      </div>
    )
  }

  return (
    <div className="fade-up">
      <HabitsSection logs={logs} />
      <GymSection logs={logs} />
      <FinanceSection
        expenses={expenses}
        accounts={accounts}
        categories={categories}
        incomes={incomes}
      />
      <TasksSection tasks={tasks} />
    </div>
  )
}
