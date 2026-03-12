# Fer.Tracker — Contexto del Proyecto

## Qué es esto
Tracker personal de rutina diaria — **lienzo en blanco totalmente personalizable**. Sin perfiles, sin backend, sin cuentas. Acceso directo. Pensado para uso mayoritariamente móvil.

Desarrollado para deploy en **GitHub Pages**. Repositorio privado o público bajo usuario de Fer.

---

## Stack
| Capa | Tecnología |
|---|---|
| Framework | React + Vite |
| Estilos | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Persistencia | IndexedDB via **Dexie.js** v4 (2 stores) + localStorage |
| Estado global | **Zustand** (6 stores) |
| Deploy | GitHub Pages via `gh-pages` |

> Sin React Router en uso — todo en una sola vista, navegación por estado. (React Router DOM v7 instalado para expansión futura.)

---

## Arquitectura

```
src/
├── components/
│   ├── WeeklySummary.jsx    — Resumen semanal (dots + métricas dinámicas)
│   ├── DayView.jsx          — Checklist del día + etiqueta editable + ⚙️ SectionManager
│   ├── HabitCard.jsx        — Tarjeta individual: checkbox + metadata ejercicio + badge recurrencia
│   ├── DateNav.jsx          — Navegación de días (← hoy →)
│   ├── SectionManager.jsx   — Ajustes "Hoy": secciones + hábitos + tipo + recurrencia
│   ├── GymView.jsx          — Vista gym: rutina marcable + etiqueta editable + ⚙️ + RestTimer
│   ├── RestTimer.jsx        — Cronómetro de descanso con ring SVG, duración editable
│   ├── TasksView.jsx        — Vista completa de tareas (tab "Pendientes")
│   ├── TasksWidget.jsx      — Widget compacto siempre visible bajo el calendario semanal
│   ├── CustomPanelView.jsx  — Panel personalizado: secciones + hábitos + edit mode + eliminar
│   ├── FinanceView.jsx      — Módulo finanzas: cuentas, gastos, ingresos, metas, deudas
│   ├── MetricsView.jsx      — Métricas: heatmap hábitos, gym por semana, finanzas, tareas (Recharts)
│   └── SettingsPanel.jsx    — Bottom sheet ajustes globales: tema, tabs visibles, secciones Hoy
├── db/
│   └── db.js                — Dexie schema, helpers, getDayType, getGymSession/saveGymSession
├── store/
│   ├── useTrackerStore.js   — Zustand: currentDate, currentLog, weekLogs + updateDayLabel
│   ├── useConfigStore.js    — Zustand: secciones + hábitos (tipo, recurrencia, ejercicio) → localStorage
│   ├── useGymStore.js       — Zustand: rutinas vacías editables + gymLabels + timerDefault → localStorage
│   ├── useTaskStore.js      — Zustand: CRUD de tareas con estados → IndexedDB
│   ├── useCustomPanelsStore.js — Zustand: paneles custom (secciones > hábitos, recurrencia, tipo) → localStorage
│   ├── useRecurrenceStore.js   — Zustand: completions weekly/monthly/annual → localStorage
│   └── useFinanceStore.js      — Zustand: cuentas, gastos, ingresos, metas, deudas → localStorage
├── App.jsx                  — Layout principal, tabs configurables, SettingsPanel, CreatePanelSheet
├── main.jsx
└── index.css                — CSS vars (dark + light), Tailwind, animaciones
```

### Flujo de estado
```
useConfigStore        (sections → localStorage: 'fer-sections')
useGymStore           (routines → localStorage: 'fer-gym-routines')
                      (gymLabels → localStorage: 'fer-gym-labels')
                      (timerDefault → localStorage: 'fer-gym-timer')
useTaskStore          (tasks → IndexedDB db.tasks)
useCustomPanelsStore  (panels → localStorage: 'fer-custom-panels')
useRecurrenceStore    (completions → localStorage: 'fer-habit-completions')
useFinanceStore       (accounts/expenses/categories/goals/debts/incomes → localStorage: 'fer-finance')
    ↓
useTrackerStore       (currentDate, currentLog, weekLogs → IndexedDB db.daily_logs)
```

---

## Base de datos (IndexedDB via Dexie v4)

**Database:** `FerTracker`

| Store | PK | Índices | Descripción |
|---|---|---|---|
| `daily_logs` | `date` (ISO string) | `dayType, completedCount, totalCount` | Log diario de hábitos |
| `tasks` | `id` (string) | `status, createdAt` | Tareas con estado |

### Estructura de un daily_log
```js
{
  date: "2026-03-10",       // PK
  dayType: "push",          // push | pull | legs | cardio | push_pull | rest (interno, no se muestra)
  wakeTime: "6:00 AM",      // interno, no se muestra en UI
  dayLabel: string,         // etiqueta personalizada editable por el usuario (se muestra en DayView)
  completedCount: 3,
  totalCount: 8,
  habits: {
    [habitId]: { label: string, category: string, done: boolean }
  },
}
```

### Estructura de una tarea
```js
{
  id: "task_1234567890",
  title: string,
  status: "pending" | "in_progress" | "done",
  createdAt: ISO string,
  updatedAt: ISO string,
}
```

---

## Secciones y hábitos — Tab "Hoy" (`useConfigStore.js`)

Configurables desde el ⚙️ en DayView y desde SettingsPanel. Persisten en `localStorage` (`fer-sections`).

### Estructura de un hábito en useConfigStore
```js
{
  id: string,
  label: string,
  recurrence: 'daily' | 'weekly' | 'monthly' | 'annual' | 'none',
  type: 'checkbox' | 'exercise',
  sets: number,    // para type === 'exercise'
  reps: number,
  weight: number,
  unit: 'kg' | 'lb' | 'min' | 'seg',
}
```

**Métodos:** `addSection`, `removeSection`, `addHabit`, `removeHabit`, `updateHabitRecurrence`, `updateHabitMeta`

Tras cualquier cambio, `syncSections()` reconstruye los hábitos del log activo preservando `done`.

---

## Paneles personalizados (`useCustomPanelsStore.js`)

Paneles arbitrarios creados por el usuario. Persisten en `localStorage` (`fer-custom-panels`).

### Estructura
```js
panel: {
  id: string, label: string, emoji: string,
  sections: [{
    id, label, emoji,
    habits: [{
      id, label, done: boolean,
      recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'annual',
      lastCompleted: ISO string | null,
      type: 'checkbox' | 'exercise',
      sets, reps, weight, unit,
    }]
  }]
}
```

**Auto-reset al cargar:** `applyResets()` limpia hábitos cuyo período de recurrencia ya venció.

**Métodos:** `addPanel`, `removePanel`, `addSection`, `removeSection`, `addHabit`, `removeHabit`, `toggleHabit`, `updateHabitRecurrence`, `updateHabitMeta`

---

## Sistema de recurrencia (`useRecurrenceStore.js`)

Para hábitos del tab "Hoy" con recurrencia `weekly | monthly | annual`. Persiste en `localStorage` (`fer-habit-completions`).

```js
export function computeRecurrenceDone(lastCompleted, recurrence)
// → true  (completado dentro del período)
// → null  (no aplica, usar estado del daily_log)
```

**Ventanas de reset:**
- `weekly` → semana calendario **Lunes–Domingo** (no rolling 7 días)
- `monthly` → mismo mes/año
- `annual` → mismo año

**Métodos:** `markDone(habitId)`, `markUndone(habitId)`

> Nota: `useCustomPanelsStore` usa la misma lógica de ventana semanal (Mon–Sun) en su `shouldReset()`.

---

## Vista Gym (`GymView.jsx` + `useGymStore.js`)

- **Rutinas vacías por defecto** — el usuario construye su propia rutina desde cero
- **Etiqueta editable** por tipo de día (`push`, `pull`, `legs`, `cardio`) — se guarda en `fer-gym-labels`
- **Ejercicios editables** — add/edit/delete desde ⚙️, sin defaults
- **RestTimer** — ring SVG, duración editable, default 90s en `fer-gym-timer`
- La lógica de `dayType` (push/pull/legs/cardio/rest) sigue siendo interna para estructurar las rutinas, pero las etiquetas son 100% del usuario

```js
gymStore: {
  routines: { push: [], pull: [], legs: [], cardio: [] },  // vacío por defecto
  gymLabels: { [dayTypeKey]: string },                      // etiquetas custom
  timerDefault: number,
}
```

---

## Módulo Finanzas (`useFinanceStore.js` + `FinanceView.jsx`)

Persiste en `localStorage` (`fer-finance`). Todo en MXN. Sin APIs bancarias — ingreso manual.

### Estructura de datos
```js
{
  accounts:   [{ id, name, type: 'debit'|'credit'|'cash'|'transfer', balance, color }],
  expenses:   [{ id, amount, categoryId, accountId, note, date }],
  categories: [{ id, label, emoji }],   // 8 defaults + custom
  goals:      [{ id, label, emoji, targetAmount, savedAmount, color }],
  debts:      [{ id, type: 'credit_card'|'i_owe'|'they_owe', label, amount, note, createdAt }],
  incomes:    [{ id, amount, label, date }],
}
```

### Métodos del store
- `addAccount / updateAccount / deleteAccount`
- `addExpense(data)` → descuenta de `account.balance`; `deleteExpense(id)` → reembolsa
- `addCategory / deleteCategory`
- `addIncome / deleteIncome`
- `addGoal / addToGoal(goalId, amount) / deleteGoal`
- `addDebt / updateDebt / deleteDebt`
- `getTotalBalance()` — suma de todos los accounts
- `getMonthlyExpenses(year, month)` / `getMonthlyIncomes(year, month)`

### Secciones de FinanceView (scroll vertical)
1. **Balance total** — suma en grande + AccountCards scrollables horizontal (saldo editable inline) + botón `+ Cuenta`
2. **Registro rápido** — monto, chips de categoría, chips de cuenta, nota, botón Registrar
3. **Gastos del mes** — navegador mes ← →, barra progreso vs ingresos, lista agrupada por día con botón `×`
4. **Ingresos del mes** — lista + `+ Ingreso`
5. **Metas de ahorro** — grid 2 columnas con barra progreso + botón `+ Apartar` inline
6. **Deudas** — 3 grupos: 💳 Tarjetas (rojo) / 📤 Les debo (amarillo) / 📥 Me deben (verde); saldo editable inline, botón Saldar con confirmación

### Categorías por defecto
🍔 Comida · 🚗 Transporte · 📚 Escuela · 🎮 Ocio · 💊 Salud · 👗 Ropa · 🏠 Casa · 📦 Otro

---

## Sistema de tareas (`useTaskStore.js`)

Tareas en IndexedDB (`db.tasks`). Ciclo: `pending → in_progress → done → pending`

**Métodos:** `loadTasks`, `addTask`, `cycleStatus`, `setStatus`, `updateTitle`, `deleteTask`

---

## Navegación — Tabs

Tabs en barra horizontal scrollable debajo de la DateNav:

| Tab | Tipo | Toggle en ajustes | Descripción |
|---|---|---|---|
| Hoy | Estático permanente | No | Checklist diario + etiqueta editable por día |
| Gym | Estático opcional | Sí | Rutina gym marcable + etiqueta editable + timer |
| Pendientes | Estático opcional | Sí | CRUD de tareas con estados + filtros |
| Finanzas | Estático opcional | Sí | Cuentas, gastos, ingresos, metas, deudas |
| Métricas | Estático opcional | Sí | Heatmap + charts Recharts (hábitos, gym, finanzas, tareas) |
| [custom] | Dinámico | Eliminar desde ⚙️ interno | Panel custom con secciones/hábitos/tipos |
| + | Botón | — | Abre CreatePanelSheet para crear nuevo panel |

- Gym, Pendientes, Finanzas y Métricas se pueden ocultar/mostrar desde Ajustes
- Paneles custom se eliminan desde el ⚙️ dentro del propio panel (con confirmación ¿Eliminar?)
- Si se oculta el tab activo, regresa a "Hoy" automáticamente

---

## Ajustes Generales (`SettingsPanel.jsx`)

Bottom sheet (fixed, maxWidth 28rem, centrado) con:
1. **Apariencia** — toggle dark/light
2. **Secciones del menú** — toggles para Gym y Pendientes
3. **Secciones — Checklist Hoy** — SectionManager embebido (gestión completa de secciones/hábitos del tab Hoy)

---

## DayView — Etiqueta del día

El header de DayView es minimalista:
- Badge `HOY` si es el día actual
- **Etiqueta editable inline** (tap para editar, Enter/blur para guardar) — se guarda como `dayLabel` en el daily_log
- Placeholder: `+ añadir etiqueta`
- Progress ring con % de completado

---

## Lógica de días (en `src/db/db.js`)

`getDayType(dateStr)` → retorna el tipo de día para Gym:

| JS `.getDay()` | Día | dayType |
|---|---|---|
| 0 | Domingo | `rest` |
| 1 | Lunes | `push` |
| 2 | Martes | `pull` |
| 3 | Miércoles | `cardio` |
| 4 | Jueves | `legs` |
| 5 | Viernes | `push_pull` |
| 6 | Sábado | `cardio` |

---

## Diseño / Estética

**Tema:** Dark por defecto. Toggle en SettingsPanel, persiste en `localStorage` (`fer-theme`).

**Fuente:** `Inter` únicamente. `font-variant-numeric: tabular-nums` en todos los datos numéricos.

**Colores (CSS vars — dark):**
```css
--bg: #09090f
--surface: #111118
--surface-2: #1a1a24   /* cards dentro de cards, inputs */
--border: #1e1e2e
--accent: #6366f1      /* índigo */
--accent-2: #22d3ee    /* cian */
--green: #10b981
--red: #ef4444
--yellow: #f59e0b
--text: #f0eef8
--text-2: #7c7a8e      /* texto secundario / labels */
--muted: #4b4960       /* elementos muy atenuados */
```

**Colores (light, `[data-theme="light"]`):**
```css
--bg: #f5f4f9  --surface: #ffffff  --surface-2: #f0eef8
--border: #e4e1f0  --accent: #6366f1  --text: #1a1826  --text-2: #6b6880
```

**Animaciones:**
- `fadeUp`: `translateY(6px)` → 0, `0.25s cubic-bezier(0.16,1,0.3,1)`
- `checkPop`: scale 1 → 1.12 → 1, `0.2s ease`

**Layout:**
- `maxWidth: 430px`, `padding: 0 16px`, centrado en pantalla
- Secciones con `gap: 12px`
- Bottom sheets: `borderRadius: 24px 24px 0 0`, `boxShadow: 0 -8px 40px rgba(0,0,0,0.3)`

**Componentes clave:**
- HabitCard: checkbox circular 22px, label Inter 15px/500, `minHeight: 52px`, `padding: 14px 16px`
- Section headers: UPPERCASE 11px/600, `--text-2`, sin emojis (emojis solo en contenido de usuario)
- Tab bar: text-only, active = `--accent` + underline 2px, inactive = `--text-2`; `height: 44px`
- Progress ring: 52px, 3px stroke, label Inter 11px/600 tabular-nums
- WeeklySummary: barras verticales 4px width, height proporcional al % (4px–28px), color `--accent`
- Botones ⚙️ inline: SVG gear icon, `opacity: 0.5` en reposo → 1 al activar; rota 90° cuando abierto
- Header: "Tracker" Inter 22px/800; iconos SVG de ajustes (sliders) y tema (sol/luna), sin fondo/borde

**Touch/UX:**
- HabitCard: `minHeight: 52px`, toda la card es tappable, `navigator.vibrate(30)` al marcar
- Tab bar: scroll horizontal suave, tab activo centra con `scrollIntoView({ behavior: 'smooth', inline: 'center' })`

---

## Estado actual (v4 — redesign + métricas)

### ✅ Implementado
- Canvas en blanco — sin contenido hardcodeado visible
- Resumen semanal con dots + métricas dinámicas
- Checklist diario agrupado por sección con progress ring
- **Etiqueta editable** por día en DayView (campo `dayLabel` en daily_log)
- Navegación de días (historial hacia atrás, bloqueado en hoy)
- Persistencia en IndexedDB + localStorage
- Secciones y hábitos dinámicos — tipo `checkbox | exercise`, recurrencia `daily | weekly | monthly | annual | none`
- Para hábitos de ejercicio: configurable sets × reps × peso × unidad
- Vista Gym — rutina vacía editable, etiqueta editable por tipo de día, chooser PUSH/PULL viernes
- RestTimer — ring SVG, pausa/reset, duración editable
- Sistema de tareas — 3 estados ciclables, edición inline, filtros
- TasksWidget — siempre visible, badge en tab
- **Paneles personalizados** — crear/eliminar, secciones + hábitos con tipo y recurrencia
- **Recurrencia auto-reset** — daily/weekly/monthly/annual; weekly usa ventana Mon–Sun (no rolling)
- **Módulo Finanzas** — cuentas, gastos con categorías, ingresos, metas de ahorro, deudas (3 tipos)
- **Redesign visual v4** — Inter, nueva paleta, tab bar text+underline, bottom sheets, SVG icons
- **SettingsPanel** — dark/light, toggles de tabs (Gym/Pendientes/Finanzas/Métricas), gestión secciones Hoy
- **Tabs opcionales** — Gym, Pendientes, Finanzas y Métricas toggleables desde ajustes
- **Tab bar scroll** — tab activo centra automáticamente con `scrollIntoView`
- **HabitCard accesible** — 52px mínimo, checkbox circular, haptic feedback
- **Botones ⚙️ SVG** — opacity 0.5 en reposo, rota 90° al activar
- Theme switching dark/light
- PWA — manifest.json, sw.js cache-first, iconos SVG
- **MetricsView** — heatmap 8×7 hábitos, BarChart 14 días, gym stacked 8 semanas, finanzas PieChart+AreaChart, tareas BarChart

### 🔜 Pendiente (roadmap)
- [ ] Viernes: alternancia automática PUSH/PULL por semana
- [ ] Modo offline completo (PWA mejorado)

---

## Dependencias instaladas
| Paquete | Versión | Uso |
|---|---|---|
| react | ^19.2.0 | Framework |
| dexie | ^4.3.0 | IndexedDB |
| zustand | ^5.0.11 | Estado global |
| recharts | ^3.8.0 | Charts — usado en MetricsView |
| react-router-dom | ^7.13.1 | Routing (instalado, no usado aún) |
| @tailwindcss/vite | ^4.2.1 | Estilos |
| gh-pages | — | Deploy |

---

## Comandos útiles
```bash
npm run dev       # desarrollo local
npm run build     # build producción
npm run deploy    # build + deploy a GitHub Pages
```

> `vite.config.js` tiene `base: '/fer-tracker/'`. Cambiar `homepage` en `package.json` por `https://TU_USUARIO.github.io/fer-tracker` antes del primer deploy.
