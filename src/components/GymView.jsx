import { useState, useEffect, useRef } from 'react'
import { useTrackerStore } from '../store/useTrackerStore'
import { useGymStore } from '../store/useGymStore'
import { getDayType, getGymSession, saveGymSession } from '../db/db'
import RestTimer from './RestTimer'

// SVG gear icon
function GearIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 15 15" fill="none">
      <path d="M6.3 1.2a1.2 1.2 0 0 1 2.4 0l.1.6a4.8 4.8 0 0 1 1.3.8l.6-.2a1.2 1.2 0 0 1 1.5 1.7l-.3.5a4.8 4.8 0 0 1 0 1.7l.3.5a1.2 1.2 0 0 1-1.5 1.7l-.6-.2a4.8 4.8 0 0 1-1.3.8l-.1.6a1.2 1.2 0 0 1-2.4 0l-.1-.6a4.8 4.8 0 0 1-1.3-.8l-.6.2a1.2 1.2 0 0 1-1.5-1.7l.3-.5a4.8 4.8 0 0 1 0-1.7L2.8 4A1.2 1.2 0 0 1 4.3 2.3l.6.2A4.8 4.8 0 0 1 6.2 1.8l.1-.6z" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="7.5" cy="7.5" r="1.8" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  )
}

// ── Inline editable label ─────────────────────────────────────────────────────
function EditableLabel({ value, onChange, placeholder, style = {} }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value || '')
  const inputRef = useRef(null)

  const commit = () => {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed !== (value || '')) onChange(trimmed)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') { setDraft(value || ''); setEditing(false) }
        }}
        style={{
          background: 'transparent', border: 'none',
          borderBottom: '1px solid var(--accent)', outline: 'none',
          color: 'var(--text)', fontSize: '13px',
          padding: '1px 4px', minWidth: 80, maxWidth: 200,
          ...style,
        }}
      />
    )
  }

  return (
    <span
      onClick={() => { setDraft(value || ''); setEditing(true) }}
      style={{
        cursor: 'text', color: value ? 'var(--text)' : 'var(--muted)',
        fontSize: '13px', borderBottom: '1px dashed var(--border)', paddingBottom: 1,
        ...style,
      }}
    >
      {value || placeholder}
    </span>
  )
}

// ── Exercise row (normal view) ─────────────────────────────────────────────────
function ExerciseRow({ exercise, done, onToggle, delay }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 fade-up"
      style={{
        padding: '12px 14px', borderRadius: '12px',
        background: done ? 'rgba(99,102,241,0.07)' : 'var(--surface-2)',
        border: `1px solid ${done ? 'rgba(99,102,241,0.25)' : 'var(--border)'}`,
        cursor: 'pointer', transition: 'all 0.2s',
        animationDelay: `${delay}ms`, marginBottom: 6, textAlign: 'left',
      }}
    >
      <div
        style={{
          flexShrink: 0, width: 20, height: 20, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: done ? 'var(--accent)' : 'transparent',
          border: `2px solid ${done ? 'var(--accent)' : 'var(--border)'}`,
          transition: 'all 0.2s',
        }}
      >
        {done && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.2 6L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: done ? 'var(--text-2)' : 'var(--text)', transition: 'color 0.2s' }}>
        {exercise.name}
      </span>
      <span style={{ flexShrink: 0, fontSize: '12px', color: done ? 'var(--muted)' : 'var(--accent)', fontVariantNumeric: 'tabular-nums', opacity: done ? 0.4 : 1 }}>
        {exercise.sets}×{exercise.reps}
      </span>
    </button>
  )
}

// ── Exercise row (edit mode) ───────────────────────────────────────────────────
function ExerciseEditRow({ exercise, onUpdate, onDelete }) {
  const [name, setName] = useState(exercise.name)
  const [sets, setSets] = useState(String(exercise.sets))
  const [reps, setReps] = useState(exercise.reps)

  const save = () => {
    const parsedSets = Math.max(1, parseInt(sets) || 1)
    if (name.trim()) onUpdate(exercise.id, { name: name.trim(), sets: parsedSets, reps: reps.trim() || exercise.reps })
  }

  const inputBase = { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'Inter, sans-serif', borderRadius: 8, outline: 'none' }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: '10px', marginBottom: 6, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <input value={name} onChange={e => setName(e.target.value)} onBlur={save}
        style={{ ...inputBase, flex: 1, fontSize: '13px', padding: '4px 8px', minWidth: 0 }}
        placeholder="Nombre del ejercicio" />
      <input value={sets} onChange={e => setSets(e.target.value)} onBlur={save}
        style={{ ...inputBase, fontSize: '12px', textAlign: 'center', padding: '4px 4px', width: '2.2rem', color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}
        placeholder="4" />
      <span style={{ color: 'var(--text-2)', fontSize: '11px' }}>×</span>
      <input value={reps} onChange={e => setReps(e.target.value)} onBlur={save}
        style={{ ...inputBase, fontSize: '12px', textAlign: 'center', padding: '4px 4px', width: '3.8rem', color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}
        placeholder="8–10" />
      <button onClick={() => onDelete(exercise.id)}
        style={{ background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: '2px 4px', flexShrink: 0 }}>
        ×
      </button>
    </div>
  )
}

// ── Add exercise form ──────────────────────────────────────────────────────────
function AddExerciseForm({ routineKey, onAdd }) {
  const [name, setName] = useState('')
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('')

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd(routineKey, { id: `ex_${Date.now()}`, name: name.trim(), sets: Math.max(1, parseInt(sets) || 3), reps: reps.trim() || '10' })
    setName(''); setSets('3'); setReps('')
  }

  const inputBase = { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'Inter, sans-serif', borderRadius: 8, outline: 'none' }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: '10px', border: '1px dashed var(--border)' }}>
      <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()}
        style={{ ...inputBase, flex: 1, fontSize: '13px', padding: '4px 8px', minWidth: 0 }}
        placeholder="Nuevo ejercicio..." />
      <input value={sets} onChange={e => setSets(e.target.value)}
        style={{ ...inputBase, fontSize: '12px', textAlign: 'center', padding: '4px 4px', width: '2.2rem', color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}
        placeholder="3" />
      <span style={{ color: 'var(--text-2)', fontSize: '11px' }}>×</span>
      <input value={reps} onChange={e => setReps(e.target.value)}
        style={{ ...inputBase, fontSize: '12px', textAlign: 'center', padding: '4px 4px', width: '3.8rem', color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}
        placeholder="8–10" />
      <button onClick={handleAdd}
        style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--accent)', cursor: 'pointer', borderRadius: 8, padding: '4px 10px', fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}>
        +
      </button>
    </div>
  )
}

// ── Main GymView ───────────────────────────────────────────────────────────────
export default function GymView() {
  const currentDate = useTrackerStore(s => s.currentDate)
  const dayType = getDayType(currentDate)

  const { getRoutine, gymLabels, setGymLabel, updateExercise, addExercise, removeExercise, timerDefault, setTimerDefault } = useGymStore()

  const [gymSession, setGymSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    setLoading(true)
    setShowSettings(false)
    getGymSession(currentDate).then(session => {
      setGymSession(session)
      setLoading(false)
    })
  }, [currentDate])

  const toggleExercise = async (exerciseId) => {
    const updated = { ...gymSession, exercises: { ...gymSession.exercises, [exerciseId]: !gymSession.exercises[exerciseId] } }
    setGymSession(updated)
    await saveGymSession(currentDate, updated)
  }

  const choosePushPull = async (choice) => {
    const updated = { pushPullChoice: choice, exercises: {} }
    setGymSession(updated)
    await saveGymSession(currentDate, updated)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 0' }}>
        <span style={{ color: 'var(--text-2)', fontSize: '13px' }}>cargando...</span>
      </div>
    )
  }

  // ── Día de descanso ──────────────────────────────────────────────────────────
  if (dayType === 'rest') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }} className="fade-up">
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>— —</div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Día de Descanso</div>
        <div style={{ color: 'var(--text-2)', fontSize: '13px', textAlign: 'center', maxWidth: '18rem' }}>Recuperación activa — estira, descansa, hidrata.</div>
      </div>
    )
  }

  // ── Viernes: elegir PUSH o PULL ──────────────────────────────────────────────
  if (dayType === 'push_pull' && !gymSession?.pushPullChoice) {
    return (
      <div className="fade-up">
        <p style={{ fontSize: '13px', marginBottom: 16, textAlign: 'center', color: 'var(--text-2)' }}>¿Qué toca hoy?</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => choosePushPull('push')} style={{ flex: 1, padding: '1rem', borderRadius: '12px', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.35)', color: 'var(--accent)', cursor: 'pointer' }}>
            {gymLabels['push'] || 'PUSH'}
          </button>
          <button onClick={() => choosePushPull('pull')} style={{ flex: 1, padding: '1rem', borderRadius: '12px', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: 'var(--green)', cursor: 'pointer' }}>
            {gymLabels['pull'] || 'PULL'}
          </button>
        </div>
      </div>
    )
  }

  // ── Vista normal ─────────────────────────────────────────────────────────────
  const effectiveType = dayType === 'push_pull' ? gymSession.pushPullChoice : dayType
  const exercises = getRoutine(dayType, gymSession?.pushPullChoice)
  const doneCount = exercises.filter(ex => gymSession.exercises[ex.id]).length
  const totalCount = exercises.length
  const allDone = totalCount > 0 && doneCount === totalCount

  const customLabel = gymLabels[effectiveType] || ''

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <EditableLabel
            value={customLabel}
            onChange={label => setGymLabel(effectiveType, label)}
            placeholder="+ añadir etiqueta"
          />
          {allDone && <span style={{ fontSize: '12px', color: 'var(--green)' }} className="check-pop">✓ listo</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '12px', color: allDone ? 'var(--green)' : 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>
            {doneCount}/{totalCount}
          </span>
          {dayType === 'push_pull' && (
            <button
              onClick={() => choosePushPull(gymSession.pushPullChoice === 'push' ? 'pull' : 'push')}
              style={{ fontSize: '11px', padding: '3px 8px', borderRadius: 8, color: 'var(--text-2)', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}>
              → {gymSession.pushPullChoice === 'push' ? (gymLabels['pull'] || 'PULL') : (gymLabels['push'] || 'PUSH')}
            </button>
          )}
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
            }}>
            <span style={{ display: 'inline-block', transition: 'transform 0.3s', transform: showSettings ? 'rotate(90deg)' : 'none' }}>
              <GearIcon />
            </span>
          </button>
        </div>
      </div>

      {/* Body */}
      {showSettings ? (
        <div className="fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)' }}>
              Editar rutina —
            </span>
            <EditableLabel value={customLabel} onChange={label => setGymLabel(effectiveType, label)} placeholder="sin nombre" />
          </div>

          {exercises.map(ex => (
            <ExerciseEditRow
              key={ex.id}
              exercise={ex}
              onUpdate={(id, changes) => updateExercise(effectiveType, id, changes)}
              onDelete={(id) => removeExercise(effectiveType, id)}
            />
          ))}

          <AddExerciseForm routineKey={effectiveType} onAdd={addExercise} />

          <button
            onClick={() => setShowSettings(false)}
            style={{ width: '100%', marginTop: 16, padding: '10px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, background: 'rgba(99,102,241,0.15)', color: 'var(--accent)', border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer' }}>
            Listo ✓
          </button>
        </div>
      ) : (
        <>
          {exercises.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-2)' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: 4 }}>Sin ejercicios todavía</p>
              <p style={{ fontSize: '13px' }}>Toca el engranaje para agregar tu rutina</p>
            </div>
          ) : (
            <div>
              {exercises.map((ex, i) => (
                <ExerciseRow key={ex.id} exercise={ex} done={!!gymSession.exercises[ex.id]} onToggle={() => toggleExercise(ex.id)} delay={i * 25} />
              ))}
            </div>
          )}

          {exercises.length > 0 && (
            <RestTimer defaultSeconds={timerDefault} onChangeDefault={setTimerDefault} />
          )}
        </>
      )}
    </div>
  )
}
