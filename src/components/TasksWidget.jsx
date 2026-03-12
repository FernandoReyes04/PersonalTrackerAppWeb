import { useEffect } from 'react'
import { useTaskStore } from '../store/useTaskStore'

const STATUS_COLOR = {
  pending:     'var(--text-2)',
  in_progress: 'var(--yellow)',
  done:        'var(--green)',
}

function StatusDot({ status }) {
  const color = STATUS_COLOR[status]
  if (status === 'in_progress') {
    return (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ display: 'block', flexShrink: 0 }}>
        <circle cx="5" cy="5" r="3.75" stroke={color} strokeWidth="1.5" />
        <path d="M5 1.25 A3.75 3.75 0 0 1 5 8.75 Z" fill={color} />
      </svg>
    )
  }
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <circle cx="5" cy="5" r="3.75" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

export default function TasksWidget({ onGoToTasks }) {
  const { tasks, loading, loadTasks } = useTaskStore()

  useEffect(() => { loadTasks() }, [])

  const active = tasks.filter(t => t.status !== 'done')
  const pending = tasks.filter(t => t.status === 'pending').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const done = tasks.filter(t => t.status === 'done').length

  if (loading) return null

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)' }}>
          Tareas
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {inProgress > 0 && (
            <span style={{ fontSize: '11px', color: 'var(--yellow)', fontVariantNumeric: 'tabular-nums' }}>
              {inProgress} proceso
            </span>
          )}
          {pending > 0 && (
            <span style={{ fontSize: '11px', color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>
              {pending} pend.
            </span>
          )}
          {done > 0 && (
            <span style={{ fontSize: '11px', color: 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>
              {done} ✓
            </span>
          )}
          <button
            onClick={onGoToTasks}
            style={{
              fontSize: '12px', padding: '3px 10px', borderRadius: 20,
              color: 'var(--accent)', border: '1px solid rgba(99,102,241,0.3)',
              background: 'rgba(99,102,241,0.08)', cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            ver →
          </button>
        </div>
      </div>

      {active.length === 0 && done === 0 && (
        <div style={{ fontSize: '13px', textAlign: 'center', padding: '12px', color: 'var(--text-2)', border: '1px dashed var(--border)', borderRadius: '10px' }}>
          Sin tareas —{' '}
          <span onClick={onGoToTasks} style={{ color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}>
            agregar una
          </span>
        </div>
      )}

      {active.length === 0 && done > 0 && (
        <div style={{ fontSize: '13px', textAlign: 'center', padding: '10px', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.08)', borderRadius: '10px' }}>
          Todo completado
        </div>
      )}

      {active.slice(0, 3).map(task => (
        <div
          key={task.id}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border)' }}
        >
          <StatusDot status={task.status} />
          <span
            style={{
              flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              fontSize: '14px', color: task.status === 'in_progress' ? 'var(--text)' : 'var(--text-2)',
              fontWeight: task.status === 'in_progress' ? 500 : 400,
            }}
          >
            {task.title}
          </span>
          {task.status === 'in_progress' && (
            <span style={{ flexShrink: 0, background: 'rgba(245,158,11,0.15)', color: 'var(--yellow)', fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: 8, letterSpacing: '0.05em' }}>
              EN PROCESO
            </span>
          )}
        </div>
      ))}

      {active.length > 3 && (
        <button
          onClick={onGoToTasks}
          style={{ width: '100%', textAlign: 'center', paddingTop: 8, fontSize: '12px', color: 'var(--text-2)', background: 'transparent', border: 'none', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}
        >
          + {active.length - 3} más...
        </button>
      )}
    </div>
  )
}
