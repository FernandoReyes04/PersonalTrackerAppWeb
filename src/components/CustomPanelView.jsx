import { useState } from 'react'
import { useCustomPanelsStore } from '../store/useCustomPanelsStore'

const EMOJI_OPTIONS = [
  '📚','🏃','💊','🧘','🎯','🎵','💻','🍎','💤','✍️',
  '🧹','💰','🌱','🎮','📖','🏠','🎨','🔧','💡','⭐',
  '🛒','🎬','📱','🧪','🏋️',
]

const REC_OPTIONS = [
  { id: 'none',    label: 'Nunca'   },
  { id: 'daily',   label: 'Diario'  },
  { id: 'weekly',  label: 'Semanal' },
  { id: 'monthly', label: 'Mensual' },
  { id: 'annual',  label: 'Anual'   },
]

const REC_LABEL = {
  daily: '↻ Diario',
  weekly: '↻ Semanal',
  monthly: '↻ Mensual',
  annual: '↻ Anual',
}

const UNIT_OPTIONS = ['kg', 'lb', 'min', 'seg']

const inputStyle = {
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.8rem',
  padding: '0.5rem 0.75rem',
  borderRadius: '0.75rem',
  outline: 'none',
  width: '100%',
}

const btnPrimary = {
  background: 'var(--accent)',
  color: '#fff',
  border: 'none',
  borderRadius: '0.5rem',
  padding: '0.4rem 0.75rem',
  fontSize: '0.75rem',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
  flexShrink: 0,
  whiteSpace: 'nowrap',
}

const btnDanger = (confirm) => ({
  background: confirm ? 'var(--red)' : 'transparent',
  color: confirm ? '#fff' : 'var(--red)',
  border: `1px solid var(--red)`,
  borderRadius: '0.5rem',
  padding: '0.2rem 0.45rem',
  fontSize: '0.65rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
  flexShrink: 0,
  whiteSpace: 'nowrap',
})

function RecurrencePicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 3, marginTop: 5, flexWrap: 'wrap' }}>
      {REC_OPTIONS.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          style={{
            padding: '2px 7px', borderRadius: 6,
            fontSize: '0.58rem', fontWeight: 700, cursor: 'pointer',
            background: value === opt.id ? 'var(--accent)' : 'transparent',
            color: value === opt.id ? '#fff' : 'var(--muted)',
            border: `1px solid ${value === opt.id ? 'var(--accent)' : 'var(--border)'}`,
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.15s ease',
            lineHeight: 1.6,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function TypePicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 3, marginTop: 5 }}>
      {[{ id: 'checkbox', label: '✅ Hábito' }, { id: 'exercise', label: '🏋️ Ejercicio' }].map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          style={{
            padding: '2px 8px', borderRadius: 6,
            fontSize: '0.58rem', fontWeight: 700, cursor: 'pointer',
            background: value === opt.id ? 'color-mix(in srgb, var(--accent) 20%, transparent)' : 'transparent',
            color: value === opt.id ? 'var(--accent)' : 'var(--muted)',
            border: `1px solid ${value === opt.id ? 'var(--accent)' : 'var(--border)'}`,
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.15s ease',
            lineHeight: 1.6,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function ExerciseFields({ habit, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 4, marginTop: 6 }}>
      <div>
        <label style={{ display: 'block', fontSize: '0.5rem', fontFamily: 'Inter, sans-serif', color: 'var(--text-2)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Series</label>
        <input
          type="number" min="1" max="20"
          value={habit.sets}
          onChange={e => onChange({ sets: Number(e.target.value) })}
          style={{ ...inputStyle, padding: '0.25rem 0.4rem', fontSize: '0.7rem', textAlign: 'center' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.5rem', fontFamily: 'Inter, sans-serif', color: 'var(--text-2)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reps</label>
        <input
          type="number" min="1" max="999"
          value={habit.reps}
          onChange={e => onChange({ reps: Number(e.target.value) })}
          style={{ ...inputStyle, padding: '0.25rem 0.4rem', fontSize: '0.7rem', textAlign: 'center' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.5rem', fontFamily: 'Inter, sans-serif', color: 'var(--text-2)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Peso</label>
        <input
          type="number" min="0" step="0.5"
          value={habit.weight}
          onChange={e => onChange({ weight: Number(e.target.value) })}
          style={{ ...inputStyle, padding: '0.25rem 0.4rem', fontSize: '0.7rem', textAlign: 'center' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.5rem', fontFamily: 'Inter, sans-serif', color: 'var(--text-2)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Und.</label>
        <select
          value={habit.unit}
          onChange={e => onChange({ unit: e.target.value })}
          style={{ ...inputStyle, padding: '0.25rem 0.4rem', fontSize: '0.7rem' }}
        >
          {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
    </div>
  )
}

// ── Edit mode subview ────────────────────────────────────────────────────────
function EditView({ panel, onDone, onDelete }) {
  const { addSection, removeSection, addHabit, removeHabit, updateHabitRecurrence, updateHabitMeta, removePanel } = useCustomPanelsStore()
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmDeletePanel, setConfirmDeletePanel] = useState(false)
  const [newSectionLabel, setNewSectionLabel] = useState('')
  const [newSectionEmoji, setNewSectionEmoji] = useState('📚')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [newHabitLabels, setNewHabitLabels] = useState({})

  const handleAddSection = () => {
    const label = newSectionLabel.trim()
    if (!label) return
    addSection(panel.id, label, newSectionEmoji)
    setNewSectionLabel('')
    setNewSectionEmoji('📚')
    setShowEmojiPicker(false)
  }

  const handleAddHabit = (sectionId) => {
    const label = (newHabitLabels[sectionId] || '').trim()
    if (!label) return
    addHabit(panel.id, sectionId, label)
    setNewHabitLabels(prev => ({ ...prev, [sectionId]: '' }))
  }

  const handleDeleteSection = (sectionId) => {
    if (confirmDelete === `sec-${sectionId}`) {
      removeSection(panel.id, sectionId)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(`sec-${sectionId}`)
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  const handleDeleteHabit = (sectionId, habitId) => {
    if (confirmDelete === `hab-${habitId}`) {
      removeHabit(panel.id, sectionId, habitId)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(`hab-${habitId}`)
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  return (
    <div className="fade-up">
      {/* Edit header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 800, color: 'var(--text)' }}>
          {panel.emoji} {panel.label}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => {
              if (confirmDeletePanel) {
                removePanel(panel.id)
                onDelete?.()
              } else {
                setConfirmDeletePanel(true)
                setTimeout(() => setConfirmDeletePanel(false), 3000)
              }
            }}
            style={btnDanger(confirmDeletePanel)}
          >
            {confirmDeletePanel ? '¿Eliminar?' : '🗑 Eliminar'}
          </button>
          <button onClick={onDone} style={btnPrimary}>Listo ✓</button>
        </div>
      </div>

      {/* Sections scrollable list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '52vh', overflowY: 'auto', overflowX: 'hidden' }}>
        {panel.sections.map(section => (
          <div key={section.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.75rem' }}>
            {/* Section header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.9rem' }}>{section.emoji}</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text)' }}>{section.label}</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: 'var(--text-2)' }}>{section.habits.length}</span>
              </div>
              <button onClick={() => handleDeleteSection(section.id)} style={btnDanger(confirmDelete === `sec-${section.id}`)}>
                {confirmDelete === `sec-${section.id}` ? '¿Seguro?' : '✕'}
              </button>
            </div>

            {/* Habits */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {section.habits.map(habit => (
                <div key={habit.id} style={{ padding: '0.5rem 0.65rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text)', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{habit.label}</span>
                    <button onClick={() => handleDeleteHabit(section.id, habit.id)} style={btnDanger(confirmDelete === `hab-${habit.id}`)}>
                      {confirmDelete === `hab-${habit.id}` ? '¿Seguro?' : '✕'}
                    </button>
                  </div>
                  {/* Type picker */}
                  <TypePicker
                    value={habit.type || 'checkbox'}
                    onChange={type => updateHabitMeta(panel.id, section.id, habit.id, { type })}
                  />
                  {/* Exercise fields if type === exercise */}
                  {habit.type === 'exercise' && (
                    <ExerciseFields
                      habit={habit}
                      onChange={meta => updateHabitMeta(panel.id, section.id, habit.id, meta)}
                    />
                  )}
                  {/* Recurrence picker */}
                  <RecurrencePicker
                    value={habit.recurrence || 'none'}
                    onChange={rec => updateHabitRecurrence(panel.id, section.id, habit.id, rec)}
                  />
                </div>
              ))}
            </div>

            {/* Add habit */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Nueva subtarea…"
                value={newHabitLabels[section.id] || ''}
                onChange={e => setNewHabitLabels(prev => ({ ...prev, [section.id]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAddHabit(section.id)}
                style={{ ...inputStyle, fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
              />
              <button onClick={() => handleAddHabit(section.id)} style={btnPrimary}>+</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add new section */}
      <div style={{ border: '2px dashed var(--border)', borderRadius: '0.75rem', padding: '0.75rem', marginTop: '0.75rem' }}>
        <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-2)', fontFamily: 'Inter, sans-serif', marginBottom: '0.5rem' }}>
          Nueva sección
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Emoji picker */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {newSectionEmoji}
            </button>
            {showEmojiPicker && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, padding: 8, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, zIndex: 60 }}>
                {EMOJI_OPTIONS.map(em => (
                  <button
                    key={em}
                    onClick={() => { setNewSectionEmoji(em); setShowEmojiPicker(false) }}
                    style={{ width: 32, height: 32, borderRadius: 8, cursor: 'pointer', background: em === newSectionEmoji ? 'var(--border)' : 'transparent', border: 'none', fontSize: '1rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            type="text"
            placeholder="Nombre de la sección…"
            value={newSectionLabel}
            onChange={e => setNewSectionLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddSection()}
            style={inputStyle}
          />
          <button onClick={handleAddSection} style={btnPrimary}>Crear</button>
        </div>
      </div>
    </div>
  )
}

// ── Exercise meta string ───────────────────────────────────────────────────
function exerciseMeta(habit) {
  if (habit.type !== 'exercise') return null
  const parts = []
  if (habit.sets && habit.reps) parts.push(`${habit.sets} × ${habit.reps}`)
  if (habit.weight) parts.push(`${habit.weight} ${habit.unit || 'kg'}`)
  return parts.join(' — ') || null
}

// ── Normal view ───────────────────────────────────────────────────────────────
export default function CustomPanelView({ panelId, onDelete }) {
  const { panels, toggleHabit } = useCustomPanelsStore()
  const panel = panels.find(p => p.id === panelId)
  const [editMode, setEditMode] = useState(false)

  if (!panel) return null

  const allHabits = panel.sections.flatMap(s => s.habits)
  const doneCount = allHabits.filter(h => h.done).length
  const totalCount = allHabits.length

  if (editMode) {
    return <EditView panel={panel} onDone={() => setEditMode(false)} onDelete={onDelete} />
  }

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, color: 'var(--text)', fontSize: '0.95rem' }}>
            {panel.emoji} {panel.label}
          </span>
          {totalCount > 0 && (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: 'var(--text-2)', marginTop: 2 }}>
              {doneCount}/{totalCount} completadas
            </p>
          )}
        </div>
        <button
          onClick={() => setEditMode(true)}
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.95rem', lineHeight: 1, opacity: 0.35 }}
          title="Editar panel"
        >
          ⚙️
        </button>
      </div>

      {/* Empty state */}
      {panel.sections.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
          <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Sin secciones todavía</p>
          <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Toca ⚙️ para agregar secciones y subtareas</p>
        </div>
      )}

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {panel.sections.map(section => {
          const done = section.habits.filter(h => h.done).length
          const total = section.habits.length
          return (
            <div key={section.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.75rem' }}>
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.9rem' }}>{section.emoji}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)' }}>{section.label}</span>
                </div>
                {total > 0 && (
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: done === total ? 'var(--green)' : 'var(--muted)' }}>
                    {done}/{total}
                  </span>
                )}
              </div>

              {/* Habit buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {section.habits.map(habit => {
                  const meta = exerciseMeta(habit)
                  const recLabel = REC_LABEL[habit.recurrence]
                  return (
                    <button
                      key={habit.id}
                      onClick={() => toggleHabit(panelId, section.id, habit.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.5rem 0.75rem',
                        background: habit.done ? 'color-mix(in srgb, var(--green) 10%, transparent)' : 'var(--surface)',
                        border: `1px solid ${habit.done ? 'color-mix(in srgb, var(--green) 35%, transparent)' : 'var(--border)'}`,
                        borderRadius: '0.6rem',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {/* Dot indicator */}
                      <span style={{
                        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                        background: habit.done ? 'var(--green)' : 'transparent',
                        border: `2px solid ${habit.done ? 'var(--green)' : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.55rem', color: '#fff', fontWeight: 800, lineHeight: 1,
                        transition: 'all 0.2s ease',
                      }}>
                        {habit.done ? '✓' : ''}
                      </span>
                      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                        <span style={{
                          display: 'block',
                          fontSize: '0.8rem',
                          color: habit.done ? 'var(--muted)' : 'var(--text)',
                          fontFamily: 'Inter, sans-serif',
                          textDecoration: habit.done ? 'line-through' : 'none',
                          transition: 'all 0.2s ease',
                        }}>
                          {habit.label}
                        </span>
                        {(meta || recLabel) && (
                          <span style={{ fontSize: '0.6rem', fontFamily: 'Inter, sans-serif', color: 'var(--text-2)', display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 1 }}>
                            {meta && <span>{meta}</span>}
                            {recLabel && <span>{recLabel}</span>}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
