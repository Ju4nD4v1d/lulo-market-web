# Repository Guidelines

This project is a Vite + React + TypeScript web app with Tailwind CSS, Vitest, and integrations for Firebase, Stripe, and Google Maps.

## Project Structure & Module Organization
- `src/components/`: React components (PascalCase, one component per file).
- `src/pages/`: Route-level components (PascalCase).
- `src/context/`: React context providers.
- `src/services/`: API/SDK wrappers (Stripe, Firebase, invitation services).
- `src/utils/`: Pure helpers; may include co-located `*.test.ts`.
- `src/types/`: TypeScript types and enums.
- `src/test/`: Test helpers and integration tests (`setup.ts`, utilities).
- `public/`: Static assets.

## Build, Test, and Development Commands
- `npm run dev`: Start local dev server with Vite.
- `npm run build`: Production build to `dist/`.
- `npm run preview`: Preview the production build locally.
- `npm run lint`: Lint TypeScript/JS with ESLint.
- `npm test`: Run Vitest in node/jsdom.
- `npm run test:coverage`: Generate v8 coverage (text/json/html).
- `npm run test:ui`: Vitest UI for focused runs.

## Coding Style & Naming Conventions
- TypeScript strict mode; prefer explicit types at public boundaries.
- Indentation: 2 spaces; use ES modules and React function components.
- Naming: Components `PascalCase` (`StoreList.tsx`), files in `utils/types` `kebab-case` or `lowercase` (`order.ts`), variables/functions `camelCase`.
- Hooks follow `useX` naming; respect React Hooks ESLint rules.
- Styling: Tailwind utility classes; theme tokens in `tailwind.config.js`.

## Testing Guidelines
- Framework: Vitest + Testing Library (`jsdom`). Global setup in `src/test/setup.ts` (mocks for Firebase, Maps, observers).
- Place tests as `*.test.ts(x)` either next to code (e.g., `src/utils/badgeLogic.test.ts`) or under `src/test/`.
- Coverage reporters: text, json, html; no enforced thresholds.
- Prefer black-box tests for components and pure functions for utilities.

## Commit & Pull Request Guidelines
- Use Conventional Commit prefixes: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:` (seen in history: `feat`, `fix`, `refactor`, `enhance`, `refine`).
- Keep messages in imperative mood and concise: `fix: resolve Google Maps loading issues`.
- PRs: include summary, linked issues, testing notes, and screenshots/GIFs for UI changes. Mention any config/env impacts.

## Security & Configuration
- Do not commit secrets. Local env in `.env` using Vite-style `VITE_*` vars for keys (Firebase, Stripe, Maps). Only `VITE_*` are exposed to the client.
- The script `scripts/addInvitationCodes.ts` is for testing only—do not run in production.
