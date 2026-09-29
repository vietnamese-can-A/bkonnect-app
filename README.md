# BKonnect

BKonnect is a mobile Lost & Found application for HCMUT students. It is built with Expo SDK 57, React Native, TypeScript, and Expo Router.

The Semester MVP uses local mock data and a deterministic rule-based matcher. Private `LostReport` records are compared with public `FoundPost` records to produce potential `Match` notifications. There is no backend or login flow in this phase.

## Development

Install dependencies and start the Expo development server:

```bash
npm install
npx expo start
```

Application routes live in `src/app`. Reusable UI, feature modules, services, hooks, types, constants, and utilities live elsewhere under `src`.

The app opens directly to Home. Use **Hoạt động** to review private lost reports and matches, or the clearly labeled **Demo only** role switch in Profile to present different mock users.

## Checks

```bash
npm run lint
npx tsc --noEmit
```
