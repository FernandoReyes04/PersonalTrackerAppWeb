import { useTrackerStore } from '../store/useTrackerStore'
import { useConfigStore } from '../store/useConfigStore'

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function offsetDate(dateStr, offset) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}

export default function DateNav() {
  const { currentDate, setDate } = useTrackerStore()
  const sections = useConfigStore(s => s.sections)

  const today = new Date().toISOString().split('T')[0]
  const isToday = currentDate === today

  const d = new Date(currentDate + 'T12:00:00')
  const dayName = DAYS[d.getDay()]
  const dateLabel = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`

  const goBack = () => setDate(offsetDate(currentDate, -1), sections)
  const goForward = () => {
    if (!isToday) setDate(offsetDate(currentDate, 1), sections)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
      <button
        onClick={goBack}
        style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer', transition: 'opacity 0.2s' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="var(--text-2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text)', lineHeight: 1.3 }}>{dayName}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>
          {dateLabel}
        </div>
      </div>

      <button
        onClick={goForward}
        disabled={isToday}
        style={{
          width: 36, height: 36, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: '1px solid var(--border)',
          opacity: isToday ? 0.25 : 1,
          cursor: isToday ? 'not-allowed' : 'pointer',
          transition: 'opacity 0.2s',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4L10 8L6 12" stroke="var(--text-2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
