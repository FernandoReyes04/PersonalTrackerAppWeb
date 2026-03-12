import { useState } from 'react'
import { useConfigStore } from '../store/useConfigStore'
import { useTrackerStore } from '../store/useTrackerStore'

const EMOJI_OPTIONS = ['📚', '🏃', '💊', '🧘', '🎯', '🎵', '💻', '🍎', '💤', '✍️', '🧹', '💰', '🌱', '🎮', '📖']

const REC_OPTIONS = [
    { id: 'daily',   label: 'Diario'  },
    { id: 'weekly',  label: 'Semanal' },
    { id: 'monthly', label: 'Mensual' },
    { id: 'annual',  label: 'Anual'   },
    { id: 'none',    label: 'Nunca'   },
]

const UNIT_OPTIONS = ['kg', 'lb', 'min', 'seg']

const inputStyle = {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.8rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '10px',
    outline: 'none',
    width: '100%',
}

const btnSmall = {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.4rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    flexShrink: 0,
}

const btnDanger = {
    ...btnSmall,
    background: 'transparent',
    color: 'var(--red)',
    padding: '0.25rem 0.5rem',
    fontSize: '0.7rem',
    border: '1px solid var(--red)',
}

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
                        color: value === opt.id ? '#fff' : 'var(--text-2)',
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
            {[{ id: 'checkbox', label: 'Hábito' }, { id: 'exercise', label: 'Ejercicio' }].map(opt => (
                <button
                    key={opt.id}
                    onClick={() => onChange(opt.id)}
                    style={{
                        padding: '2px 8px', borderRadius: 6,
                        fontSize: '0.58rem', fontWeight: 700, cursor: 'pointer',
                        background: value === opt.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                        color: value === opt.id ? 'var(--accent)' : 'var(--text-2)',
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
                    value={habit.unit || 'kg'}
                    onChange={e => onChange({ unit: e.target.value })}
                    style={{ ...inputStyle, padding: '0.25rem 0.4rem', fontSize: '0.7rem' }}
                >
                    {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
            </div>
        </div>
    )
}

export default function SectionManager({ onClose }) {
    const { sections, addSection, removeSection, addHabit, removeHabit, updateHabitRecurrence, updateHabitMeta } = useConfigStore()
    const syncSections = useTrackerStore(s => s.syncSections)

    const [newSectionLabel, setNewSectionLabel] = useState('')
    const [newSectionEmoji, setNewSectionEmoji] = useState('📚')
    const [newHabitLabels, setNewHabitLabels] = useState({})
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)

    const handleAddSection = () => {
        const label = newSectionLabel.trim()
        if (!label) return
        addSection(label, newSectionEmoji)
        setNewSectionLabel('')
        setNewSectionEmoji('📚')
        setShowEmojiPicker(false)
        setTimeout(() => syncSections(useConfigStore.getState().sections), 50)
    }

    const handleRemoveSection = (sectionId) => {
        if (confirmDelete === `section-${sectionId}`) {
            removeSection(sectionId)
            setConfirmDelete(null)
            setTimeout(() => syncSections(useConfigStore.getState().sections), 50)
        } else {
            setConfirmDelete(`section-${sectionId}`)
            setTimeout(() => setConfirmDelete(null), 3000)
        }
    }

    const handleAddHabit = (sectionId) => {
        const label = (newHabitLabels[sectionId] || '').trim()
        if (!label) return
        addHabit(sectionId, label)
        setNewHabitLabels(prev => ({ ...prev, [sectionId]: '' }))
        setTimeout(() => syncSections(useConfigStore.getState().sections), 50)
    }

    const handleRemoveHabit = (sectionId, habitId) => {
        if (confirmDelete === `habit-${habitId}`) {
            removeHabit(sectionId, habitId)
            setConfirmDelete(null)
            setTimeout(() => syncSections(useConfigStore.getState().sections), 50)
        } else {
            setConfirmDelete(`habit-${habitId}`)
            setTimeout(() => setConfirmDelete(null), 3000)
        }
    }

    return (
        <div className="fade-up">
            {onClose && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)' }}>
                        Editar secciones
                    </span>
                    <button
                        onClick={onClose}
                        style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-2)', fontSize: '0.85rem' }}
                    >
                        ✕
                    </button>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '55vh', overflowY: 'auto', overflowX: 'hidden' }}>
                {sections.map(section => (
                    <div
                        key={section.id}
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: '0.9rem' }}>{section.emoji}</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{section.label}</span>
                                <span style={{ fontSize: '11px', color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>{section.habits.length}</span>
                            </div>
                            <button
                                onClick={() => handleRemoveSection(section.id)}
                                style={confirmDelete === `section-${section.id}`
                                    ? { ...btnDanger, background: 'var(--red)', color: '#fff' }
                                    : btnDanger}
                            >
                                {confirmDelete === `section-${section.id}` ? '¿Seguro?' : '✕'}
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                            {section.habits.map(habit => (
                                <div
                                    key={habit.id}
                                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 12px' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>{habit.label}</span>
                                        <button
                                            onClick={() => handleRemoveHabit(section.id, habit.id)}
                                            style={confirmDelete === `habit-${habit.id}`
                                                ? { ...btnDanger, background: 'var(--red)', color: '#fff', fontSize: '0.65rem', padding: '0.15rem 0.4rem' }
                                                : { ...btnDanger, fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}
                                        >
                                            {confirmDelete === `habit-${habit.id}` ? '¿Seguro?' : '✕'}
                                        </button>
                                    </div>
                                    <TypePicker
                                        value={habit.type || 'checkbox'}
                                        onChange={type => updateHabitMeta(section.id, habit.id, { type })}
                                    />
                                    {habit.type === 'exercise' && (
                                        <ExerciseFields
                                            habit={habit}
                                            onChange={meta => updateHabitMeta(section.id, habit.id, meta)}
                                        />
                                    )}
                                    <RecurrencePicker
                                        value={habit.recurrence || 'daily'}
                                        onChange={rec => updateHabitRecurrence(section.id, habit.id, rec)}
                                    />
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                type="text"
                                placeholder="Nueva subtarea…"
                                value={newHabitLabels[section.id] || ''}
                                onChange={e => setNewHabitLabels(prev => ({ ...prev, [section.id]: e.target.value }))}
                                onKeyDown={e => e.key === 'Enter' && handleAddHabit(section.id)}
                                style={{ ...inputStyle, fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                            />
                            <button onClick={() => handleAddHabit(section.id)} style={btnSmall}>+</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add new section */}
            <div style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '12px', marginTop: 12 }}>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)', marginBottom: 8 }}>
                    Nueva sección
                </span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {newSectionEmoji}
                        </button>
                        {showEmojiPicker && (
                            <div
                                style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, padding: 8, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, zIndex: 50 }}
                            >
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
                    <button onClick={handleAddSection} style={btnSmall}>Crear</button>
                </div>
            </div>
        </div>
    )
}
