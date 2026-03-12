import { useTrackerStore } from '../store/useTrackerStore'
import { useConfigStore } from '../store/useConfigStore'

const DAY_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
const STAT_COLORS = ['var(--accent)', 'var(--green)', 'var(--yellow)', 'var(--red)']

export default function WeeklySummary() {
  const weekLogs = useTrackerStore(s => s.weekLogs)
  const currentDate = useTrackerStore(s => s.currentDate)
  const sections = useConfigStore(s => s.sections)

  const totalDone = weekLogs.reduce((a, { log }) => a + (log?.completedCount ?? 0), 0)
  const totalPoss = weekLogs.reduce((a, { log }) => a + (log?.totalCount ?? 0), 0)
  const pct = totalPoss ? Math.round((totalDone / totalPoss) * 100) : 0

  // Build dynamic stats per section
  const sectionStats = sections.map(section => {
    const count = weekLogs.filter(({ log }) => {
      if (!log) return false
      const sectionHabits = Object.values(log.habits).filter(h => h.category === section.id)
      return sectionHabits.length > 0 && sectionHabits.every(h => h.done)
    }).length
    return { label: section.label, val: `${count}` }
  })

  const statCards = [
    { val: `${pct}%`, label: 'Semana', color: STAT_COLORS[0] },
    ...sectionStats.slice(0, 3).map((s, i) => ({
      val: s.val,
      label: s.label,
      color: STAT_COLORS[(i + 1) % STAT_COLORS.length],
    })),
  ]

  const maxPct = Math.max(...weekLogs.map(({ log }) =>
    log?.totalCount ? Math.round((log.completedCount / log.totalCount) * 100) : 0
  ), 1)

  return (
    <div>
      {/* Vertical bar chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 12, height: 40 }}>
        {weekLogs.map(({ date, log }, i) => {
          const d = new Date(date + 'T12:00:00')
          const dayIdx = d.getDay()
          const pctDay = log?.totalCount ? Math.round((log.completedCount / log.totalCount) * 100) : 0
          const isToday = date === currentDate
          const barH = pctDay > 0 ? Math.max(4, Math.round((pctDay / 100) * 28)) : 4

          return (
            <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
              <div
                style={{
                  width: '4px',
                  height: `${barH}px`,
                  borderRadius: '2px',
                  background: pctDay > 0 ? 'var(--accent)' : 'var(--border)',
                  opacity: pctDay > 0 ? Math.max(0.25, pctDay / 100) : 0.3,
                  transition: 'height 0.3s ease, opacity 0.3s ease',
                }}
              />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: isToday ? 'var(--accent)' : pctDay > 0 ? 'var(--text-2)' : 'var(--muted)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {DAY_LABELS[dayIdx]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Stats row */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(statCards.length, 4)}, 1fr)` }}>
        {statCards.map(({ val, label, color }) => (
          <div
            key={label}
            style={{ background: 'var(--surface-2)', borderRadius: '10px', padding: '10px 8px', textAlign: 'center' }}
          >
            <div style={{ fontSize: '18px', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
              {val}
            </div>
            <div style={{ fontSize: '11px', marginTop: 3, color: 'var(--text-2)' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
