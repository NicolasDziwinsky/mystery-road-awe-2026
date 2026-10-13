# Architecture (React version)

The React app lives in `src/` and is served under `/react` (see `react.html` and the
`react-app-route` middleware in `vite.config.js`). The vanilla app (`index.html`, root `*.ts`,
`views/*.ts`) still runs at `/` until the migration is finished.

## Folder structure

```
src/
  main.tsx              entry point: mounts <App /> into #root
  App.tsx               route table (react-router-dom, basename /react)
  styles.css
  app/                  the application shell, used exactly once
    AppShell.tsx        Header + <main> + <Outlet />
    Header.tsx          branding + main navigation (NavLinks)
    LoadingGate.tsx     shows loading/error until the case data is in memory
    NotFoundPage.tsx    catch-all route (*)
  components/           shared, presentational UI (no data access, props only)
    Button, RouteButton, Panel, Card, IntroCard, StatCard, StatusBadge,
    MiniListItem, Typography (H2Text, NormalText), ViewSection, index.ts (barrel)
  data/                 data access shared by all features
    loadCaseData.ts     fetches public/data/*.json once into the shared `state`
    useCaseData.ts      hook exposing { loading, error }
  features/             one folder per view
    dashboard/          DashboardPage, HowToItem
    people-locations/   TeamLayout, TeamTabs, PeoplePage, PersonList, PersonCard,
                        PersonAvatar, PersonDetailPage, LocationsPage, LocationCard
    timeline/           TimelinePage, TimelineFilterBar, TimelineList,
                        TimelineEventCard, certainty.ts, KeyIndexDemo (throwaway)
    evidence/           EvidencePage (stub, Exercise 5)
    workspace/          WorkspacePage (stub, Exercise 5)
```

Static data and images stay in `public/` (served as-is by Vite at `/data/...` and `/assets/...`).

## Rules

- **Shared vs. feature-local:** a component goes into `components/` only when **two or more
  features** use it (e.g. `StatusBadge` is used by Dashboard, People and Timeline). Anything used by
  one feature stays in that feature's folder (e.g. `HowToItem` is only on the Dashboard, `PersonCard`
  only in people-locations), even if it looks reusable.
- **`components/` never reads data.** Everything comes in through props. Reading `state`, the URL
  (`useParams`, `useSearchParams`) or deriving values happens in the feature's `*Page` component.
- **Pages are named `*Page.tsx`** and are the only components referenced from `App.tsx`.
- **Every component has an explicit props type**; no `any`.
- **No direct DOM manipulation** (`innerHTML`, `createElement`, `classList`, ...) anywhere in `src/`.

## Routes

| URL (under `/react`)          | Component                         |
| ----------------------------- | --------------------------------- |
| `/`                           | redirect → `/dashboard`           |
| `/dashboard`                  | `DashboardPage`                   |
| `/team`                       | redirect → `/team/people`         |
| `/team/people`                | `TeamLayout` › `PeoplePage`       |
| `/team/people/:personId`      | `TeamLayout` › `PersonDetailPage` |
| `/team/locations`             | `TeamLayout` › `LocationsPage`    |
| `/timeline?person=<id>`       | `TimelinePage`                    |
| `/timeline/key-demo`          | `KeyIndexDemo` (throwaway)        |
| `/evidence`, `/workspace`     | stubs                             |
| anything else                 | `NotFoundPage`                    |
