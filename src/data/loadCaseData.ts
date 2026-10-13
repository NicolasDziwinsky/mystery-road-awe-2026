import { state } from "../../data.ts";
import type {
  CaseRecord,
  EvidenceRecord,
  LocationRecord,
  PersonRecord,
  TimelineEvent,
} from "../../types/domain.ts";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

let pending: Promise<void> | null = null;

export function isCaseDataLoaded(): boolean {
  return state.caseData !== null;
}

// Fetches all JSON files once and stores them in the shared `state` object
// (same object the vanilla app uses). Later calls reuse the same promise,
// so switching pages does not refetch.
export function loadCaseData(): Promise<void> {
  if (!pending) {
    pending = Promise.all([
      fetchJson<CaseRecord>("/data/case.json"),
      fetchJson<PersonRecord[]>("/data/people.json"),
      fetchJson<LocationRecord[]>("/data/locations.json"),
      fetchJson<EvidenceRecord[]>("/data/evidence.json"),
      fetchJson<TimelineEvent[]>("/data/timeline.json"),
    ])
      .then(([caseData, people, locations, evidence, timeline]) => {
        state.caseData = caseData;
        state.allPeople = people;
        state.allLocations = locations;
        state.allEvidence = evidence;
        state.filteredEvidence = [...evidence];
        state.allTimeline = timeline;
      })
      .catch((err: unknown) => {
        pending = null; // allow a retry on the next mount
        throw err;
      });
  }
  return pending;
}
