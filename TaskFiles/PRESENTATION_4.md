# Exercise 4 — Presentation Guide (Demos 1–7)

How to use this file: each demo has the same four parts.

- **Show**: what to open and click, in order.
- **Say**: what to say while showing it. You don't have to say it word for word, just hit the points.
- **Questions**: a short spoken answer for each question from `EXERCISE_4.md`.
- **If they dig deeper**: extra detail, only if someone asks.

The long written answers are in `ANSWERS_4.md`.

---

## Before class (5 minutes)

1. In the project folder run `npm run dev`. Wait until Vite prints the URL.
2. Open these browser tabs in this order:
   1. `http://localhost:5173/react/team/people`
   2. `http://localhost:5173/react/team/locations`
   3. `http://localhost:5173/react/timeline`
   4. `http://localhost:5173/react/timeline/key-demo`
   5. `http://localhost:5173/react/dashboard`
   6. `http://localhost:5173/` (the old vanilla app, for comparisons)
3. In VS Code, have these files ready (pin them or keep them open):
   - `src/components/Card.tsx`, `src/components/Panel.tsx`, `src/components/StatusBadge.tsx`
   - `src/features/people-locations/PersonCard.tsx`, `PersonList.tsx`, `PeoplePage.tsx`
   - `src/features/timeline/TimelineEventCard.tsx`, `TimelineList.tsx`, `TimelinePage.tsx`, `certainty.ts`, `KeyIndexDemo.tsx`
   - `ARCHITECTURE.md`
4. Open a terminal in VS Code. Check that `npx tsc --noEmit` prints nothing, which means no errors.
5. `git status` should be clean, so you can undo demo edits with `git checkout -- <file>`.

**Opening sentence for the whole exercise:**
> "In Exercise 4 I migrated People & Locations and the Timeline to React, which makes 3 of 5 views.
> I also restructured `src/` into feature folders, typed every component, and added real routes.
> Everything is presentational. There's no interactivity beyond the first render, that comes in Exercise 5."

---

## Demo 1 — JSX, function components, typed props, composition & children

### Show

1. Browser tab `/react/team/people`: "These cards are all React components."
2. Open `src/features/people-locations/PersonCard.tsx`:
   - point to the `PersonCardProps` interface at the top (`person: PersonRecord; evidenceCount: number`),
   - point to the function signature `PersonCard({ person, evidenceCount }: PersonCardProps)`.
3. Briefly name the other typed components: `LocationCard`, `TimelineEventCard`, `TimelineFilterBar`,
   `PersonAvatar`, `StatusBadge`.
4. Open `src/components/Card.tsx` (the children component):
   ```tsx
   export interface CardProps { kind: CardKind; children: ReactNode; }
   export function Card({ kind, children }: CardProps) {
     return <div className={`${kind}-card`}>{children}</div>;
   }
   ```
5. Back in `PersonCard.tsx` line 16: `<Card kind="person"> ... </Card>`. Everything between the tags is
   `children`. Also show `LocationCard.tsx`, which uses the same `Card` with `kind="location"`.

### Say

> "A component is a function that takes one props object and returns JSX. Every component has an
> interface that describes its props, so there's no `any` anywhere. `Card` doesn't take data. It takes
> `children`, which is whatever I write between its tags, and only draws the frame around it. Person
> cards and location cards both use it."

### Questions

**Q: Show a JSX expression with a JS value. What can and can't go in `{...}`?**

Open `TimelineEventCard.tsx`:
- line 19: `` className={`timeline-event certainty-${event.certainty}`} `` (computed class)
- line 21: `{formatDate(event.time)}` (function call)
- line 27: `{hasLocations && <p>Location: {locationNames.join(", ")}</p>}`

> "Braces switch from markup to JavaScript. Only **expressions** are allowed, meaning things that
> produce a value: variables, function calls, ternaries, `&&`, `.map`. **Statements** like `if`, `for`
> or `const` aren't allowed, because JSX is turned into function calls and the braces become
> arguments. That's why I compute things like `evidenceLabel` in `PersonCard` above the `return` and
> only put the finished value in braces."

**Q: What would TypeScript catch with the wrong shape? (live)**

1. Open `src/features/people-locations/PersonList.tsx`, line 17.
2. Change `evidenceCount={evidenceCount}` to `evidenceCount="3"`.
3. Show the red underline in VS Code and hover: *Type 'string' is not assignable to type 'number'.*
4. Optional: run `npx tsc --noEmit` in the terminal and show the same error.
5. Second example, if there's time: delete `person={person}` → *Property 'person' is missing ...*
6. **Undo** with Ctrl+Z, or `git checkout -- src/features/people-locations/PersonList.tsx`.

> "The interface is the component's contract. If I pass a string instead of a number, leave out a
> required prop, mistype a prop name or pass a location instead of a person, TypeScript catches it
> at the place where I use the component, before the app runs. Without types I'd only notice at
> runtime, as 'undefined' on the page or a crash."

**Q: Named prop vs. `children`. Why `children` here?**

> "A named prop is data the component understands and renders itself, like `person` in PersonCard.
> `children` is finished JSX from the caller: the component doesn't know what it is, it only decides
> where it goes. Card and Panel are just frames. A person, a location or a 'not found' message all fit
> in the same frame, so `children` makes them reusable without adding a new prop for every kind of
> content."

**Q: Why does direct DOM manipulation conflict with React?**

> "React assumes it **owns the DOM** below its root. On every render it builds a description of the
> UI, compares it to the last description, and changes only the differences. It never reads the real
> DOM. If I change the DOM myself with `innerHTML` or `classList.add`, like the old `app.js` did
> everywhere, React's picture is wrong. On the next render it overwrites my change or patches nodes
> that aren't there any more. In React, to change the screen you change the data."

Optional proof: in the terminal, run
`grep -rn "innerHTML\|createElement\|appendChild\|classList" src/`. It prints nothing.

### If they dig deeper

- `children` can be nothing, one element, or an array. `ReactNode` allows all of these.
- `IntroCard` has `children?: ReactNode`, so it's optional there.
- `LoadingGate` is also a children component: it shows the page only once data is loaded.

---

## Demo 2 — Conditional rendering

### Show

Walk through these four spots (have the files open in tabs):

| # | File | Technique | Point at |
| --- | --- | --- | --- |
| 1 | `timeline/TimelineList.tsx` line 17 | **ternary** | `items.length === 0 ? <p>No timeline events match…</p> : items.map(...)` |
| 2 | `timeline/TimelineEventCard.tsx` line 27 | **`&&`** | `{hasLocations && <p>Location: …</p>}` |
| 3 | `timeline/certainty.ts` | **lookup table** | `confirmed → reviewed (green)`, `contradictory → critical (red)`, `reported → flagged` |
| 4 | `people-locations/PersonDetailPage.tsx` line 14 | **early return** | `if (!person) return <Panel title="Person not found">…` |

Then in the browser:
- `/react/timeline`: the badges have different colours per certainty (lookup table in action).
- `/react/team/people` vs `/react/team/locations`: the active tab is highlighted (`NavLink` with
  `isActive ? "tab-btn active" : "tab-btn"` in `TeamTabs.tsx`).
- `/react/team/people/xyz` → "Person not found" (early return).

**Optional live demo of the empty state.** With the real data the timeline is never empty, so:
1. In `TimelinePage.tsx` line 43, temporarily change `items={events.map(toListItem)}` to `items={[]}`.
2. The page shows "No timeline events match the current filters."
3. Undo.

### Say

> "I pick the technique by the shape of the alternatives. A **ternary** when there are two real
> options: list or empty message. **`&&`** for something-or-nothing: the location line. An **early
> return** when the rest of the component can't run without the data: the detail page would crash on
> `person.name`. A **lookup table** when one value maps to many cases: certainty to colour. It
> replaces the if/else chain from the vanilla `certaintyBadgeClass()`."

### Questions

**Q: Where did you use `&&` instead of a ternary? What if the condition were `0`?**

Point to `TimelineEventCard.tsx` lines 16 and 27:
```tsx
const hasLocations = locationNames.length > 0;
{hasLocations && <p className="evidence-meta">Location: …</p>}
```

> "`&&` returns the left side if it's falsy. If I had written `locationNames.length && ...` and an
> event had no locations, the result would be `0`, and React renders numbers, so a '0' would appear
> on the page. Only false, null and undefined render nothing. In my code I compare first with
> `> 0`, so the left side is always a real boolean and the risk doesn't apply."

**Q: Why return `null` instead of an empty `<div>`? Did you use either?**

Point to `components/Panel.tsx` line 14: `{title ? <h3>{title}</h3> : null}`.

> "`null` puts nothing in the DOM. An empty div is still a real element: CSS can give it padding or
> margins, it counts in selectors like `:nth-child`, and it's a useless node. I use `null` in Panel,
> IntroCard, MiniListItem and HowToItem. A panel without a title just has no heading."

---

## Demo 3 — Rendering collections

### Show

1. Browser: `/react/team/people` (6 people), `/react/team/locations` (locations), `/react/timeline` (events).
2. Code, one line each:
   - `PersonList.tsx` line 17: `items.map(... <PersonCard key={person.id} .../>)`
   - `LocationsPage.tsx` line 8: `<LocationCard key={location.id} .../>`
   - `TimelineList.tsx` line 22: `key={item.event.id}`
3. Mention: inner lists have keys too (responsibilities, `contains`, person chips, `<option>`s).

### Say

> "All three lists are arrays turned into components with `.map`, and every item has a key from its
> real id."

### Question

**Q: What does React use `key` for internally?**

> "When a list renders again, React has to match each new child to one from the last render. Without
> keys it can only match by position. With keys it matches by identity: same key means same
> component, so React keeps the DOM node **and its state**, like typed text or focus, and only updates
> what changed. A new key mounts a new component, a missing key unmounts one, and if the order
> changes React moves the existing nodes instead of rewriting them. Keys only need to be unique among
> siblings."

---

## Demo 4 — Stable keys and list identity

This is the most visual demo. Practise it once before class.

### Show

1. Open `/react/timeline/key-demo` (start fresh: reload without query parameters).
2. The panel title says **"Currently using key={index}"**.
3. In the **first row (T01)** type `NOTE FOR T01`.
4. Click **"Reverse order"**. The rows are now T05 at the top … T01 at the bottom.
   **The note is still in the first row, next to T05. ❌**
5. Click **"Switch to key=id"**. The title now says "key={event.id}" and the inputs are empty, because
   all keys changed and React built new rows.
6. Type `NOTE FOR T01` into the T01 row again (first row).
7. Click **"Reverse order"**. **The note moves with T01 to the bottom. ✅**
8. Show `KeyIndexDemo.tsx` line 30: `key={keyMode === "index" ? index : event.id}`.

### Say

> "The text in an input belongs to the DOM node. With `key={index}`, the first row has key 0 before
> and after reversing, so React thinks it's the same item: it keeps the DOM node with my text and only
> changes the label next to it. With `key={event.id}`, React sees that T01 moved and moves its node,
> input included. Order and key mode are in the URL, so the demo needs no `useState`. And in the real
> lists I always use ids."

### Questions

**Q: What goes wrong with missing, duplicate or index keys?**

> "**Index keys** with reorder or filter: state and DOM stay with the position, not the item, which is
> what the demo just showed. With filtering, every item after the removed one shifts, so React
> updates all of them. **Missing keys**: React uses the index anyway and logs a warning. **Duplicate
> keys**: two items claim the same identity, React warns, and items can be shown twice, disappear or
> get the wrong state."

**Q: The vanilla app's index bug. Would `key={index}` in React cause a visible symptom?**

Show the vanilla code in `views/workspace.ts`, `renderNotesList()` (around line 83):
`'<div id="noteText-' + entry.index + '">'`. Here `index` is the position in `allEvidence`, not the
evidence id.

> "As long as the notes list is only static text: **no visible symptom**. React just updates each
> row's text, so it looks right, and there isn't even a warning, because React only warns about
> missing keys. But in Exercise 5 the notes become editable. Then, after a reorder or a deleted note,
> typed text would appear under the **wrong evidence item**, exactly like in my demo. So it's a hidden
> bug that becomes visible once the rows have state."

**Q: Is `key={index}` ever legitimate?**

> "Yes, when the list is static (never reordered, filtered or inserted into), the items have no state,
> and there's no natural id. For example a person's list of responsibility strings, or placeholder
> rows while loading. People, locations and timeline events have real ids, so I always use those."

---

## Demo 5 — Presentational vs. feature components

### Show

1. Say the definition first (below), then show the classification as a quick list:
   - **Presentational** (props in, markup out): `Button`, `RouteButton`, `Panel`, `Card`, `IntroCard`,
     `StatCard`, `StatusBadge`, `MiniListItem`, `ViewSection`, `HowToItem`, `PersonAvatar`,
     `PersonCard`, `PersonList`, `LocationCard`, `TimelineEventCard`, `TimelineList`,
     `TimelineFilterBar`, `TeamTabs`, `Header`.
   - **Feature** (read data / URL, compute): `DashboardPage`, `PeoplePage`, `LocationsPage`,
     `PersonDetailPage`, `TimelinePage`, `KeyIndexDemo`, `LoadingGate`.
   - **Layout**: `AppShell`, `TeamLayout` (frame + `<Outlet />`).
2. Show the split, Timeline:
   - `TimelinePage.tsx` line 26: reads `state` and `?person=`, filters, sorts, then line 43:
     `<TimelineList items={events.map(toListItem)} />`.
   - `TimelineList.tsx`: only gets `items` and renders them (or the empty message).
3. Second split, People: `PeoplePage.tsx` computes `countEvidenceForPerson` (line 6) and passes
   plain items to `PersonList` (line 18). In the vanilla app `renderPeople()` did both in one function.

### Say

> "A presentational component gets everything through props and only renders. A feature component
> knows where the data comes from: it reads the global state or the URL and turns that into props.
> The Timeline was the clearest case of one component doing two jobs, so I split it: `TimelinePage`
> decides **which** events are shown, `TimelineList` and `TimelineEventCard` decide **how they look**."

### Questions

**Q: Responsibility of each half after the split? Does a change in one affect the other?**

> "TimelinePage: what's on the timeline, meaning the data source, filter, order and turning ids into
> names. TimelineList: what it looks like. They're only connected by the `TimelineListItem` type. If
> I change the filtering, for example real filters in Exercise 5, the list doesn't change, it still
> gets items. If I change the card design, the page doesn't change. Only a change to the props type
> affects both, and TypeScript shows me every place I'd have to fix."

**Q: One concrete rule for presentational vs. feature?**

> "If it needs to know where data comes from (the global state, the URL, fetch, localStorage) or
> computes something from it, it's a feature component. If I can render it with hard-coded props and
> nothing else, it's presentational. For example `<PersonCard person={...} evidenceCount={3} />` works
> anywhere, but `PeoplePage` needs `state.allPeople`."

---

## Demo 6 — Feature-oriented folder structure

### Show

1. VS Code explorer: collapse everything, then expand `src/`:
   ```
   src/
     App.tsx          route table
     app/             shell: AppShell, Header, LoadingGate, NotFoundPage
     components/      shared presentational UI
     data/            data loading for all features
     features/
       dashboard/
       people-locations/
       timeline/
       evidence/      stub (Exercise 5)
       workspace/     stub (Exercise 5)
   ```
2. Expand `features/timeline/` to show that everything for one view is together.
3. Open `ARCHITECTURE.md`: scroll through the **Folder structure**, **Rules** and **Routes** sections.
   Read the shared-vs-local rule out loud.

### Say

> "Before, `src/` was flat with one big `elements.jsx`. Now it's grouped by feature: one folder per
> view, including the Dashboard and the shell from Exercise 3. Shared pieces go into `components/`,
> data loading into `data/`. The rules are written down in ARCHITECTURE.md."

### Questions

**Q: By type vs. by feature. Why this structure for this app?**

> "By type means folders like components, hooks, pages, utils. Everything for the Timeline would be
> spread over four folders. By feature, everything for one view is in one folder. For this app it
> fits because the features match the views 1:1, and we migrate view by view: Dashboard in Exercise 3,
> People and Timeline now, Evidence and Workspace in Exercise 5. Each exercise mostly adds one folder,
> and rewriting a view means touching one folder."

**Q: Where's the line between feature-local and shared? One example each.**

> "My rule: used by two or more features → `components/`. Otherwise it stays in the feature, even if
> it looks reusable. **Shared:** `StatusBadge`, used on the Dashboard, the Timeline and People.
> **Feature-local:** `HowToItem`, only on the Dashboard, and `certainty.ts`, because only the Timeline
> knows what certainty is. `PersonCard` is used twice, but both uses are inside people-locations, so
> it stays there. Presentational doesn't automatically mean shared."

---

## Demo 7 — Reusable UI elements

### Show

1. Open `src/components/StatusBadge.tsx`:
   ```tsx
   export type BadgeVariant = "critical" | "reviewed" | "flagged" | "relevant" | "unreviewed";
   export interface StatusBadgeProps { status: string; variant?: BadgeVariant; }
   ...
   const resolved = variant ?? statusToVariant(status);
   return <span className={`badge badge-${resolved}`}>{status}</span>;
   ```
2. Show it in the browser in three places, and the matching code line:

   | Browser | Code |
   | --- | --- |
   | `/react/dashboard`: case status + "Recent evidence" badges | `DashboardPage.tsx` lines 76 and 106: `<StatusBadge status={item.status} />` |
   | `/react/timeline`: certainty badge on each event | `TimelineEventCard.tsx` line 22: `variant={certaintyBadgeVariant(event.certainty)}` |
   | `/react/team/people`: "N related evidence items" | `PersonCard.tsx` line 38: `variant={evidenceCount > 0 ? "relevant" : "unreviewed"}` |

3. Mention `Card` as the second reusable element (person + location cards, from Demo 1).

### Say

> "StatusBadge is used in three features. The text and the colour vary through props. The markup and
> the list of allowed colours are fixed inside. `variant` is optional: for a normal status the badge
> works out the colour itself. Special cases like timeline certainty pass the colour explicitly. That
> way the badge never needs special cases like 'if timeline then ...'."

### Questions

**Q: Where is it used, what varies, what's fixed, how did you decide?**

> "Dashboard, Timeline and People. **Varies:** the text and the colour variant. **Fixed:** the
> `<span class="badge ...">` markup and the `BadgeVariant` union, so you can't pass a colour that
> has no CSS. I drew the line so the common case needs one prop and special cases pass one more,
> instead of the badge knowing about each feature. Each feature keeps its own mapping, like
> `certainty.ts` for the Timeline."

**Q: Compare to the vanilla app's duplicated template strings.**

Optional: show the vanilla `views/timeline.ts` around line 86:
`'&nbsp;&middot;&nbsp;<span class="badge badge-' + ...`, and mention `views/evidence.ts` and
`views/dashboard.ts` do the same with their own helper functions.

> "In the vanilla app the badge HTML was written by hand in three files with three different helper
> functions, and the card frame was written twice in renderPeople and renderLocations. With a
> component I get **one source of truth**: change it once, it changes everywhere. I get **type
> checking**: a typo in a variant is a compile error, while a typo in a class string only shows up
> visually. I get **escaping for free**: React escapes text, while string concatenation with
> innerHTML is an XSS risk. And I can pass **JSX via children**, not just strings."

---

## Quick reference: URLs and files

| Demo | URL | Main files |
| --- | --- | --- |
| 1 | `/react/team/people` | `PersonCard.tsx`, `Card.tsx`, `PersonList.tsx` (type error) |
| 2 | `/react/timeline`, `/react/team/people/xyz` | `TimelineList.tsx`, `TimelineEventCard.tsx`, `certainty.ts`, `PersonDetailPage.tsx`, `Panel.tsx` |
| 3 | `/react/team/people`, `/react/team/locations`, `/react/timeline` | `PersonList.tsx`, `LocationsPage.tsx`, `TimelineList.tsx` |
| 4 | `/react/timeline/key-demo` | `KeyIndexDemo.tsx`, vanilla `views/workspace.ts` |
| 5 | — | `TimelinePage.tsx` → `TimelineList.tsx`, `PeoplePage.tsx` → `PersonList.tsx` |
| 6 | — | `src/` folder tree, `ARCHITECTURE.md` |
| 7 | `/react/dashboard`, `/react/timeline`, `/react/team/people` | `StatusBadge.tsx`, vanilla `views/timeline.ts` |

**If something breaks during the demo:** `git checkout -- .` resets all files to the last commit.
Vite reloads automatically.
