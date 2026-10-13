import { useSearchParams } from "react-router-dom";
import { ViewSection } from "../../components/index.ts";
import { state } from "../../../data.ts";
import { findLocationById, findPersonById } from "../../../lookupHelpers.ts";
import type { PersonRecord, TimelineEvent } from "../../../types/domain.ts";
import { TimelineFilterBar } from "./TimelineFilterBar.tsx";
import { TimelineList, type TimelineListItem } from "./TimelineList.tsx";

function toListItem(event: TimelineEvent): TimelineListItem {
  const people = event.personIds
    .map((id) => findPersonById(id))
    .filter((person): person is PersonRecord => person !== null);
  const locationNames = event.locationIds.map((id) => findLocationById(id)?.name ?? id);
  return { event, people, locationNames };
}

// Feature component: reads data + the ?person= query param, decides which
// events to show and passes them down. No useState: the initial list is a
// pure function of (data, URL).
export default function TimelinePage() {
  const [searchParams] = useSearchParams();
  const requestedPerson = searchParams.get("person") ?? "";
  // Unknown ids fall back to "All people" instead of showing an empty list.
  const personFilter = findPersonById(requestedPerson) ? requestedPerson : "";

  const events = state.allTimeline
    .filter((event) => !personFilter || event.personIds.includes(personFilter))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const eventTypes = [...new Set(state.allTimeline.map((event) => event.type))];

  return (
    <ViewSection id="timeline" title="Investigation Timeline">
      <TimelineFilterBar
        // key: remount when the URL's person changes, otherwise the
        // uncontrolled select would keep its old defaultValue.
        key={personFilter}
        people={state.allPeople}
        locations={state.allLocations}
        eventTypes={eventTypes}
        initialPersonId={personFilter}
      />
      <TimelineList items={events.map(toListItem)} />
    </ViewSection>
  );
}
