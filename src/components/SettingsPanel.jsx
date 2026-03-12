import { useEffect } from 'react'
import SectionManager from './SectionManager'

const TOGGLEABLE_TABS = [
  { id: 'gym',     label: 'Gym' },
  { id: 'tasks',   label: 'Pendientes' },
  { id: 'finance', label: 'Finanzas' },
]

export default function SettingsPanel({ theme, onToggleTheme, onClose, hiddenTabs = [], onToggleTab }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const isDark = theme === 'dark'

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 40,
        }}
      />

      <div
        className="fade-up"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          marginLeft: 'auto', marginRight: 'auto',
          width: '100%', maxWidth: '430px',
          maxHeight: '88vh', overflowY: 'auto',
          background: 'var(--surface)',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
          padding: '12px 16px 36px',
          zIndex: 50,
        }}
      >
        <div style={{ width: 32, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>Ajustes</span>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-2)', fontSize: '0.9rem', padding: 0 }}
          >
            ✕
          </button>
        </div>

        {/* ── Apariencia ── */}
        <div style={{ background: 'var(--surface-2)', borderRadius: 16, border: '1px solid var(--border)', padding: '14px 16px', marginBottom: 12 }}>
          <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: 14 }}>
            Apariencia
          </span>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>
              {isDark ? 'Modo oscuro' : 'Modo claro'}
            </span>
            <button
              onClick={onToggleTheme}
              title="Cambiar tema"
              style={{
                width: 48, height: 26, borderRadius: 13,
                background: isDark ? 'var(--border)' : 'var(--accent)',
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background 0.3s', padding: 0, flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute', top: 3, left: isDark ? 3 : 23,
                width: 20, height: 20, borderRadius: '50%',
                background: '#fff', transition: 'left 0.25s ease',
                display: 'block', boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
              }} />
            </button>
          </div>
        </div>

        {/* ── Secciones visibles ── */}
        <div style={{ background: 'var(--surface-2)', borderRadius: 16, border: '1px solid var(--border)', padding: '14px 16px', marginBottom: 12 }}>
          <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: 14 }}>
            Secciones del menú
          </span>

          {TOGGLEABLE_TABS.map(tab => {
            const visible = !hiddenTabs.includes(tab.id)
            return (
              <div key={tab.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: visible ? 'var(--text)' : 'var(--text-2)' }}>
                  {tab.label}
                </span>
                <button
                  onClick={() => onToggleTab?.(tab.id)}
                  style={{
                    width: 48, height: 26, borderRadius: 13,
                    background: visible ? 'var(--accent)' : 'var(--border)',
                    border: 'none', cursor: 'pointer', position: 'relative',
                    transition: 'background 0.3s', padding: 0, flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 3,
                    left: visible ? 23 : 3,
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#fff', transition: 'left 0.25s ease',
                    display: 'block', boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                  }} />
                </button>
              </div>
            )
          })}
        </div>

        {/* ── Checklist ── */}
        <div style={{ background: 'var(--surface-2)', borderRadius: 16, border: '1px solid var(--border)', padding: '14px 16px' }}>
          <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: 14 }}>
            Secciones — Checklist
          </span>
          <SectionManager />
        </div>
      </div>
    </>
  )
}
