import { useState, useEffect, useRef } from 'react'
import { useTaskStore } from '../store/useTaskStore'

const STATUS_META = {
  pending:     { label: 'Pendiente',  color: 'var(--text-2)',  bg: 'var(--surface-2)' },
  in_progress: { label: 'En proceso', color: 'var(--yellow)',  bg: 'rgba(245,158,11,0.12)' },
  done:        { label: 'Terminado',  color: 'var(--green)',   bg: 'rgba(16,185,129,0.12)'  },
}

function StatusIcon({ status }) {
  if (status === 'pending') {
    return (
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ display: 'block' }}>
        <circle cx="5.5" cy="5.5" r="4.25" stroke="var(--text-2)" strokeWidth="1.5" />
      </svg>
    )
  }
  if (status === 'in_progress') {
    return (
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ display: 'block' }}>
        <circle cx="5.5" cy="5.5" r="4.25" stroke="var(--yellow)" strokeWidth="1.5" />
        <path d="M5.5 1.25 A4.25 4.25 0 0 1 5.5 9.75 Z" fill="var(--yellow)" />
      </svg>
    )
  }
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ display: 'block' }}>
      <circle cx="5.5" cy="5.5" r="4.25" fill="var(--green)" stroke="var(--green)" strokeWidth="1.5" />
      <path d="M3 5.5 L5 7.5 L8 4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const FILTERS = [
  { id: 'all',         label: 'Todas' },
  { id: 'pending',     label: 'Pendientes' },
  { id: 'in_progress', label: 'En proceso' },
  { id: 'done',        label: 'Terminadas' },
]

function StatusBtn({ status, onCycle }) {
  const meta = STATUS_META[status]
  return (
    <button
      onClick={onCycle}
      title={`Estado: ${meta.label} — tap para cambiar`}
      style={{
        flexShrink: 0, width: '2rem', height: '2rem', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: meta.bg, border: `2px solid ${meta.color}`,
        cursor: 'pointer', transition: 'all 0.2s', padding: 0, margin: 0,
      }}
    >
      <StatusIcon status={status} />
    </button>
  )
}

function TaskRow({ task, onCycle, onDelete, onUpdateTitle }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const saveEdit = () => {
    if (draft.trim() && draft.trim() !== task.title) {
      onUpdateTitle(task.id, draft.trim())
    } else {
      setDraft(task.title)
    }
    setEditing(false)
  }

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 2500)
      return
    }
    onDelete(task.id)
  }

  const isDone = task.status === 'done'

  return (
    <div
      className="flex items-center gap-3 fade-up"
      style={{
        padding: '10px 12px', borderRadius: '12px', marginBottom: 6,
        background: isDone ? 'transparent' : 'var(--surface-2)',
        border: `1px solid ${isDone ? 'var(--border)' : STATUS_META[task.status].color + '30'}`,
        opacity: isDone ? 0.55 : 1,
        transition: 'all 0.25s',
      }}
    >
      <StatusBtn status={task.status} onCycle={() => onCycle(task.id)} />

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') { setDraft(task.title); setEditing(false) } }}
            style={{ width: '100%', fontSize: '14px', borderRadius: 8, padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--accent)', color: 'var(--text)', fontFamily: 'Inter, sans-serif', outline: 'none' }}
          />
        ) : (
          <span
            onClick={() => setEditing(true)}
            style={{
              display: 'block', fontSize: '14px', fontWeight: 500, cursor: 'text',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              color: isDone ? 'var(--text-2)' : 'var(--text)',
              textDecoration: isDone ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </span>
        )}
        <span style={{ fontSize: '11px', color: STATUS_META[task.status].color, opacity: 0.8 }}>
          {STATUS_META[task.status].label}
        </span>
      </div>

      <button
        onClick={handleDelete}
        style={{
          flexShrink: 0, fontSize: '11px', padding: '3px 8px', borderRadius: 8,
          background: confirmDelete ? 'rgba(239,68,68,0.15)' : 'transparent',
          border: `1px solid ${confirmDelete ? 'var(--red)' : 'var(--border)'}`,
          color: confirmDelete ? 'var(--red)' : 'var(--text-2)',
          cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
        }}
      >
        {confirmDelete ? '¿Seguro?' : '×'}
      </button>
    </div>
  )
}

function AddTaskForm({ onAdd }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  const handleAdd = () => {
    if (!value.trim()) return
    onAdd(value)
    setValue('')
    inputRef.current?.focus()
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
        placeholder="Nueva tarea..."
        style={{
          flex: 1, fontSize: '14px', borderRadius: '12px', padding: '10px 14px',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          color: 'var(--text)', fontFamily: 'Inter, sans-serif', outline: 'none',
        }}
      />
      <button
        onClick={handleAdd}
        style={{
          padding: '10px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
          background: value.trim() ? 'var(--accent)' : 'var(--border)',
          color: value.trim() ? '#fff' : 'var(--text-2)',
          border: 'none', cursor: value.trim() ? 'pointer' : 'default',
          transition: 'all 0.2s', flexShrink: 0,
        }}
      >
        + Agregar
      </button>
    </div>
  )
}

export default function TasksView() {
  const { tasks, loading, loadTasks, addTask, cycleStatus, deleteTask, updateTitle } = useTaskStore()
  const [filter, setFilter] = useState('all')

  useEffect(() => { loadTasks() }, [])

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  const counts = {
    pending:     tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done:        tasks.filter(t => t.status === 'done').length,
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 0' }}>
        <span style={{ color: 'var(--text-2)', fontSize: '13px' }}>cargando...</span>
      </div>
    )
  }

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'pending',     label: 'Pendientes', val: counts.pending },
          { key: 'in_progress', label: 'En proceso',  val: counts.in_progress },
          { key: 'done',        label: 'Terminadas',  val: counts.done },
        ].map(({ key, label, val }) => (
          <div
            key={key}
            style={{
              flex: 1, borderRadius: '12px', padding: '10px 8px', textAlign: 'center',
              background: 'var(--surface-2)',
              border: `1px solid ${STATUS_META[key].color}25`,
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 700, color: STATUS_META[key].color, fontVariantNumeric: 'tabular-nums' }}>
              {val}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <AddTaskForm onAdd={addTask} />

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTERS.map(f => {
          const active = filter === f.id
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '4px 12px', borderRadius: 20, fontSize: '12px', fontWeight: 500,
                background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-2)',
                border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {f.label}
              {f.id !== 'all' && counts[f.id] > 0 && (
                <span style={{ marginLeft: 5, fontSize: '10px', background: STATUS_META[f.id]?.color + '25', color: STATUS_META[f.id]?.color, padding: '1px 5px', borderRadius: 10 }}>
                  {counts[f.id]}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-2)', fontSize: '14px' }}>
          {filter === 'all' ? 'Sin tareas — agrega una arriba' : 'Sin tareas en esta categoría'}
        </div>
      ) : (
        <div>
          {filtered.map(task => (
            <TaskRow key={task.id} task={task} onCycle={cycleStatus} onDelete={deleteTask} onUpdateTitle={updateTitle} />
          ))}
        </div>
      )}
    </div>
  )
}
