# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```

No test suite is configured.

## Architecture Overview

This is a **Next.js 15 app** for a church retreat event ("2026 Apostles Summer Retreat"). It uses the App Router with two separate route groups and layouts:

- **`/login`** — Custom session-based auth (name + phone last 4 digits, no Firebase Auth)
- **`/(user)`** — Mobile-first protected area (max-width 420px, bottom nav)
- **`/admin`** — Full-width protected admin dashboard (sidebar nav)

### Auth Flow

`AuthProvider` (`src/components/providers/AuthProvider.tsx`) wraps the root layout and manages session state from `localStorage` (key: `rebone_session`). Login queries the `participants` Firestore collection by name and verifies the phone suffix. Admin login uses hardcoded credentials (`name="admin"`, phone=`"2585"`). There are no Firebase Auth tokens — auth is entirely client-side localStorage.

### Data Layer

All Firestore access goes through service functions in `src/lib/services/`. Server components use the Firebase Admin SDK (`src/lib/firebase/admin.ts`); client components use the client SDK (`src/lib/firebase/client.ts`).

**Rendering pattern**: Server components fetch initial data (some pages use ISR with `revalidate`), then client components attach `onSnapshot` listeners for real-time updates.

### Key Firestore Collections

Defined in `src/types/database.ts`:

| Collection | Purpose |
|---|---|
| `participants` | User accounts (name, phone, team, group, room, attendanceType) |
| `notices` | Announcements (type: `일반` / `시간` / `긴급`) |
| `timetable` | Program schedule (day, time, title, location) |
| `prayerRequests` | Prayer requests (userId, groupSpecific flag) |
| `dailyPrayers` | Daily prayer themes keyed by `YYYY-MM-DD` |
| `groups` | Group assignments (groupNumber, leaderId, memberIds) |
| `rooms` | Room assignments |
| `lectures`, `votes`, `galleries`, `luckyDraws`, `dispatchedChurches` | Feature-specific collections |

### Styling

Tailwind CSS with a Toss-app-inspired design system. Primary brand color is `#3182f6`. Custom palette defined in `tailwind.config.ts`. Use `clsx` for conditional classNames.

### Path Alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`).

## Environment

Firebase credentials are required in `.env.local`:
- Client SDK config (`NEXT_PUBLIC_FIREBASE_*`)
- Admin SDK service account (`FIREBASE_ADMIN_*` or service account JSON)

Firebase project: `apostles-rebone`, region: `asia-northeast3` (Seoul).
