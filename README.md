# ⚡ Fer.Tracker

Tracker personal de rutina diaria. Mobile-first, sin backend, sin cuentas.

## Stack
- React + Vite
- Tailwind CSS v4
- Dexie.js (IndexedDB)
- Zustand

## Dev
```bash
npm install
npm run dev
```

## Deploy a GitHub Pages
1. Cambia `homepage` en `package.json` con tu usuario real
2. `npm run deploy`

## Estructura
```
src/
├── components/   WeeklySummary, DayView, HabitCard, DateNav
├── db/           db.js — Dexie schema + helpers
└── store/        useTrackerStore.js — Zustand
```
