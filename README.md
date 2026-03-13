# Fer.Tracker

Tracker personal de rutina diaria. Mobile-first, sin backend, sin cuentas.
Live: **https://fernandoreyes04.github.io/PersonalTrackerAppWeb/**

## Stack
| Capa | Tecnología |
|---|---|
| Framework | React 19 + Vite |
| Estilos | Tailwind CSS v4 |
| Persistencia | Dexie.js v4 (IndexedDB) + localStorage |
| Estado global | Zustand (6 stores) |
| Charts | Recharts |
| Deploy | GitHub Pages via `gh-pages` |

## Vistas
- **Hoy** — Checklist diario con secciones y hábitos configurables, progress ring, etiqueta editable
- **Gym** — Rutina vacía editable, etiqueta por tipo de día, rest timer SVG
- **Pendientes** — CRUD de tareas con 3 estados ciclables + widget siempre visible
- **Finanzas** — Cuentas, gastos, ingresos, metas de ahorro, deudas
- **Métricas** — Vista deslizable independiente: heatmap hábitos, gym, finanzas, tareas (Recharts)
- **Paneles custom** — Paneles creados por el usuario con secciones/hábitos y recurrencia propia

## Estructura
```
src/
├── components/
│   ├── DayView.jsx           — Checklist del día
│   ├── WeeklySummary.jsx     — Dots semanales + métricas
│   ├── HabitCard.jsx         — Tarjeta hábito: checkbox + ejercicio + recurrencia
│   ├── DateNav.jsx           — Navegación ← hoy →
│   ├── GymView.jsx           — Rutina gym + etiqueta + RestTimer
│   ├── RestTimer.jsx         — Cronómetro SVG ring
│   ├── TasksView.jsx         — Vista completa de tareas
│   ├── TasksWidget.jsx       — Widget compacto bajo calendario
│   ├── CustomPanelView.jsx   — Panel personalizado
│   ├── FinanceView.jsx       — Módulo finanzas completo
│   ├── MetricsView.jsx       — Vista deslizable de métricas (Recharts)
│   ├── SettingsPanel.jsx     — Bottom sheet ajustes globales
│   └── SectionManager.jsx    — Gestión secciones/hábitos
├── db/
│   └── db.js                 — Dexie schema + helpers
├── store/
│   ├── useTrackerStore.js
│   ├── useConfigStore.js
│   ├── useGymStore.js
│   ├── useTaskStore.js
│   ├── useCustomPanelsStore.js
│   ├── useRecurrenceStore.js
│   └── useFinanceStore.js
├── App.jsx
└── index.css
```

## Dev
```bash
npm install
npm run dev
```

## Deploy
```bash
npm run deploy   # build + push a gh-pages
```
