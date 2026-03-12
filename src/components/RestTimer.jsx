import { useState, useEffect, useRef } from 'react'

const RADIUS = 32
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function RestTimer({ defaultSeconds, onChangeDefault }) {
  const [total, setTotal] = useState(defaultSeconds)
  const [timeLeft, setTimeLeft] = useState(defaultSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [editingDuration, setEditingDuration] = useState(false)
  const [editMin, setEditMin] = useState(Math.floor(defaultSeconds / 60))
  const [editSec, setEditSec] = useState(defaultSeconds % 60)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!isRunning && !isDone) {
      setTotal(defaultSeconds)
      setTimeLeft(defaultSeconds)
    }
  }, [defaultSeconds])

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current)
          setIsRunning(false)
          setIsDone(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  const handleStart = () => {
    if (isDone) {
      setTimeLeft(total)
      setIsDone(false)
    }
    setIsRunning(true)
  }

  const handlePause = () => {
    clearInterval(intervalRef.current)
    setIsRunning(false)
  }

  const handleReset = () => {
    clearInterval(intervalRef.current)
    setIsRunning(false)
    setIsDone(false)
    setTimeLeft(total)
  }

  const openEdit = () => {
    if (isRunning) return
    setEditMin(Math.floor(total / 60))
    setEditSec(total % 60)
    setEditingDuration(true)
  }

  const applyEdit = () => {
    const secs = Math.max(5, editMin * 60 + Math.min(59, editSec))
    setTotal(secs)
    setTimeLeft(secs)
    setIsRunning(false)
    setIsDone(false)
    onChangeDefault(secs)
    setEditingDuration(false)
  }

  const progress = total > 0 ? timeLeft / total : 0
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  const ringColor = isDone ? 'var(--green)' : 'var(--accent)'
  const textColor = isDone ? 'var(--green)' : 'var(--text)'

  const inputBase = {
    background: 'var(--surface-2)', border: '1px solid var(--accent)',
    color: 'var(--text)', fontFamily: 'Inter, sans-serif',
    padding: '3px 2px', borderRadius: 6, outline: 'none',
    fontVariantNumeric: 'tabular-nums',
  }

  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-2)' }}>
          Descanso
        </span>

        {!editingDuration ? (
          <button
            onClick={openEdit}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, fontSize: '12px',
              padding: '3px 10px', borderRadius: 8,
              color: 'var(--text-2)', border: '1px solid var(--border)',
              background: 'transparent', cursor: isRunning ? 'not-allowed' : 'pointer',
              fontVariantNumeric: 'tabular-nums', opacity: isRunning ? 0.4 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M7.5 1.5 L9.5 3.5 L3.5 9.5 L1 10 L1.5 7.5 Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {String(Math.floor(total / 60)).padStart(2, '0')}:{String(total % 60).padStart(2, '0')}
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              type="number" min="0" max="99" value={editMin}
              onChange={e => setEditMin(Math.max(0, parseInt(e.target.value) || 0))}
              style={{ ...inputBase, width: '2.3rem', textAlign: 'center', fontSize: '12px' }}
            />
            <span style={{ color: 'var(--text-2)' }}>:</span>
            <input
              type="number" min="0" max="59" value={editSec}
              onChange={e => setEditSec(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
              style={{ ...inputBase, width: '2.3rem', textAlign: 'center', fontSize: '12px' }}
            />
            <button onClick={applyEdit} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--green)', fontSize: '1rem', lineHeight: 1 }}>✓</button>
            <button onClick={() => setEditingDuration(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: '1rem', lineHeight: 1 }}>✕</button>
          </div>
        )}
      </div>

      {/* Ring + controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
        <div style={{ position: 'relative', flexShrink: 0, width: 72, height: 72 }}>
          <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="36" cy="36" r={RADIUS} fill="none" stroke="var(--border)" strokeWidth="4" />
            <circle
              cx="36" cy="36" r={RADIUS}
              fill="none" stroke={ringColor} strokeWidth="4"
              strokeLinecap="round" strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.95s linear, stroke 0.3s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: isDone ? '1.1rem' : '13px', fontWeight: 600, color: textColor, fontVariantNumeric: 'tabular-nums', userSelect: 'none', transition: 'color 0.3s' }}>
              {isDone ? '✓' : timeStr}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>
          {!isRunning ? (
            <button
              onClick={handleStart}
              style={{
                width: '100%', padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                background: isDone ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)',
                color: isDone ? 'var(--green)' : 'var(--accent)',
                border: `1px solid ${isDone ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'}`,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {isDone ? '✓ Terminó' : timeLeft < total ? '▶ Continuar' : '▶ Iniciar'}
            </button>
          ) : (
            <button
              onClick={handlePause}
              style={{
                width: '100%', padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                background: 'rgba(245,158,11,0.15)', color: 'var(--yellow)',
                border: '1px solid rgba(245,158,11,0.3)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              ⏸ Pausar
            </button>
          )}
          <button
            onClick={handleReset}
            style={{
              width: '100%', padding: '8px', borderRadius: '10px', fontSize: '13px',
              background: 'transparent', color: 'var(--text-2)',
              border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            ↺ Reset
          </button>
        </div>
      </div>
    </div>
  )
}
