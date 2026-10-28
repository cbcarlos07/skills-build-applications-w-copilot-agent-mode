# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep each React page responsible for rendering its capability, loading state, empty state, and accessible alert handling; only then confirm the UI contract against the API responses
- Logic tier decision: Centralize business rules in the service layer, validate malformed IDs and missing fields before database calls, and return deliberate 4xx responses instead of allowing cast errors or 500s from the Express layer.
- Data tier decision: Tighten Mongoose validation for required fields and relationships, and keep seed data idempotent so the demo users, teams, activities, and workouts match the contract without duplicating or overwriting unrelated records.
- Activity tracking approach: Accept `userId` and `teamId`, confirm both records exist, compute a positive `points` value and `occurredAt` timestamp, and store the submitted `user`, `team`, `type`, and `minutes` alongside the derived metadata.
- Team management approach: Require a non-empty `name`, preserve the submitted `mascot`, and keep `members` as an array of user IDs so the created and listed team data remains consistent.
- Leaderboard approach: Aggregate team points from activity records, sort descending by total score, and assign a 1-based rank to each team entry using `teamName`, `totalPoints`, and `rank`.
- Workout suggestions approach: Match the seeded user by email, inspect recent activity patterns or fitness goals, and return the most relevant workout with a `focus` that matches the user's pattern and a `reason` explaining the recommendation.

## Test plan

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — validates database contracts and seeded demo data. Current failures show the models are missing required fields and the seed contract is not yet fully enforced.
- API command: `npm run test:api --prefix octofit-tracker/backend` — validates endpoint behavior, validation responses, leaderboard aggregation, and workout recommendation logic. Current failures show placeholder service implementations returning `501`, empty leaderboards, and unfiltered results.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — validates loading states, empty states, accessible alerts, and the route-level UI contract. Current failures show the pages are still in placeholder mode rather than rendering real data.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — catches TypeScript and integration issues in the models, routes, and service layer before the API contract is considered complete.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — catches React and Vite/TypeScript issues after the UI contract is implemented.

