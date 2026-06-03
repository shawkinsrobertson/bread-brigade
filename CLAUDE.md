# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bread Brigade is a family app where members can track bread orders and follow the delivery person's live location on a map. It's web-first (runs in the browser via Expo Web) and mobile-responsive. The baker opens the **Broadcast** tab to share their GPS location every 10 seconds; family members open the **Track** tab to see it on a live Leaflet map.

## Running the app

Two processes must run concurrently:

```bash
# Terminal 1 — Express backend (port 3001)
npm run server

# Terminal 2 — Expo web dev server (port 8081)
npm run web
```

Copy `.env.example` to `.env` before first run (sets `EXPO_PUBLIC_API_URL`).

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Expo (React Native for Web) + Expo Router (file-based tabs) |
| Map | Leaflet / react-leaflet (web only, dynamically imported) |
| Location | expo-location (`requestForegroundPermissionsAsync`) |
| Backend | Node.js + Express (TypeScript via ts-node) |
| Database | lowdb v3 — JSON file store (`bread-brigade.json`, gitignored) |

## Architecture

```
app/
  _layout.tsx        # Tab navigator (Track / Orders / Broadcast)
  index.tsx          # Map view — polls GET /api/location every 5s
  orders.tsx         # Order list + submit form
  broadcast.tsx      # Baker screen — POSTs GPS to /api/location every 10s

components/
  BreadMap.tsx       # Leaflet map (web only, dynamically imported)
  OrderCard.tsx      # Order display with status badge

hooks/
  useLocation.ts     # Polling hook for delivery location
  useOrders.ts       # CRUD hook for orders

constants/
  api.ts             # API_BASE from EXPO_PUBLIC_API_URL env var

server/src/
  index.ts           # Express app entry
  db.ts              # lowdb setup + initDb()
  routes/
    location.ts      # GET /api/location, POST /api/location
    orders.ts        # GET/POST /api/orders, PATCH /api/orders/:id/status
```

## Order statuses

`pending` → `baking` → `out-for-delivery` → `delivered`

Status updates are done via `PATCH /api/orders/:id/status` (baker updates manually from the server side or a future admin UI).

## Key constraints

- `BreadMap.tsx` uses raw DOM (`document.getElementById`) and must only run on web — it is imported conditionally with `Platform.OS === 'web'` in `app/index.tsx`.
- The Leaflet CSS is injected via a `<style>` tag inside the component to avoid a separate CSS import step that Metro/Expo Web doesn't handle by default.
- lowdb v3 (CommonJS) is used rather than v4+ (ESM) to stay compatible with ts-node's default CJS module resolution.
