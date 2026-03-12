import { useState } from 'react'
import { useTrackerStore } from '../store/useTrackerStore'
import { useConfigStore } from '../store/useConfigStore'
import { useRecurrenceStore, computeRecurrenceDone } from '../store/useRecurrenceStore'
import HabitCard from './HabitCard'
import SectionManager from './SectionManager'

function ProgressRing({ pct, size = 52 }) {
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="var(--accent)" strokeWidth="3"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  )
}

// SVG gear icon
function GearIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 15 15" fill="none">
      <path d="M6.3 1.2a1.2 1.2 0 0 1 2.4 0l.1.6a4.8 4.8 0 0 1 1.3.8l.6-.2a1.2 1.2 0 0 1 1.5 1.7l-.3.5a4.8 4.8 0 0 1 0 1.7l.3.5a1.2 1.2 0 0 1-1.5 1.7l-.6-.2a4.8 4.8 0 0 1-1.3.8l-.1.6a1.2 1.2 0 0 1-2.4 0l-.1-.6a4.8 4.8 0 0 1-1.3-.8l-.6.2a1.2 1.2 0 0 1-1.5-1.7l.3-.5a4.8 4.8 0 0 1 0-1.7L2.8 4A1.2 1.2 0 0 1 4.3 2.3l.6.2A4.8 4.8 0 0 1 6.2 1.8l.1-.6z" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="7.5" cy="7.5" r="1.8" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  )
}

// Inline editable label
function EditableLabel({ value, onChange, placeholder }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value || '')

  const commit = () => {
    setEditing(false)
    if (draft.trim() !== (value || '')) onChange(draft.trim())
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value || ''); setEditing(false) } }}
        style={{
          background: 'transparent', border: 'none',
          borderBottom: '1px solid var(--accent)', outline: 'none',
          color: 'var(--text)', fontSize: '12px',
          padding: '1px 4px', minWidth: 80, maxWidth: 180,
        }}
      />
    )
  }

  return (
    <span
      onClick={() => { setDraft(value || ''); setEditing(true) }}
      style={{
        fontSize: '12px', color: value ? 'var(--text-2)' : 'var(--muted)',
        cursor: 'text', borderBottom: '1px dashed var(--border)', paddingBottom: 1,
      }}
    >
      {value || placeholder}
    </span>
  )
}

export default function DayView() {
  const { currentLog, currentDate, loading, updateDayLabel } = useTrackerStore()
  const sections = useConfigStore(s => s.sections)
  const { completions, markDone, markUndone } = useRecurrenceStore()
  const [showSettings, setShowSettings] = useState(false)

  if (loading || !currentLog) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  const { habits } = currentLog
  const dayLabel = currentLog.dayLabel || ''

  const today = new Date().toISOString().split('T')[0]
  const isToday = currentDate === today

  const configHabitMap = {}
  sections.forEach(s => s.habits.forEach(h => { configHabitMap[h.id] = h }))

  function getEffectiveDone(key, habit) {
    if (!isToday) return habit.done
    const configHabit = configHabitMap[key]
    if (!configHabit) return habit.done
    const rec = configHabit.recurrence
    if (rec === 'weekly' || rec === 'monthly' || rec === 'annual') {
      const override = computeRecurrenceDone(completions[key], rec)
      if (override !== null) return override
    }
    return habit.done
  }

  const done = Object.entries(habits).filter(([k, h]) => getEffectiveDone(k, h)).length
  const total = Object.values(habits).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const grouped = {}
  Object.entries(habits).forEach(([key, habit]) => {
    if (!grouped[habit.category]) grouped[habit.category] = []
    grouped[habit.category].push({ key, habit })
  })

  return (
    <div className="fade-up" style={{ animationDelay: '80ms' }}>
      {/* Day header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {isToday && (
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', display: 'inline-block' }}>
              HOY
            </span>
          )}
          <EditableLabel
            value={dayLabel}
            onChange={label => updateDayLabel(label)}
            placeholder="+ añadir etiqueta"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setShowSettings(s => !s)}
            style={{
              width: 30, height: 30, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: showSettings ? 'rgba(99,102,241,0.15)' : 'transparent',
              border: `1px solid ${showSettings ? 'var(--accent)' : 'var(--border)'}`,
              cursor: 'pointer', transition: 'all 0.2s',
              color: showSettings ? 'var(--accent)' : 'var(--text-2)',
              opacity: showSettings ? 1 : 0.5,
            }}
          >
            <span style={{ display: 'inline-block', transition: 'transform 0.3s', transform: showSettings ? 'rotate(90deg)' : 'none' }}>
              <GearIcon />
            </span>
          </button>

          <div style={{ position: 'relative', width: 52, height: 52 }}>
            <ProgressRing pct={pct} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                {pct}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      {showSettings ? (
        <SectionManager onClose={() => setShowSettings(false)} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {sections.map((section, i) => {
            const items = grouped[section.id] ?? []
            if (items.length === 0) return null
            const catDone = items.filter(({ key, habit }) => getEffectiveDone(key, habit)).length

            return (
              <div key={section.id} className="fade-up" style={{ animationDelay: `${120 + i * 60}ms` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)' }}>
                    {section.label}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>
                    {catDone}/{items.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {items.map(({ key, habit }) => {
                    const cfg = configHabitMap[key]
                    const rec = cfg?.recurrence
                    const effectiveDone = getEffectiveDone(key, habit)

                    let onToggle = undefined
                    if (isToday && (rec === 'weekly' || rec === 'monthly' || rec === 'annual')) {
                      onToggle = () => {
                        if (effectiveDone) markUndone(key)
                        else markDone(key)
                        useTrackerStore.getState().toggleHabit(key)
                      }
                    }

                    return (
                      <HabitCard
                        key={key}
                        habitKey={key}
                        habit={{ ...habit, done: effectiveDone }}
                        disabled={false}
                        recurrence={rec}
                        onToggle={onToggle}
                        type={cfg?.type}
                        sets={cfg?.sets}
                        reps={cfg?.reps}
                        weight={cfg?.weight}
                        unit={cfg?.unit}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
