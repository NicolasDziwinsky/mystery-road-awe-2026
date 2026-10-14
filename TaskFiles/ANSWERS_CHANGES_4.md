# Exercise 4 — Changes and Answers

All React code is in `src/`. Run `npm run dev` and open `http://localhost:5173/react/`.
Structure and rules are documented in `ARCHITECTURE.md`.

---

## 0. Restructure (basis for everything below)

**What changed**

- Flat Exercise 3 layout → feature folders:
  - `appShell.tsx`, `header.jsx` → `src/app/AppShell.tsx`, `src/app/Header.tsx`
  - `views/dashboard.jsx` → `src/features/dashboard/DashboardPage.tsx`
  - `views/evidence.jsx`, `views/workspace.jsx` → `src/features/evidence/EvidencePage.tsx`, `src/features/workspace/WorkspacePage.tsx` (still stubs)
  - `views/peopleLocations.jsx`, `views/timeline.jsx` → replaced by the new feature folders `src/features/people-locations/` and `src/features/timeline/`
  - `elements.jsx` (one big file) → split into one file per component in `src/components/` (+ `index.ts` barrel). `HowToItem` moved to `features/dashboard/` because only the Dashboard uses it.
  - The uncommitted `PeopleCardImage(dateString: string)` from `elements.jsx` was broken (a component gets one props object, not a string) → now `features/people-locations/PersonAvatar.tsx` with props `{ src, name }`.
- All `.jsx` → `.tsx`, every component has an explicit props interface.
- Data loading moved out of the Dashboard into `src/data/loadCaseData.ts` (fetch all JSON once, store it in the shared `state` from `data.ts`, cache the promise) and `src/data/useCaseData.ts` (hook returning `{ loading, error }`). `src/app/LoadingGate.tsx` wraps the `<Outlet />` in the shell, so every page can assume the data is loaded. Before this, only the Dashboard fetched data, so opening `/react/timeline` directly would have shown nothing.
- `Header.tsx`: `class` → `className`, logo is imported (`import logo from "../assets/logo.svg"`) instead of the hard-coded `/src/assets/...` path, nav buttons are `NavLink`s (active one is highlighted).
- `AppShell.tsx`: removed the hard-coded `<section id="view-dashboard">` that wrapped every page. Each page now renders its own section through the shared `ViewSection` component.
- `RouteButton` renders a real `<Link>` (an `<a>`) instead of a `<button>` with `navigate()`, so middle-click, "open in new tab" and copying the link work.
- Deleted `src/counter.ts` (unused leftover from the Vite template).
- `styles.css`: small block at the end so links look like the old buttons (`a.btn`, `a.nav-btn`, `a.tab-btn`, `a.evidence-link-btn`) and styles for the key demo.

---

## Demo 1 — JSX, function components, typed props, composition & children

**Tasks**

- Typed components (examples): `PersonCard` (`PersonCardProps { person: PersonRecord; evidenceCount: number }`), `LocationCard` (`{ location: LocationRecord }`), `TimelineEventCard` (`{ event: TimelineEvent; people: PersonRecord[]; locationNames: string[] }`), `TimelineFilterBar`, `PersonAvatar`, `StatusBadge`. Domain types come from `types/domain.ts`.
- `children` components: `components/Card.tsx` (card frame for people and locations, used in `PersonCard` and `LocationCard`), `components/Panel.tsx`, `components/ViewSection.tsx` (frame for every page), `app/LoadingGate.tsx`.

**Questions**

- **JS expression in JSX:** `TimelineEventCard.tsx`: `{locationNames.join(", ")}` and `{formatDate(event.time)}`. In `PersonCard.tsx` the computed `evidenceLabel` string. `{...}` must contain an **expression** (something that produces a value): variables, function calls, ternaries, `&&`, `.map(...)`. Statements are not allowed: no `if`, `for`, `const x = ...`. Plain objects can't be rendered as children (React throws "Objects are not valid as a React child"). `null`, `undefined`, `true` and `false` render nothing.
- **Type error demo:** in `features/people-locations/PeoplePage.tsx` → `PersonList.tsx`, change `<PersonCard key={person.id} person={person} evidenceCount={evidenceCount} />` to `evidenceCount="3"` or drop the `person` prop. `npx tsc --noEmit` (and the editor) reports *Type 'string' is not assignable to type 'number'* or *Property 'person' is missing*. Passing a `LocationRecord` as `person` fails because `name`, `role`, `avatar` etc. are missing. Without types, the card would render "undefined" or crash only at runtime.
- **Named prop vs `children`:** a named prop is *data* the component knows how to render (e.g. `person`, `status`). `children` is *already-rendered JSX* the component only places somewhere without understanding it. `Card` and `Panel` use `children` because their only job is the frame. They don't care whether a person, a location or a "not found" message goes inside, so they can be reused for anything without new props.
- **Why direct DOM manipulation conflicts with React:** React assumes **it owns the DOM below the root**. It keeps its own description of the UI (the virtual DOM / fiber tree) and changes the real DOM only through diffing. If code changes the DOM behind React's back (`innerHTML`, `classList.add`, `appendChild`), React's picture no longer matches reality. On the next render it either overwrites the change (e.g. a class we added gets removed) or patches nodes that no longer exist or have moved, and the UI and the data drift apart. Instead, UI = f(data): to change something, change the data and let React render.

---

## Demo 2 — Conditional rendering

**Tasks / techniques used**

| Where | What | Technique |
| --- | --- | --- |
| `timeline/TimelineList.tsx` | "No timeline events match the current filters." | ternary |
| `timeline/TimelineEventCard.tsx` | Location line only when there are locations | `&&` (with a boolean) |
| `timeline/certainty.ts` + `TimelineEventCard` | certainty → badge colour (confirmed = green, contradictory = red, ...) | lookup table / mapping function |
| `components/StatusBadge.tsx` | status → badge colour | lookup table |
| `people-locations/TeamTabs.tsx`, `app/Header.tsx` | active tab / nav item | `NavLink` className callback (`isActive ? ... : ...`) |
| `people-locations/PersonDetailPage.tsx` | unknown person id | early return |
| `app/LoadingGate.tsx` | loading / error / content | two early returns |
| `people-locations/PersonCard.tsx` | evidence-count badge variant | ternary inside a prop |

Ternary when there are two real alternatives (list vs. empty message). `&&` when there is "something or nothing". Early return when the rest of the component can't run without the data (`person.name` would crash). Lookup table when one value maps to many cases (replaces the `if` chain of `certaintyBadgeClass()` in the vanilla `views/timeline.ts`).

**Questions**

- **`&&` vs ternary, and the `0` problem:** `TimelineEventCard.tsx`: `{hasLocations && <p className="evidence-meta">Location: ...</p>}`. If I had written `{locationNames.length && <p>...</p>}`, an event with no locations gives `0 && ...` → `0`, and React **renders the number 0** on the page (only `false`, `null`, `undefined` render nothing). That's why I compare first: `const hasLocations = locationNames.length > 0`, which is a real boolean, so the risk does not apply to my code.
- **`null` vs empty `<div>`:** `null` puts nothing in the DOM. An empty `<div>` is still a real element: it can take up space through CSS (padding, margins, grid cells, the `::before` dot in the timeline), it shows up in `:empty`/`:nth-child` selectors and adds a pointless node. I use `null` in the ternaries of `Panel`, `IntroCard` and `MiniListItem` (`{title ? <h3>{title}</h3> : null}`). An empty `<div>` would add an extra block between heading and content.

---

## Demo 3 — Rendering collections

**Tasks**

- People: `PersonList.tsx` → `items.map(... <PersonCard key={person.id} .../>)`
- Locations: `LocationsPage.tsx` → `state.allLocations.map(location => <LocationCard key={location.id} .../>)`
- Timeline: `TimelineList.tsx` → `items.map(item => <TimelineEventCard key={item.event.id} .../>)`
- Inner lists too: responsibilities, `contains`, person chips, evidence ids, `<option>`s in the filter bar.

**Question — what does React use `key` for?** When re-rendering a list, React has to match each new child to a child from the last render. Without keys it can only match by position. With keys it matches by identity: same key = same component instance, so it keeps the DOM node **and its state** (input values, focus, `useState`) and only updates the changed props. New key = mount a new one, missing key = unmount. It also lets React *move* existing DOM nodes when the order changes instead of rewriting their content. Keys only have to be unique among siblings.

---

## Demo 4 — Stable keys and list identity

**Task:** `features/timeline/KeyIndexDemo.tsx`, open `/react/timeline/key-demo`.

1. With `key={index}` (default): type "NOTE FOR T01" into the input next to **T01** (first row).
2. Click "Reverse order" → the list is now T05…T01, but the note is still in the **first row, now next to T05**. Wrong.
3. Click "Switch to key=id", type the note at T01 again, click "Reverse order" → the note moves with T01 to the bottom. Correct.

Order and key mode are query parameters, so the demo needs no `useState`. I checked both runs in the browser.

**Questions**

- **What goes wrong:**
  - *Index keys + reorder/filter:* React matches by position, so row 0's DOM and state are reused for whatever item is now at index 0. Text you typed, focus, checkboxes, open/closed state and running animations stay with the position, not the item (exactly what the demo shows). Filtering also shifts every item after the removed one, so React updates all of them instead of removing one.
  - *Missing keys:* React falls back to index matching (same problems) and logs a warning.
  - *Duplicate keys:* two children claim the same identity. React warns, and items can be duplicated, dropped or receive the wrong state after an update.
- **The vanilla bug (index as identifier):** `views/workspace.ts` → `renderNotesList()` gives each note element `id="noteText-" + entry.index`, where `index` is the position in `state.allEvidence`, not the evidence id. If the order of `allEvidence` changes, the same id points to a different evidence item. Ported to React as `key={index}` on the notes list, it **would cause a visible symptom, not only a warning**, as soon as the rows have their own state. In Exercise 5 the notes become editable (inputs, an edit mode, `useState`), and after a reorder or after deleting a note, the typed or edited text would appear under the wrong evidence item, like in the demo. A purely static list with index keys "only" re-renders more than needed and looks fine, which is why this bug is easy to miss.
- **Legitimate `key={index}`:** when the list is **static**: never reordered, filtered or inserted into in the middle, items have no own state, and there is no natural id. Example: the `responsibilities` strings of a person. (I used the string itself as the key there, since they are unique, but index would also be acceptable.) Another case is skeleton/placeholder rows. For people, locations and timeline events we always have real ids, so I always use them.

---

## Demo 5 — Presentational vs. feature components

**Classification**

| Component | Type | Why |
| --- | --- | --- |
| `Button`, `RouteButton`, `Panel`, `Card`, `IntroCard`, `StatCard`, `StatusBadge`, `MiniListItem`, `H2Text`, `NormalText`, `ViewSection` | presentational | only props → markup |
| `HowToItem`, `PersonAvatar`, `PersonCard`, `PersonList`, `LocationCard`, `TimelineEventCard`, `TimelineList`, `TimelineFilterBar`, `TeamTabs` | presentational | only props (TeamTabs/RouteButton know about routes but hold no data) |
| `DashboardPage`, `PeoplePage`, `LocationsPage`, `PersonDetailPage`, `TimelinePage`, `KeyIndexDemo` | feature | read `state`, the URL (`useParams`, `useSearchParams`) or derive values |
| `AppShell`, `TeamLayout` | layout / feature | define the page frame and where child routes go (`<Outlet />`) |
| `LoadingGate` | feature | triggers data loading, decides loading/error/content |
| `Header` | presentational-ish | static nav list, active state comes from the router |

**Split components**

1. **Timeline:** before, one component would have read the data, read `?person=`, resolved person and location ids to names, filtered, sorted *and* rendered the cards. Now:
   - `TimelinePage` (feature): *which* events to show: reads `state` and the query param, filters, sorts, resolves ids → `TimelineListItem[]`.
   - `TimelineList` + `TimelineEventCard` (presentational): *how* they look: list, empty state, card markup.
2. **People:** `PeoplePage` (feature: computes the evidence count per person with `evidenceMentionsPerson`) → `PersonList` / `PersonCard` (presentational). The vanilla `renderPeople()` did both in one function and even attached click handlers.
3. **Data loading** moved out of the Dashboard into `data/` + `LoadingGate`, so the Dashboard only renders.

**Questions**

- **Single responsibility after the split:** `TimelinePage` decides *what* is on the timeline, `TimelineList`/`TimelineEventCard` decide *what it looks like*. They only share the `TimelineListItem` type. If I change how the data is filtered (e.g. a real filter in Exercise 5, or data from an API), `TimelineList` doesn't change because it still gets a list of items. If I change the card design, `TimelinePage` doesn't change. The only coupling is the props type, and TypeScript tells me if that changes.
- **Rule:** *If it needs to know where data comes from (global state, URL, fetch, localStorage) or computes something from it, it's a feature component. If it can be rendered with hard-coded props in isolation (e.g. in a test or Storybook), it's presentational.*

---

## Demo 6 — Feature-oriented folder structure

**Tasks:** see section 0 and `ARCHITECTURE.md` (structure, rules, route table). Dashboard and shell are included (`features/dashboard/`, `app/`).

**Questions**

- **By type vs. by feature:** by type = `components/`, `hooks/`, `pages/`, `utils/` — everything for the Timeline is spread over four folders. By feature = everything for one view is in one folder, and only truly shared things go into `components/`/`data/`. For this app the features map 1:1 to the five views, and the migration happens **view by view** (Ex 3: Dashboard, Ex 4: People + Timeline, Ex 5: Evidence + Workspace). With feature folders, each exercise mostly adds a new folder, and it's clear which code belongs to which (still vanilla) view. Deleting or rewriting a feature means deleting one folder.
- **Line between shared and feature-local:** used by ≥ 2 features → shared. Examples:
  - *shared:* `components/StatusBadge.tsx`, used by Dashboard (evidence status), Timeline (certainty) and People (evidence count). Also `Card`, `Panel`, `ViewSection`.
  - *feature-local:* `features/dashboard/HowToItem.tsx` (only on the Dashboard), `features/timeline/certainty.ts` (only the Timeline knows about certainty), `PersonCard` (used twice, but both uses are inside people-locations).

---

## Demo 7 — Reusable UI elements

**Task:** `components/StatusBadge.tsx` (props `{ status: string; variant?: BadgeVariant }`) and `components/Card.tsx` (props `{ kind: "person" | "location"; children }`).

**Questions**

- **Where used, what varies:**
  - `StatusBadge`
    - Dashboard: case status + status of each recent evidence item → `<StatusBadge status={item.status} />` (variant derived from the text).
    - Timeline: `<StatusBadge status={event.certainty} variant={certaintyBadgeVariant(event.certainty)} />` (variant given explicitly, because "confirmed" should be green although it isn't a status).
    - People: `<StatusBadge status="4 related evidence items" variant="relevant" />`.
    - *Varies:* the text and the colour variant. *Fixed:* the markup (`<span class="badge badge-…">`) and the list of allowed variants (`BadgeVariant` union, so you can't pass a colour that has no CSS). I made `variant` optional: the common case (a status) needs one prop, special cases pass a variant. That avoids special cases inside the badge like `if (isTimeline) …`.
  - `Card`: `PersonCard` and `LocationCard` (and the person detail page through `PersonCard`). *Varies:* the kind (CSS class) and the whole content (`children`). *Fixed:* the frame.
- **Compared to copy-pasted template strings:** in the vanilla app the badge markup is written by hand in `views/evidence.ts` (`renderEvidenceCardHTML`), in `views/timeline.ts` (certainty badge) and in the dashboard, each with its own helper (`getStatusBadgeClass`, `getRelevanceBadgeClass`, `certaintyBadgeClass`). The card frames are written out separately in `renderPeople()` and `renderLocations()`. The mini-list markup appears twice in `views/workspace.ts` (bookmarks and notes). A component gives you **one source of truth** (change it once, all uses change), **a typed interface** (the compiler checks every use; a typo in a class string only shows up visually), **escaping** for free (React escapes text, while string concatenation is an XSS risk) and **composition** (you can pass JSX/children into it, not only strings).

---

## Demo 8 — Routing: People & Locations as real routes

**Tasks**

- Router: **react-router-dom** (already installed in Ex 3). It's the de facto standard for React SPAs, supports nested routes with layouts (`<Outlet />`), route params, query params and `NavLink` active states, which covers everything this exercise needs. It also works client-side only, so we don't need a framework like Next.js.
- Routes in `src/App.tsx` (table in `ARCHITECTURE.md`): Dashboard, Evidence, Team (People/Locations + detail), Timeline, Workspace, catch-all.
- People/Locations tab: `features/people-locations/TeamLayout.tsx` is the parent route `/team` (heading + `TeamTabs`), `/team/people` and `/team/locations` are child routes rendered in its `<Outlet />`. The tabs are `NavLink`s, so the active tab comes **from the URL**. There's no `currentPeopleTab` variable any more. `/team` redirects to `/team/people`.

**Questions**

- **Why a real route matters:** the user can **bookmark or share a link** to the locations tab (`/react/team/locations`), **reload** without being thrown back to the People tab, use the **back/forward buttons** between tabs, and open a tab in a **new browser tab**. In the vanilla version `switchPeopleTab()` only toggled CSS classes, so the URL never changed.
- **Unknown URL:** the last route is `path="*"` → `app/NotFoundPage.tsx`. It shows "Page not found", the path that was requested, and a button back to the dashboard, inside the normal shell (header and nav stay). The vanilla `handleHashChange()` **silently fell back to the dashboard** for an invalid hash, so the user saw the dashboard and couldn't tell that the link was wrong. Now the URL stays as typed and the user gets a clear message. The only "fallbacks" left are intended redirects: `/` → `/dashboard` and `/team` → `/team/people`.

---

## Demo 9 — Route parameters

**Tasks**

- Route `team/people/:personId` → `features/people-locations/PersonDetailPage.tsx`, e.g. `/react/team/people/nova-byte`.
- Links to it: the name in every `PersonCard` (`<Link to={`/team/people/${person.id}`}>`) and the person chips on each timeline event (`TimelineEventCard.tsx`).

**Questions**

- **Reading the param, its type, safety:** `const { personId } = useParams<{ personId: string }>();`. The type is **`string | undefined`**: React Router makes every param optional, because the same component could be rendered by a route without that param. It's also only a *string*. Nothing guarantees it is a real person id. So I:
  1. check for `undefined` (`personId ? findPersonById(personId) : null`),
  2. look it up with `findPersonById` from `lookupHelpers.ts`, which returns `PersonRecord | null`,
  3. **return early** with a "Person not found" panel and a link back if it's `null` (try `/react/team/people/xyz`). After that, TypeScript knows `person` is a `PersonRecord`.
- **Route param vs query param:** `/team/people/nova-byte` says *which resource this page is*. The person is the page, and without it the page doesn't exist. `?person=nova-byte` is an *optional modifier* of a page that exists without it (a filter, sort or search). For the person detail page the route param fits: it's a separate page for one person, with a clean URL that can be bookmarked. For the Timeline the query param fits (Demo 10), because `/timeline` without a person is still the full timeline, and the filter could be combined with others (`?person=…&location=…`).

---

## Demo 10 — Query parameters as URL state + wrap-up

**Tasks**

- `features/timeline/TimelinePage.tsx` reads `?person=` with `useSearchParams()` during render:
  - unknown or missing id → no filter (all events),
  - valid id → only that person's events, and the person `<select>` is pre-selected (`defaultValue={initialPersonId}`).
  - Try `/react/timeline?person=patch-vector` (2 events, "Patch Vector" selected). The person detail page has a "See … on the timeline" button that links there.
- The selects in `TimelineFilterBar.tsx` are **uncontrolled** (`defaultValue`, no `onChange`): you can change them, but nothing filters. That's intended for this exercise.
- `key={personFilter}` on `TimelineFilterBar`: if the URL changes while the page stays mounted (e.g. a link from `?person=a` to `?person=b`), the key changes and the bar remounts with the new `defaultValue`. Without it, the select would keep showing the old person.
- **Final check:** Dashboard, People & Locations, Timeline are fully React. `grep -rn "innerHTML\|createElement\|appendChild\|classList" src/` → no results. All views can be opened directly by URL (also after a reload): `/react/dashboard`, `/react/team/people`, `/react/team/locations`, `/react/team/people/<id>`, `/react/timeline?person=<id>`. `npx tsc --noEmit`, `npm run lint` and `vite build` pass.

**Questions**

- **Why reading a query param once is still OK:** the component holds no state of its own. The list is a **pure function of (data, URL)**, computed again on every render, just like rendering a prop. The URL is input, the same way a route param is. The user changes it by *navigating*, which is the router's job, not by interacting with the component. It crosses the line when the **component itself has to remember something that changes after the first render**: e.g. `onChange` on the selects updating `useState`, a controlled `value={…}`, or writing the selection back to the URL with `setSearchParams`. That's Exercise 5.
- **What's needed for real filtering:** **state + event handlers**: either `useState` for each filter (controlled `<select value={…} onChange={…}>`) and deriving the filtered list from it during render, or, so the URL stays the source of truth, `setSearchParams` in the `onChange` handler. Either way, the filter values become state that triggers a re-render, and the list is still computed during render (no copy of the filtered list stored in state).
- **Duplication not extracted yet:**
  - The lookup of people for an event and the evidence count per person (`state.allEvidence.filter(item => evidenceMentionsPerson(item, person)).length`) are computed in both `PeoplePage.tsx` and `PersonDetailPage.tsx`. In `TimelinePage.tsx` the `toListItem` mapping does a similar lookup. A small selector module (`features/people-locations/selectors.ts` or `data/selectors.ts`) would remove that.
  - The dashboard's "recent" `MiniListItem` lists and the person chips/evidence chips are similar "chip lists".

  I didn't extract them because each currently has only one or two uses with slightly different needs, and Exercise 5 will change how data is accessed (state/reducer instead of reading the global `state` object). Extracting now would mean designing the abstraction twice. With more time, and once Evidence/Workspace also need these counts, I would extract the selectors first, because they are logic (easy to test) rather than markup.
