import { useRef } from 'react'
import { useTrackerStore } from '../store/useTrackerStore'

const REC_LABEL = {
  weekly: '↻ Semanal',
  monthly: '↻ Mensual',
  annual: '↻ Anual',
}

export default function HabitCard({ habitKey, habit, disabled, recurrence, onToggle, type, sets, reps, weight, unit }) {
  const toggle = useTrackerStore(s => s.toggleHabit)
  const ref = useRef(null)

  const handleToggle = () => {
    if (disabled) return
    navigator.vibrate?.(30)
    if (ref.current) {
      ref.current.classList.remove('check-pop')
      void ref.current.offsetWidth
      ref.current.classList.add('check-pop')
    }
    if (onToggle) {
      onToggle()
    } else {
      toggle(habitKey)
    }
  }

  // Build exercise meta string
  let exerciseMeta = null
  if (type === 'exercise') {
    const parts = []
    if (sets && reps) parts.push(`${sets} × ${reps}`)
    if (weight) parts.push(`${weight} ${unit || 'kg'}`)
    if (parts.length) exerciseMeta = parts.join(' — ')
  }

  const recLabel = REC_LABEL[recurrence]

  return (
    <button
      ref={ref}
      onClick={handleToggle}
      disabled={disabled}
      className="w-full flex items-center gap-3 text-left"
      style={{
        padding: '14px 16px',
        borderRadius: '12px',
        background: 'transparent',
        border: `1px solid ${habit.done ? 'var(--border)' : 'var(--border)'}`,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        minHeight: 52,
        transition: 'background 0.15s',
      }}
    >
      {/* Circle checkbox */}
      <div
        style={{
          flexShrink: 0,
          width: 22,
          height: 22,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: habit.done ? 'var(--accent)' : 'transparent',
          border: `2px solid ${habit.done ? 'var(--accent)' : 'var(--border)'}`,
          transition: 'all 0.2s',
        }}
      >
        {habit.done && (
          <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
            <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      {/* Label + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            fontSize: '15px',
            fontWeight: 500,
            color: habit.done ? 'var(--text-2)' : 'var(--text)',
            transition: 'color 0.15s',
          }}
        >
          {habit.label}
        </span>
        {(exerciseMeta || recLabel) && (
          <span style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            marginTop: 2,
            fontSize: '11px',
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--text-2)',
          }}>
            {exerciseMeta && <span>{exerciseMeta}</span>}
            {recLabel && <span>{recLabel}</span>}
          </span>
        )}
      </div>
    </button>
  )
}
