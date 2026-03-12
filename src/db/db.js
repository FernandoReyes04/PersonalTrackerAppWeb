import Dexie from 'dexie'

export const db = new Dexie('FerTracker')

db.version(1).stores({
  daily_logs: 'date, dayType, completedCount, totalCount'
})

db.version(2).stores({
  daily_logs: 'date, dayType, completedCount, totalCount',
  tasks: 'id, status, createdAt'
})

// Build a default log using the dynamic sections from config store
export function buildDefaultLog(dateStr, sections) {
  const dayType = getDayType(dateStr)
  const wakeTime = getWakeTime(dateStr)
  const habits = {}

  if (sections && sections.length > 0) {
    sections.forEach(section => {
      section.habits.forEach(habit => {
        // Special case: gym habit gets dynamic label based on day type
        const label = habit.id === 'gym' ? getGymLabel(dateStr) : habit.label
        habits[habit.id] = { label, category: section.id, done: false }
      })
    })
  }

  return { date: dateStr, dayType, wakeTime, habits }
}

// Rebuild habits for an existing log when sections change.
// Preserves the `done` state for habits that already exist.
export function rebuildLogHabits(existingLog, sections) {
  const newHabits = {}
  sections.forEach(section => {
    section.habits.forEach(habit => {
      const label = habit.id === 'gym' ? getGymLabel(existingLog.date) : habit.label
      if (existingLog.habits[habit.id]) {
        // Preserve existing state, update label & category
        newHabits[habit.id] = {
          ...existingLog.habits[habit.id],
          label,
          category: section.id,
        }
      } else {
        newHabits[habit.id] = { label, category: section.id, done: false }
      }
    })
  })
  return { ...existingLog, habits: newHabits }
}

// 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
export function getDayType(dateStr) {
  const day = new Date(dateStr + 'T12:00:00').getDay()
  const map = { 0: 'rest', 1: 'push', 2: 'pull', 3: 'cardio', 4: 'legs', 5: 'push_pull', 6: 'cardio' }
  return map[day] ?? 'rest'
}

export function getWakeTime(dateStr) {
  const day = new Date(dateStr + 'T12:00:00').getDay()
  // Días con escuela primero (7am) → Lunes(1), Martes(2), Jueves(4)
  // Miércoles(3) y Viernes(5) entran directo al trabajo → 8am
  return [1, 2, 4].includes(day) ? '6:00 AM' : '8:00 AM'
}

export function getGymLabel(dateStr) {
  const type = getDayType(dateStr)
  const labels = {
    push: 'PUSH — Pecho, Hombros, Tríceps',
    pull: 'PULL — Espalda, Bíceps',
    legs: 'LEGS — Piernas + Core',
    cardio: 'Cardio ligero (20–30 min)',
    push_pull: 'PUSH o PULL (alternando)',
    rest: 'Descanso — Recuperación activa',
  }
  return labels[type] ?? 'Gym'
}

// ─── Gym Routines ───────────────────────────────────────────────────────────

export const GYM_ROUTINES = {
  push: [
    { id: 'press_banca',       name: 'Press Banca Plano',      sets: 4, reps: '8–10' },
    { id: 'press_militar',     name: 'Press Militar',           sets: 3, reps: '10–12' },
    { id: 'press_inclinado',   name: 'Press Inclinado',         sets: 3, reps: '10–12' },
    { id: 'elevaciones_lat',   name: 'Elevaciones Laterales',   sets: 3, reps: '12–15' },
    { id: 'extension_triceps', name: 'Extensión Tríceps',       sets: 3, reps: '12–15' },
    { id: 'press_frances',     name: 'Press Francés',           sets: 3, reps: '10–12' },
  ],
  pull: [
    { id: 'dominadas',      name: 'Dominadas / Jalones',  sets: 4, reps: '6–10' },
    { id: 'remo_barra',     name: 'Remo Barra',           sets: 4, reps: '8–10' },
    { id: 'remo_mancuerna', name: 'Remo Mancuerna',       sets: 3, reps: '10–12' },
    { id: 'peso_muerto',    name: 'Peso Muerto',          sets: 3, reps: '8' },
    { id: 'curl_barra',     name: 'Curl Barra',           sets: 3, reps: '10–12' },
    { id: 'curl_martillo',  name: 'Curl Martillo',        sets: 3, reps: '12' },
  ],
  legs: [
    { id: 'sentadilla',   name: 'Sentadilla Barra',       sets: 4, reps: '8–10' },
    { id: 'rdl',          name: 'RDL',                    sets: 3, reps: '10' },
    { id: 'zancadas',     name: 'Zancadas',               sets: 3, reps: '12 c/p' },
    { id: 'goblet_squat', name: 'Goblet Squat',           sets: 3, reps: '12' },
    { id: 'calf_pie',     name: 'Calf Raise de Pie',      sets: 4, reps: '15' },
    { id: 'calf_sentado', name: 'Calf Raise Sentado',     sets: 3, reps: '15' },
    { id: 'single_calf',  name: 'Single-Leg Calf Raise',  sets: 3, reps: '12 c/p' },
    { id: 'plancha',      name: 'Plancha',                sets: 3, reps: '45–60s' },
  ],
  cardio: [
    { id: 'caminata', name: 'Caminata / Movilidad', sets: 1, reps: '20–30 min' },
  ],
}

export function getGymRoutine(dayType, pushPullChoice = null) {
  if (dayType === 'push_pull') return GYM_ROUTINES[pushPullChoice] ?? null
  return GYM_ROUTINES[dayType] ?? null
}

export async function getGymSession(dateStr) {
  const log = await db.daily_logs.get(dateStr)
  return log?.gymSession ?? { exercises: {}, pushPullChoice: null }
}

export async function saveGymSession(dateStr, gymSession) {
  const log = await db.daily_logs.get(dateStr)
  if (log) await db.daily_logs.put({ ...log, gymSession })
}

// ─── Day Meta ────────────────────────────────────────────────────────────────

export const DAY_META = {
  push: { label: 'PUSH', color: '#7c6af7', emoji: '💪' },
  pull: { label: 'PULL', color: '#22d3a0', emoji: '🔙' },
  legs: { label: 'LEGS', color: '#f5c542', emoji: '🦵' },
  cardio: { label: 'CARDIO', color: '#f25c7a', emoji: '🏃' },
  push_pull: { label: 'PUSH/PULL', color: '#7c6af7', emoji: '🔄' },
  rest: { label: 'DESCANSO', color: '#6b6880', emoji: '😴' },
}

export const CATEGORIES = {
  morning: { label: 'Rutina Mañanera', emoji: '🌅' },
  gym: { label: 'Gym', emoji: '💪' },
  content: { label: 'Contenido', emoji: '🎬' },
  hygiene: { label: 'Higiene', emoji: '🚿' },
}

export async function getOrCreateLog(dateStr, sections) {
  let log = await db.daily_logs.get(dateStr)
  if (!log) {
    log = buildDefaultLog(dateStr, sections)
    await db.daily_logs.put(log)
  }
  return log
}

export async function saveLog(log) {
  const habits = Object.values(log.habits)
  log.completedCount = habits.filter(h => h.done).length
  log.totalCount = habits.length
  await db.daily_logs.put(log)
}

export async function getLast7Days() {
  const results = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const log = await db.daily_logs.get(key)
    results.push({ date: key, log })
  }
  return results
}
