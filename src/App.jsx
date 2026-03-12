import { useEffect, useRef, useState, useCallback } from 'react'
import { useTrackerStore } from './store/useTrackerStore'
import { useConfigStore } from './store/useConfigStore'
import { useTaskStore } from './store/useTaskStore'
import { useCustomPanelsStore } from './store/useCustomPanelsStore'
import WeeklySummary from './components/WeeklySummary'
import DayView from './components/DayView'
import GymView from './components/GymView'
import TasksView from './components/TasksView'
import TasksWidget from './components/TasksWidget'
import FinanceView from './components/FinanceView'
import MetricsView from './components/MetricsView'
import DateNav from './components/DateNav'
import SettingsPanel from './components/SettingsPanel'
import CustomPanelView from './components/CustomPanelView'

// 'today' is always visible — cannot be hidden
const STATIC_TABS = [
  { id: 'today',   label: 'Hoy',        permanent: true },
  { id: 'gym',     label: 'Gym' },
  { id: 'tasks',   label: 'Pendientes' },
  { id: 'finance', label: 'Finanzas' },
]

const PANEL_EMOJIS = [
  '🎯','📚','💰','🏠','🎨','🔧','💡','⭐','🛒','🎬',
  '📱','🧪','🌱','🎵','🏋️','🧘','💊','🍎','🧹','🎮',
]

// ── SVG Icons ─────────────────────────────────────────────────────────────────
function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <line x1="3" y1="5" x2="15" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="6" cy="5" r="1.5" fill="currentColor"/>
      <circle cx="11" cy="9" r="1.5" fill="currentColor"/>
      <circle cx="7" cy="13" r="1.5" fill="currentColor"/>
    </svg>
  )
}

function IconSun() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <circle cx="8.5" cy="8.5" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="8.5" y1="1" x2="8.5" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8.5" y1="14" x2="8.5" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="1" y1="8.5" x2="3" y2="8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="14" y1="8.5" x2="16" y2="8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3.2" y1="3.2" x2="4.6" y2="4.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12.4" y1="12.4" x2="13.8" y2="13.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3.2" y1="13.8" x2="4.6" y2="12.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12.4" y1="4.6" x2="13.8" y2="3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function IconMoon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <path d="M14.5 10.5A6.5 6.5 0 0 1 6.5 2.5a6.5 6.5 0 1 0 8 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Create Panel Sheet ────────────────────────────────────────────────────────
function CreatePanelSheet({ onClose, onCreated }) {
  const { addPanel } = useCustomPanelsStore()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎯')
  const [showPicker, setShowPicker] = useState(false)

  const handleCreate = () => {
    const label = name.trim()
    if (!label) return
    const id = addPanel(label, emoji)
    onCreated(id)
  }

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
          background: 'var(--surface)',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
          padding: '12px 16px 40px',
          zIndex: 50,
        }}
      >
        <div style={{ width: 32, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
            Nuevo panel
          </span>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-2)', fontSize: '0.9rem', padding: 0 }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setShowPicker(!showPicker)}
              style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface-2)', border: `1px solid ${showPicker ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.2s' }}
            >
              {emoji}
            </button>
            {showPicker && (
              <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: 6, padding: 8, borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, zIndex: 60 }}>
                {PANEL_EMOJIS.map(em => (
                  <button
                    key={em}
                    onClick={() => { setEmoji(em); setShowPicker(false) }}
                    style={{ width: 32, height: 32, borderRadius: 8, cursor: 'pointer', background: em === emoji ? 'var(--border)' : 'transparent', border: 'none', fontSize: '1rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            type="text"
            placeholder="Nombre del panel…"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            autoFocus
            style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', padding: '0.55rem 0.75rem', borderRadius: '12px', outline: 'none' }}
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          style={{ width: '100%', padding: '0.7rem', borderRadius: '12px', background: name.trim() ? 'var(--accent)' : 'var(--border)', color: name.trim() ? '#fff' : 'var(--text-2)', border: 'none', cursor: name.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s' }}
        >
          Crear panel
        </button>
      </div>
    </>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { loadToday } = useTrackerStore()
  const sections = useConfigStore(s => s.sections)
  const tasks = useTaskStore(s => s.tasks)
  const { panels: customPanels } = useCustomPanelsStore()

  const [theme, setTheme] = useState(() => localStorage.getItem('fer-theme') || 'dark')
  const [activeView, setActiveView] = useState('today')
  const [showSettings, setShowSettings] = useState(false)
  const [showCreatePanel, setShowCreatePanel] = useState(false)
  const [hiddenTabs, setHiddenTabs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fer-hidden-tabs') || '[]') } catch { return [] }
  })
  const [page, setPage] = useState(0) // 0 = main, 1 = metrics
  const tabBarRef = useRef(null)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    touchStartX.current = null
    touchStartY.current = null
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return
    if (dx < 0) setPage(1)   // swipe left  → métricas
    if (dx > 0) setPage(0)   // swipe right → principal
  }, [])

  useEffect(() => {
    if (!tabBarRef.current) return
    const btn = tabBarRef.current.querySelector(`[data-tabid="${activeView}"]`)
    btn?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeView])

  const toggleTabVisibility = (tabId) => {
    setHiddenTabs(prev => {
      const next = prev.includes(tabId) ? prev.filter(id => id !== tabId) : [...prev, tabId]
      localStorage.setItem('fer-hidden-tabs', JSON.stringify(next))
      return next
    })
    if (activeView === tabId) setActiveView('today')
  }

  useEffect(() => { loadToday(sections) }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('fer-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  const activeTaskCount = tasks.filter(t => t.status !== 'done').length

  const handlePanelCreated = (id) => {
    setActiveView(id)
    setShowSettings(false)
    setShowCreatePanel(false)
  }

  return (
    <div
      style={{ minHeight: '100vh', width: '100%', background: 'var(--bg)', transition: 'background 0.3s', overflow: 'hidden' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Swipe container ── */}
      <div style={{
        display: 'flex',
        width: '200%',
        transform: `translateX(${page === 0 ? '0' : '-50%'})`,
        transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)',
        willChange: 'transform',
        alignItems: 'flex-start',
      }}>

      {/* ── PAGE 0: Main ── */}
      <div style={{ width: '50%', minHeight: '100vh' }}>
      <div style={{ maxWidth: '430px', margin: '0 auto', padding: '0 16px 40px' }}>

        {/* ── Header ── */}
        <div style={{ paddingTop: 32, paddingBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text)', margin: 0, lineHeight: 1 }}>
              Tracker
            </h1>
            {/* Page dots */}
            <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginLeft: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'block', transition: 'background 0.2s' }} />
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--muted)', display: 'block', transition: 'background 0.2s' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={toggleTheme}
              style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-2)', transition: 'color 0.2s' }}
              title="Cambiar tema"
            >
              {theme === 'dark' ? <IconMoon /> : <IconSun />}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-2)', transition: 'color 0.2s' }}
              title="Ajustes"
            >
              <IconSettings />
            </button>
          </div>
        </div>

        {/* ── Weekly summary ── */}
        <section className="rounded-2xl p-4 mb-3 fade-up"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', animationDelay: '40ms' }}>
          <WeeklySummary />
        </section>

        {/* ── Tasks widget ── */}
        <section className="rounded-2xl p-4 mb-3 fade-up"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', animationDelay: '55ms' }}>
          <TasksWidget onGoToTasks={() => setActiveView('tasks')} />
        </section>

        {/* ── Date nav ── */}
        <section className="rounded-2xl px-4 py-2 mb-3 fade-up"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', animationDelay: '60ms' }}>
          <DateNav />
        </section>

        {/* ── Tab nav ── */}
        <div
          ref={tabBarRef}
          className="fade-up"
          style={{
            display: 'flex',
            marginBottom: 12,
            animationDelay: '80ms',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {/* Static tabs */}
          {STATIC_TABS.filter(tab => !hiddenTabs.includes(tab.id)).map(tab => {
            const active = activeView === tab.id
            const showCount = tab.id === 'tasks' && activeTaskCount > 0
            return (
              <button
                key={tab.id}
                data-tabid={tab.id}
                onClick={() => setActiveView(tab.id)}
                style={{
                  flexShrink: 0,
                  padding: '10px 16px',
                  height: 44,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                  color: active ? 'var(--accent)' : 'var(--text-2)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'color 0.2s, border-color 0.2s',
                  whiteSpace: 'nowrap',
                  marginBottom: -1,
                }}
              >
                {showCount ? `${tab.label} · ${activeTaskCount}` : tab.label}
              </button>
            )
          })}

          {/* Custom panel tabs */}
          {customPanels.map(panel => {
            const active = activeView === panel.id
            return (
              <button
                key={panel.id}
                data-tabid={panel.id}
                onClick={() => setActiveView(panel.id)}
                style={{
                  flexShrink: 0,
                  padding: '10px 14px',
                  height: 44,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                  color: active ? 'var(--accent)' : 'var(--text-2)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'color 0.2s, border-color 0.2s',
                  whiteSpace: 'nowrap',
                  marginBottom: -1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <span style={{ fontSize: '0.85rem' }}>{panel.emoji}</span>
                <span>{panel.label}</span>
              </button>
            )
          })}

          {/* + New panel button */}
          <button
            onClick={() => setShowCreatePanel(true)}
            style={{
              flexShrink: 0,
              padding: '10px 12px',
              height: 44,
              background: 'transparent',
              border: 'none',
              borderBottom: '2px solid transparent',
              color: 'var(--muted)',
              cursor: 'pointer',
              fontSize: '1.1rem',
              lineHeight: 1,
              marginBottom: -1,
            }}
            title="Nuevo panel"
          >
            +
          </button>
        </div>

        {/* ── Main content ── */}
        <section className="rounded-2xl p-4 fade-up"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', animationDelay: '100ms' }}>
          {activeView === 'today'   && <DayView />}
          {activeView === 'gym'     && <GymView />}
          {activeView === 'tasks'   && <TasksView />}
          {activeView === 'finance' && <FinanceView />}
          {customPanels.map(panel =>
            activeView === panel.id
              ? <CustomPanelView key={panel.id} panelId={panel.id} onDelete={() => setActiveView('today')} />
              : null
          )}
        </section>
      </div>
      </div>{/* end PAGE 0 inner */}

      {/* ── PAGE 1: Métricas ── */}
      <div style={{ width: '50%', minHeight: '100vh' }}>
        <div style={{ maxWidth: '430px', margin: '0 auto', padding: '0 16px 40px' }}>

          {/* ── Header métricas ── */}
          <div style={{ paddingTop: 32, paddingBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text)', margin: 0, lineHeight: 1 }}>
                Métricas
              </h1>
              {/* Page dots */}
              <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginLeft: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--muted)', display: 'block', transition: 'background 0.2s' }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'block', transition: 'background 0.2s' }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={toggleTheme}
                style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-2)', transition: 'color 0.2s' }}
                title="Cambiar tema"
              >
                {theme === 'dark' ? <IconMoon /> : <IconSun />}
              </button>
            </div>
          </div>

          <section className="rounded-2xl p-4 fade-up"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <MetricsView />
          </section>
        </div>
      </div>

      </div>{/* end swipe container */}

      {/* ── Global settings overlay ── */}
      {showSettings && (
        <SettingsPanel
          theme={theme}
          onToggleTheme={toggleTheme}
          onClose={() => setShowSettings(false)}
          onPanelCreated={handlePanelCreated}
          hiddenTabs={hiddenTabs}
          onToggleTab={toggleTabVisibility}
        />
      )}

      {/* ── Create panel sheet ── */}
      {showCreatePanel && (
        <CreatePanelSheet
          onClose={() => setShowCreatePanel(false)}
          onCreated={handlePanelCreated}
        />
      )}
    </div>
  )
}
