# Exercise 4 — React UI & Component Design: Answers

**How to run it:** `npm run dev`, then open `http://localhost:5173/react/`.
The vanilla app still runs at `http://localhost:5173/` (useful for comparing).

**Where things are:** all React code is in `src/`. The folder rules and the route table are in
`ARCHITECTURE.md`.

**Book chapters:** Ch. 15 (React Foundations) and Ch. 16 (Component Design and Routing). The section
numbers in the answers (e.g. *15.8*) point to the matching parts of the manuscript.

---

## Overview: what changed in this exercise

| Before (Exercise 3) | After (Exercise 4) |
| --- | --- |
| Flat files: `appShell.tsx`, `header.jsx`, `views/*.jsx`, one big `elements.jsx` | Feature folders: `src/app/`, `src/components/`, `src/data/`, `src/features/<view>/` |
| `.jsx` files, partly untyped | Only `.tsx`, every component has a props `interface` |
| Only the Dashboard loaded data | `src/data/loadCaseData.ts` + `useCaseData.ts` load everything once. `app/LoadingGate.tsx` shows the page only when data is ready, so every URL works directly |
| Nav buttons with `navigate()` | `NavLink`s (real `<a>` links, active one highlighted) |
| People & Locations, Timeline not in React | Fully in React, with real routes |
| `/team` tab switching via `switchPeopleTab()` (vanilla) | `/team/people` and `/team/locations` are routes |

```
src/
  App.tsx                 route table
  app/                    shell, used once: AppShell, Header, LoadingGate, NotFoundPage
  components/             shared presentational UI (props only)
  data/                   data loading shared by all features
  features/
    dashboard/            DashboardPage, HowToItem
    people-locations/     TeamLayout, TeamTabs, PeoplePage, PersonList, PersonCard,
                          PersonAvatar, PersonDetailPage, LocationsPage, LocationCard
    timeline/             TimelinePage, TimelineFilterBar, TimelineList,
                          TimelineEventCard, certainty.ts, KeyIndexDemo
    evidence/, workspace/ stubs (Exercise 5)
```

> **Known leftover:** `src/elements.jsx` (the old Exercise 3 file) is still in the repo. Nothing
> imports it, but it contains TypeScript syntax in a `.jsx` file, so `tsc --noEmit` (and therefore
> `npm run build`) currently fails on it. Delete it before presenting: `git rm src/elements.jsx`.

---

## Demo 1 — JSX, function components, typed props, composition & children

### What I built

**Typed components** (more than the required 3). Domain types come from `types/domain.ts`:

| Component | Props |
| --- | --- |
| `features/people-locations/PersonCard.tsx` | `{ person: PersonRecord; evidenceCount: number }` |
| `features/people-locations/LocationCard.tsx` | `{ location: LocationRecord }` |
| `features/people-locations/PersonAvatar.tsx` | `{ src: string; name: string }` |
| `features/timeline/TimelineEventCard.tsx` | `{ event: TimelineEvent; people: PersonRecord[]; locationNames: string[] }` |
| `features/timeline/TimelineFilterBar.tsx` | `{ people; locations; eventTypes: string[]; initialPersonId: string }` |
| `components/StatusBadge.tsx` | `{ status: string; variant?: BadgeVariant }` |

**Components with `children`:**

- `components/Card.tsx`: the frame of each person and location card (used in `PersonCard` and `LocationCard`).
- `components/Panel.tsx`: box with an optional heading (Dashboard, "not found" pages, key demo).
- `components/ViewSection.tsx`: the outer `<section>` + page heading of every page.
- `app/LoadingGate.tsx`: wraps the `<Outlet />` and shows the children only when data is loaded.

```tsx
// components/Card.tsx
export interface CardProps {
  kind: CardKind;          // "person" | "location"
  children: ReactNode;
}

export function Card({ kind, children }: CardProps) {
  return <div className={`${kind}-card`}>{children}</div>;
}
```

### Q: Show a JSX expression that embeds a JS value. What can and can't go inside `{...}`?

`features/timeline/TimelineEventCard.tsx`:

```tsx
<div className={`timeline-event certainty-${event.certainty}`}>   {/* computed class */}
  {formatDate(event.time)}                                         {/* function call */}
  ...
  {hasLocations && <p>Location: {locationNames.join(", ")}</p>}    {/* condition + method call */}
```

and in `PersonCard.tsx` the computed label:

```tsx
const evidenceLabel = `${evidenceCount} related evidence item${evidenceCount === 1 ? "" : "s"}`;
```

**Rule (book 15.3):** `{...}` takes exactly one **expression**, i.e. something that produces a value.

- **Allowed:** variables, property access, function calls, template strings, math, ternaries
  (`a ? b : c`), `&&`, `.map(...)`, other JSX.
- **Not allowed:** statements such as `if`, `for`, `switch`, `const x = ...`. They don't produce a
  value, so they go *above* the `return` or into a helper function.
- **Rendering rules:** strings and numbers are shown as text. `null`, `undefined`, `true`, `false`
  show nothing. A plain object (e.g. `{person}`) crashes with *"Objects are not valid as a React child"*.

### Q: What would TypeScript catch if you passed the wrong shape? (live demo)

In `features/people-locations/PersonList.tsx`, change the line

```tsx
<PersonCard key={person.id} person={person} evidenceCount={evidenceCount} />
```

to one of these and run `npx tsc --noEmit` (or just look at the red line in VS Code):

| Wrong call | TypeScript error (real output) |
| --- | --- |
| `evidenceCount="3"` | `Type 'string' is not assignable to type 'number'.` |
| leave out `person` | `Property 'person' is missing in type '{ evidenceCount: number; }' but required in type 'PersonCardProps'.` |
| `person={location}` | `Type 'LocationRecord' is missing the following properties from type 'PersonRecord': role, speciality, responsibilities, statement, and 2 more.` |
| `persn={person}` (typo) | `Property 'persn' does not exist on type 'IntrinsicAttributes & PersonCardProps'. Did you mean 'person'?` |

> **Careful:** while `src/elements.jsx` still exists, `npx tsc --noEmit` stops at that file's syntax
> errors and shows **no** type errors at all. Delete it first, or show the red underline in VS Code
> (the editor checks each file on its own).

Without types, all of these would only show up at runtime as "undefined" on the page or as a crash.
With types they are caught **at the call site, before the app runs** (book 15.5).

### Q: Named prop vs. `children` — why `children` for Card/Panel?

- A **named prop** is *data the component understands* and renders itself, e.g. `person` in
  `PersonCard`. The component decides how it looks.
- **`children`** is *finished JSX from the caller*. The component doesn't know what it is, it only
  decides *where* it goes (inside the frame).

`Card` and `Panel` only provide a frame. A person, a location or a "Person not found" message all go
into the same frame. With `children` I can reuse them for any content without adding new props each
time. If `Card` took `person` and `location` props, it would need an `if` for every new kind of
content. Book 15.5: *"Use named props for a specific data contract, `children` for a layout or
wrapper around arbitrary content."*

### Q: Why does direct DOM manipulation conflict with React? Who "owns" the DOM?

**React assumes it owns every DOM node below its root** (`<div id="root">`, book 15.8).

How React works (book 15.7): on every render it builds a new *description* of the UI (React
elements), compares it to the previous description (reconciliation) and then changes **only** the
DOM nodes that differ (commit). It never reads the real DOM to find out what's there. It trusts its
own previous description.

If code changes the DOM behind React's back (`innerHTML`, `classList.add`, `appendChild`, as the
vanilla `app.js`/`navigation.ts` did everywhere):

- React's description no longer matches the real DOM.
- On the next render React **overwrites** the manual change (e.g. a class we added disappears), or
- it tries to update nodes that were replaced or moved, and the UI and the data drift apart.

In React the UI is a function of the data: to change the screen, change the data and let React
render. I checked: `grep -rn "innerHTML\|createElement\|appendChild\|classList" src/` finds nothing.

---

## Demo 2 — Conditional rendering

### What I built (several cases, four techniques)

| Where | What is conditional | Technique |
| --- | --- | --- |
| `timeline/TimelineList.tsx` | list **or** "No timeline events match the current filters." | ternary |
| `timeline/TimelineEventCard.tsx` | "Location: ..." line only if the event has locations | `&&` |
| `timeline/certainty.ts` | certainty → badge colour (confirmed = green, contradictory = red, reported = yellow) | lookup table |
| `components/StatusBadge.tsx` | status text → badge colour | lookup table |
| `people-locations/TeamTabs.tsx`, `app/Header.tsx` | active tab / nav item gets `active` class | `NavLink` callback with ternary |
| `people-locations/PersonDetailPage.tsx` | unknown person id → "Person not found" | early return |
| `app/LoadingGate.tsx` | loading / error / content | two early returns |
| `people-locations/PersonCard.tsx` | badge colour: `evidenceCount > 0 ? "relevant" : "unreviewed"` | ternary in a prop |

Try the empty state: there is no URL that makes the list empty yet (unknown `?person=` ids fall back
to "all"). The empty message will matter in Exercise 5 when the filters work.

### Which technique where, and why (book 16.1)

- **Ternary** when there are **two real alternatives** (list *or* empty message, green *or* grey badge).
- **`&&`** when it's **"something or nothing"** (location line).
- **Early return** when the **whole component can't continue** without the data. In
  `PersonDetailPage`, everything after the check uses `person.name`, which would crash on `null`.
  After the `if`, TypeScript also knows `person` is not `null`.
- **Lookup table** when **one value maps to many cases**. It replaces the `if/else` chain of
  `certaintyBadgeClass()` in the vanilla `views/timeline.ts`:

```ts
// features/timeline/certainty.ts
const CERTAINTY_VARIANTS: Record<string, BadgeVariant> = {
  confirmed: "reviewed",
  contradictory: "critical",
  reported: "flagged",
};
export function certaintyBadgeVariant(certainty: string): BadgeVariant {
  return CERTAINTY_VARIANTS[certainty] ?? "unreviewed";
}
```

### Q: Where did you use `condition && <Component />`? What if `condition` were `0`?

`features/timeline/TimelineEventCard.tsx`:

```tsx
const hasLocations = locationNames.length > 0;   // a real boolean
...
{hasLocations && <p className="evidence-meta">Location: {locationNames.join(", ")}</p>}
```

**The `0` problem:** `&&` returns the left side if it is falsy. If I had written
`{locationNames.length && <p>...</p>}` and an event had no locations, the expression would be
`0 && ...` → `0`. React renders numbers, so a **"0" would appear on the page**. Only `false`, `null`
and `undefined` render nothing.

**Does it apply to my code?** No. I compare first (`length > 0`), so the left side is always `true`
or `false`. The book recommends exactly this (16.1.3: *"write `count > 0 && ...` when zero is
possible"*).

### Q: Why return `null` instead of an empty `<div>`? Did you use either?

- `null` puts **nothing** into the DOM.
- An empty `<div>` is still a real element. It can take up space through CSS (padding, margins, a
  grid cell, the `::before` dot on timeline items), it counts in CSS selectors like `:nth-child`, and
  it's a pointless extra node (book 16.1).

I use `null` in `Panel`, `IntroCard`, `MiniListItem` and `HowToItem`:

```tsx
// components/Panel.tsx
{title ? <h3>{title}</h3> : null}
```

When a panel has no title, there is simply no heading. An empty `<div>` there would add an extra
block between the frame and the content.

---

## Demo 3 — Rendering collections

### What I built

| List | File | Key |
| --- | --- | --- |
| People | `people-locations/PersonList.tsx` | `key={person.id}` |
| Locations | `people-locations/LocationsPage.tsx` | `key={location.id}` |
| Timeline events | `timeline/TimelineList.tsx` | `key={item.event.id}` |
| Inner lists | responsibilities, `contains`, person chips, evidence ids, `<option>`s | the item itself or its id |

```tsx
// features/people-locations/PersonList.tsx
{items.map(({ person, evidenceCount }) => (
  <PersonCard key={person.id} person={person} evidenceCount={evidenceCount} />
))}
```

### Q: What does React actually use `key` for internally?

When a list renders again, React has to decide for each new child: *"Is this the same item as one
from last time?"* (reconciliation, book 15.7 / 16.2).

- **Without keys** React can only match by **position** (1st with 1st, 2nd with 2nd, ...).
- **With keys** React matches by **identity**:
  - same key as before → **same component instance**: React keeps the DOM node **and its state**
    (typed text, focus, `useState`) and only updates the props that changed,
  - new key → mount a new component,
  - key gone → unmount that component,
  - same keys in a new order → React **moves** the existing DOM nodes instead of rewriting their content.

Keys only need to be unique **among siblings**, not in the whole app. The key is not passed to the
component as a prop.

---

## Demo 4 — Stable keys and list identity

### What I built: `features/timeline/KeyIndexDemo.tsx` → open `/react/timeline/key-demo`

The demo shows the first 5 timeline events, each with a text input. The order (`?order=`) and the
key mode (`?keys=`) are in the URL, so no `useState` is needed.

```tsx
{events.map((event, index) => (
  <div key={keyMode === "index" ? index : event.id} className="key-demo-row">
    <strong>{event.id}</strong>
    <span>{event.title}</span>
    <input type="text" placeholder="note…" defaultValue="" />
  </div>
))}
```

**Demo steps:**

1. Page starts with `key={index}`. Type **"NOTE FOR T01"** into the input of the first row (T01).
2. Click **"Reverse order"**. The rows are now T05 … T01, but the note is still in the **first row,
   next to T05**. ❌ Wrong.
3. Click **"Switch to key=id"**, type the note at T01 again, click **"Reverse order"**. The note moves
   with T01 to the bottom. ✅ Correct.

**Why:** the text in an `<input>` belongs to the DOM node. With `key={index}`, the first row has key
`0` before and after reversing, so React keeps the first DOM node (with the typed text) and only
changes the id and title next to it. With `key={event.id}`, React sees that `T01` moved and moves its
DOM node, including the input.

### Q: What goes wrong with missing, duplicated or index-based keys?

- **Index keys + reorder/filter:** React reuses the DOM node and state of position 0 for whatever item
  is now at position 0. Typed text, focus, checkboxes, open/closed state stay with the *position*, not
  the *item* (what the demo shows). Book 16.2: *"Position is not identity."* With filtering, every item
  after the removed one shifts, so React updates all of them instead of just removing one.
- **Missing keys:** React uses the index anyway (same problems) and logs a console warning.
- **Duplicate keys:** two items claim the same identity. React warns, and after an update items can be
  shown twice, disappear, or get the wrong state.

### Q: The vanilla app's index bug — would `key={index}` in React cause a visible symptom?

**The bug:** `views/workspace.ts` → `renderNotesList()` builds each note element with
`id="noteText-" + entry.index`. `index` is the position in `state.allEvidence`, not the evidence id.
If that array changes order (or an item is removed), the same DOM id points to a different evidence item.

```ts
noteEntries.push({ index: i, evidenceId: state.allEvidence[i].id, ... });
html += '<div id="noteText-' + entry.index + '">' + entry.text + "</div></div>";
```

**Ported as `key={index}`:**

- As long as the notes list is **only static text**, there is **no visible symptom**: React updates
  the text of each row to the new item, so it looks correct. You only get a bit more re-rendering, and
  not even a warning (React only warns about *missing* keys, not index keys).
- As soon as the rows have **their own state** (which they will in Exercise 5: editable notes, inputs,
  edit mode), it becomes **visible**: after a reorder or a deleted note, typed or edited text shows up
  under the **wrong evidence item**, exactly like the demo.

So: a time bomb. Invisible now, a real user-facing bug once the list gets interactive. That's why it's
easy to miss.

### Q: All data has stable ids. Is `key={index}` ever OK?

Yes, when **all** of these are true (book 16.2):

- the list is **static**: never reordered, filtered, or inserted into in the middle,
- the items have **no own state** (no inputs, no `useState`),
- there is **no natural id**.

Examples: a person's `responsibilities` (a fixed list of strings, I used the string itself as key since
they are unique, but index would be fine too), or placeholder/skeleton rows while loading. For people,
locations and timeline events we have real ids, so I always use them.

---

## Demo 5 — Presentational vs. feature components

### Classification of every component

Definition (book 16.3): **presentational** = gets data and callbacks through props and only renders.
**Feature** = knows the use case, reads data, owns state, reads the URL, or turns data into props.

| Component | Type | Why |
| --- | --- | --- |
| `Button`, `RouteButton`, `Panel`, `Card`, `IntroCard`, `StatCard`, `StatusBadge`, `MiniListItem`, `H2Text`, `NormalText`, `ViewSection` | presentational | only props → markup |
| `HowToItem`, `PersonAvatar`, `PersonCard`, `PersonList`, `LocationCard`, `TimelineEventCard`, `TimelineList`, `TimelineFilterBar` | presentational | only props → markup |
| `TeamTabs`, `Header` | presentational | fixed list of links, the active state comes from the router, no data |
| `DashboardPage`, `PeoplePage`, `LocationsPage`, `PersonDetailPage`, `TimelinePage`, `KeyIndexDemo` | feature | read the global `state` and/or the URL (`useParams`, `useSearchParams`) and compute values |
| `AppShell`, `TeamLayout` | layout (feature side) | decide the page frame and where child routes appear (`<Outlet />`) |
| `LoadingGate` | feature | starts loading the data and decides loading / error / content |

### Splits I made

1. **Timeline.** One component would have had to read the data, read `?person=`, look up names for
   the person/location ids, filter, sort **and** render. Now:
   - `TimelinePage` (feature): decides **which** events are shown and turns them into `TimelineListItem[]`.
   - `TimelineList` + `TimelineEventCard` (presentational): decide **how** they look (list, empty
     message, card).
2. **People.** `PeoplePage` (feature) counts the evidence per person → `PersonList` / `PersonCard`
   (presentational). The vanilla `renderPeople()` did both in one function (and wrote the HTML).
3. **Data loading** moved out of `DashboardPage` into `data/` + `LoadingGate`, so the Dashboard only
   renders.

```tsx
// TimelinePage (feature): what to show
const events = state.allTimeline
  .filter((event) => !personFilter || event.personIds.includes(personFilter))
  .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
return <TimelineList items={events.map(toListItem)} />;

// TimelineList (presentational): how it looks
export interface TimelineListItem { event: TimelineEvent; people: PersonRecord[]; locationNames: string[] }
```

### Q: Single responsibility of each half? Does a change in one affect the other?

- `TimelinePage`: **what** is on the timeline (data source, filter, order, id → name lookup).
- `TimelineList` / `TimelineEventCard`: **what it looks like**.

They are connected only by the `TimelineListItem` type.

- If I change *how events are chosen* (real filters in Exercise 5, data from an API, different sort),
  `TimelineList` doesn't change, it still gets a list of items.
- If I change *the card design*, `TimelinePage` doesn't change.
- Only a change to the props type affects both, and TypeScript then shows every place that has to be
  updated.

### Q: One concrete rule for presentational vs. feature?

> **If it has to know where data comes from (global `state`, the URL, `fetch`, `localStorage`) or
> computes something from it, it's a feature component. If I can render it with hard-coded props and
> nothing else (e.g. in a test), it's presentational.**

Example: `<PersonCard person={{...}} evidenceCount={3} />` works anywhere → presentational.
`PeoplePage` needs `state.allPeople` → feature.

---

## Demo 6 — Feature-oriented folder structure

### What I did

- Restructured `src/` into `app/`, `components/`, `data/`, `features/<view>/` (see the overview at
  the top). Dashboard (`features/dashboard/`) and the shell (`app/`) from Exercise 3 are included.
- Documented it in **`ARCHITECTURE.md`**: folder structure, rules (shared vs. local, `components/`
  never reads data, pages are called `*Page.tsx`, typed props, no DOM manipulation) and the route table.

### Q: By type vs. by feature — why this structure for this app?

- **By type:** `components/`, `hooks/`, `pages/`, `utils/`. Everything for the Timeline would be
  spread over four folders, and generic names like `List.tsx`, `Card.tsx` pile up (book 16.3).
- **By feature:** everything for one view is in one folder. Only things that are really shared go
  into `components/` or `data/`.

**Why for this app:** the features match the app's views 1:1, and the migration happens **view by
view** (Ex 3: Dashboard, Ex 4: People & Locations + Timeline, Ex 5: Evidence + Workspace). With
feature folders, each exercise mostly adds one folder, and it's obvious which code belongs to which
view. To rewrite or remove a view, I touch one folder.

### Q: Where is the line between feature-local and shared? One real example of each.

**Rule:** used by **two or more features** → `components/`. Used by one feature → stays in that
feature's folder, even if it looks reusable (book 16.3: *move to shared only once it has a genuinely
reusable contract*).

- **Shared:** `components/StatusBadge.tsx`, used by the Dashboard (case/evidence status), Timeline
  (certainty) and People (evidence count). Also `Card`, `Panel`, `ViewSection`.
- **Feature-local:**
  - `features/dashboard/HowToItem.tsx`: only the Dashboard has the "how to use" boxes.
  - `features/timeline/certainty.ts`: only the Timeline knows what "certainty" is.
  - `features/people-locations/PersonCard.tsx`: used twice (list and detail page), but both are
    inside people-locations, so it stays there. Presentational ≠ automatically shared.

---

## Demo 7 — Reusable UI elements

### What I built

- `components/StatusBadge.tsx`: props `{ status: string; variant?: BadgeVariant }`
- `components/Card.tsx`: props `{ kind: "person" | "location"; children: ReactNode }`

```tsx
export type BadgeVariant = "critical" | "reviewed" | "flagged" | "relevant" | "unreviewed";

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const resolved = variant ?? statusToVariant(status);   // explicit variant wins
  return <span className={`badge badge-${resolved}`}>{status}</span>;
}
```

### Q: Where is it used? What varies, what's fixed, and how did you decide?

**`StatusBadge`** (3 features):

| Where | Call | Variant |
| --- | --- | --- |
| Dashboard (case status, recent evidence) | `<StatusBadge status={item.status} />` | derived from the text |
| Timeline (`TimelineEventCard`) | `<StatusBadge status={event.certainty} variant={certaintyBadgeVariant(event.certainty)} />` | given explicitly: "confirmed" should be green but isn't an evidence status |
| People (`PersonCard`) | `<StatusBadge status="4 related evidence items" variant="relevant" />` | given explicitly |

- **Varies (props):** the text and the colour.
- **Fixed (inside):** the markup (`<span class="badge badge-…">`) and the **list of allowed colours**
  (the `BadgeVariant` union: you can't pass a colour that has no CSS).
- **How I drew the line:** `variant` is optional. The common case (a status) needs only one prop.
  Special cases pass the variant themselves. That way the badge needs no special cases inside like
  `if (isTimeline) ...`, it stays simple, and each feature keeps its own mapping (e.g. `certainty.ts`).

**`Card`:** used by `PersonCard` and `LocationCard` (and the detail page through `PersonCard`).
*Varies:* `kind` (CSS class) and the whole content (`children`). *Fixed:* the frame.

### Q: Compare to the vanilla app's duplicated template strings.

In the vanilla app the same markup is written by hand several times:

- badge markup in `views/evidence.ts`, `views/timeline.ts` and `views/dashboard.ts`, each with its
  own helper (`getStatusBadgeClass`, `getRelevanceBadgeClass`, `certaintyBadgeClass`),
- the card frame separately in `renderPeople()` and `renderLocations()`,
- the mini-list markup twice in `views/workspace.ts` (bookmarks and notes).

```ts
// vanilla views/timeline.ts
'&nbsp;&middot;&nbsp;<span class="badge badge-' + ... + '">' + ...
```

What a component gives me that copy-pasted strings don't:

| | Template strings | React component |
| --- | --- | --- |
| Change the design | change every copy, easy to forget one | change it once |
| Mistakes | a typo in a class name only shows up visually | TypeScript checks every use (`variant="gren"` is an error) |
| Security | string concatenation with data = XSS risk with `innerHTML` | React escapes text automatically |
| Content | only strings | any JSX via `children` |

---

## Demo 8 — Routing: People & Locations as real routes

### What I built

- **Router: `react-router-dom`** (installed in Exercise 3). Why: it's the most common router for React
  SPAs (book 16.4) and has everything this exercise needs: nested routes with a shared layout
  (`<Outlet />`), route params (`useParams`), query params (`useSearchParams`), `NavLink` with an
  active state and a catch-all route. It runs purely client-side, so no framework like Next.js is needed.
- **Routes** in `src/App.tsx` (`basename="/react"`):

```tsx
<Route element={<AppShell />}>
  <Route index element={<Navigate to="/dashboard" replace />} />
  <Route path="dashboard" element={<DashboardPage />} />
  <Route path="evidence" element={<EvidencePage />} />
  <Route path="team" element={<TeamLayout />}>
    <Route index element={<Navigate to="people" replace />} />
    <Route path="people" element={<PeoplePage />} />
    <Route path="people/:personId" element={<PersonDetailPage />} />
    <Route path="locations" element={<LocationsPage />} />
  </Route>
  <Route path="timeline" element={<TimelinePage />} />
  <Route path="timeline/key-demo" element={<KeyIndexDemo />} />
  <Route path="workspace" element={<WorkspacePage />} />
  <Route path="*" element={<NotFoundPage />} />
</Route>
```

- **People/Locations tabs:** `TeamLayout` is the parent route `/team`. It renders the heading and the
  `TeamTabs`, and the child route (`/team/people` or `/team/locations`) appears in its `<Outlet />`.
  The tabs are `NavLink`s, so the active tab comes **from the URL**. There is no `currentPeopleTab`
  variable any more. `/team` redirects to `/team/people`.

```tsx
// features/people-locations/TeamTabs.tsx
<NavLink to="/team/people" className={tabClass}>People</NavLink>
<NavLink to="/team/locations" className={tabClass}>Locations</NavLink>
```

### Q: Why does a real route matter for the user? Name a concrete capability.

In the vanilla app `switchPeopleTab()` only toggled CSS classes. The URL never changed. Now the user can:

- **bookmark or share** a link directly to the locations tab (`/react/team/locations`),
- **reload** the page and still be on Locations (before: back to People),
- use the browser's **back/forward** buttons between the tabs,
- **open a tab in a new browser tab** (middle-click), because the tabs are real `<a>` links.

### Q: What happens for an unknown URL? Compare to `handleHashChange()`.

The last route is `path="*"` → `app/NotFoundPage.tsx`. It shows "Page not found", the path that was
requested and a button back to the dashboard, inside the normal shell (header and nav stay).
Try `/react/does-not-exist`.

The vanilla `handleHashChange()` in `navigation.ts` **silently** showed the dashboard for any invalid
hash:

```ts
const normalizedHash = validViews.includes(hash) ? hash : "dashboard";
```

So a user with a broken link (e.g. `#peopel`) landed on the dashboard and couldn't tell the link was
wrong. Now the URL stays as typed and the user gets a clear message. The only redirects left are
intended ones: `/` → `/dashboard` and `/team` → `/team/people`.

---

## Demo 9 — Route parameters

### What I built

- Route **`team/people/:personId`** → `features/people-locations/PersonDetailPage.tsx`,
  e.g. `/react/team/people/nova-byte`.
- **Links to it** (not only typing the URL):
  - the name on every `PersonCard`: `<Link to={`/team/people/${person.id}`}>{person.name}</Link>`
  - the person chips on every timeline event (`TimelineEventCard.tsx`).

```tsx
// features/people-locations/PersonDetailPage.tsx
const { personId } = useParams<{ personId: string }>();   // string | undefined
const person = personId ? findPersonById(personId) : null; // PersonRecord | null

if (!person) {
  return (
    <Panel title="Person not found">
      <p>Nobody with the id <code>{personId}</code> is part of this investigation.</p>
      <RouteButton label="Back to all people" targetLocation="/team/people" size="small" />
    </Panel>
  );
}
// from here on TypeScript knows: person is a PersonRecord
```

### Q: How do you read a route param, what type is it, how did you use it safely?

- **Reading:** `useParams()` from react-router-dom.
- **Type:** **`string | undefined`**. React Router makes every param optional, because the same
  component could be rendered by a route that doesn't have this param. And it's always just a
  **string** from the URL: nothing guarantees it's a real person id (book 16.4.1).
- **Safe use, 3 steps:**
  1. check for `undefined` (`personId ? ... : null`),
  2. look it up with `findPersonById` (from `lookupHelpers.ts`), which returns `PersonRecord | null`,
  3. **early return** with "Person not found" and a link back if nothing was found.
     Try `/react/team/people/xyz`.

### Q: `/team/people/nova-byte` vs. `/team/people?person=nova-byte` — which fits and why?

- **Route param** `/team/people/nova-byte`: says **which resource this page is**. The person *is* the
  page. Without the id the page doesn't exist.
- **Query param** `?person=nova-byte`: an **optional modifier** of a page that also exists without it
  (filter, sort, tab).

For the person detail page the **route param** fits: it's a separate page about one person, with a
clean URL you can bookmark, and it's clearly a different page than the list. With a query param,
`/team/people` and `/team/people?person=x` would be the same route showing two completely different
things. For the Timeline, the **query param** fits (Demo 10): `/timeline` without a person is still the
full timeline, and filters can be combined (`?person=…&location=…`). Book 16.4.2: *path segment
identifies the resource, query parameter modifies how a collection is viewed.*

---

## Demo 10 — Query parameters as URL state + wrap-up

### What I built

`features/timeline/TimelinePage.tsx` reads `?person=` with `useSearchParams()` during render:

```tsx
const [searchParams] = useSearchParams();
const requestedPerson = searchParams.get("person") ?? "";
// unknown ids fall back to "All people" instead of an empty list
const personFilter = findPersonById(requestedPerson) ? requestedPerson : "";

const events = state.allTimeline
  .filter((event) => !personFilter || event.personIds.includes(personFilter))
  .sort(...);
...
<TimelineFilterBar key={personFilter} initialPersonId={personFilter} ... />
```

- no or unknown `?person=` → all events,
- valid id → only that person's events, **and** the person dropdown is pre-selected
  (`defaultValue={initialPersonId}`).
- **Try:** `/react/timeline?person=patch-vector` → 2 events, "Patch Vector" selected. The person
  detail page has a **"See … on the timeline"** button that links there.
- The dropdowns in `TimelineFilterBar.tsx` are **uncontrolled** (`defaultValue`, no `onChange`). You
  can change them, but nothing filters. That's intended for this exercise.
- **`key={personFilter}` on the filter bar:** `defaultValue` is only used when the `<select>` is first
  created. If the URL changes from `?person=a` to `?person=b` while the page stays open, the key
  changes, React creates a new filter bar, and the dropdown shows the new person. Without the key it
  would keep showing the old one.

### Final check

- Dashboard, People & Locations and Timeline are fully React.
- `grep -rn "innerHTML\|createElement\|appendChild\|classList" src/` → no results.
- All views open directly by URL, also after a reload (the data is loaded by `LoadingGate`, not by
  the Dashboard): `/react/dashboard`, `/react/team/people`, `/react/team/locations`,
  `/react/team/people/<id>`, `/react/timeline?person=<id>`.
- `npm run lint` passes. `tsc --noEmit` passes for all files in use, **but fails on the unused
  leftover `src/elements.jsx`**. Delete it (see the note at the top) before showing `npm run build`.

### Q: Why is reading a query param once still within the "no state" rule? What would cross the line?

`TimelinePage` holds **no state of its own**. The list is a **pure function of (data, URL)**, computed
again on every render, just like rendering a prop (book 15.4: same input → same output). The URL is
an *input*, like a route param. The user changes it by **navigating** (a link, the address bar), which
is the router's job, not by interacting with the component.

**Crossing the line** = the component itself has to **remember something that changes after the first
render**, e.g.:

- `onChange` on the dropdowns that updates `useState`,
- a controlled `<select value={...}>`,
- writing the selection back into the URL with `setSearchParams`.

That's Exercise 5.

### Q: What would you need to make the filters actually filter?

**State + event handlers.** Two options:

1. `useState` for each filter, controlled dropdowns (`<select value={person} onChange={e => setPerson(e.target.value)}>`).
2. Keep the URL as the source of truth: call `setSearchParams({ person: e.target.value })` in `onChange`.

In both cases a change triggers a re-render, and the filtered list is still **computed during render**
from data + filter values (no separate copy of the filtered list stored in state). Option 2 has the
bonus that filtered views stay bookmarkable.

### Q: What duplication did you notice but not extract? Why not?

1. **Evidence count per person** is computed twice with the same code:

   ```ts
   state.allEvidence.filter((item) => evidenceMentionsPerson(item, person)).length
   ```

   in `PeoplePage.tsx` and `PersonDetailPage.tsx`. Also, `TimelinePage.tsx` (`toListItem`) does a
   similar id → person lookup. A small selector file (`data/selectors.ts`) would remove this.
2. **"Chip lists"** (person chips and evidence-id chips on timeline events) and the Dashboard's
   `MiniListItem` lists look similar.

**Why I didn't extract them yet:** each has only one or two uses with slightly different needs. Also,
Exercise 5 will change how data is read (state/reducer instead of the global `state` object), so I
would have to design the abstraction twice. The book also warns against extracting too early
(15.6, 16.3). **With more time**, and once Evidence/Workspace also need these counts, I would extract
the selectors first, because they are logic (easy to test) rather than markup.
