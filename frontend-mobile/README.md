# Prashikshan Mobile App

This Expo-powered React Native client is written in TypeScript and will deliver authentication, internship tracking, and logbook workflows for the Prashikshan platform. The project uses Expo Router, TanStack Query, Axios, and Zustand with AsyncStorage persistence.

## Getting started

1. Install dependencies:
	```powershell
	npm install
	```
2. Copy `.env.example` to `.env` (create one if it does not exist yet) and set `EXPO_PUBLIC_API_URL` to your FastAPI backend URL.
3. Run the development server:
	```powershell
	npm run start
	```

### Useful scripts

- `npm run android` – launch the Android app
- `npm run web` – run the Expo web target
- `npm run lint` – run ESLint
- `npm run typecheck` – run TypeScript in `--noEmit` mode

## Project structure

- `app/` – Expo Router routes grouped into authenticated and unauthenticated stacks
- `src/api/` – Axios client and HTTP helpers
- `src/config/` – runtime configuration helpers
- `src/hooks/` – reusable hooks (auth, data fetching, etc.)
- `src/providers/` – global providers (query client, gesture handler, safe areas)
- `src/store/` – Zustand stores with persistence
- `src/types/` – shared TypeScript types
