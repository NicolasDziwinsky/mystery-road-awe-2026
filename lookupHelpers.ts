import { state } from "./data.js";

// ---------------------------------------------------------------------
// GENERIC LOOKUP HELPERS
// ---------------------------------------------------------------------

type EvidenceRecord = {
  id: string;
  personIds?: Array<string>;
  [key: string]: unknown;
};

type PersonRecord = {
  id: string;
  name: string;
  [key: string]: unknown;
};

type LocationRecord = {
  id: string;
  name: string;
  [key: string]: unknown;
};

export function findEvidenceById(id: string): EvidenceRecord | null {
  for (const item of state.allEvidence as EvidenceRecord[]) {
    if (item.id === id) return item;
  }
  return null;
}

export function findPersonById(id: string): PersonRecord | null {
  for (const item of state.allPeople as PersonRecord[]) {
    if (item.id === id) return item;
  }
  return null;
}

export function findLocationById(id: string): LocationRecord | null {
  for (const item of state.allLocations as LocationRecord[]) {
    if (item.id === id) return item;
  }
  return null;
}

export function evidenceMentionsPerson(
  ev: Partial<EvidenceRecord> | null | undefined,
  person: Partial<PersonRecord> | null | undefined,
): boolean {
  if (!ev?.personIds || !person) return false;

  const personId = person.id ?? "";
  const personName = person.name ?? "";

  return (
    ev.personIds.includes(personId) ||
    ev.personIds.includes(personName)
  );
}

export function formatDate(ts: string | number | Date | null | undefined): string {
  if (!ts) return "Unknown date";

  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);

  return (
    d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }) +
    " " +
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  );
}

export function getStatusBadgeClass(status: string | null | undefined): string {
  const s = (status ?? "").toLowerCase();
  if (s === "reviewed") return "badge-reviewed";
  if (s === "flagged") return "badge-flagged";
  return "badge-unreviewed";
}

export function getRelevanceBadgeClass(relevance: string | null | undefined): string {
  const r = (relevance ?? "").toLowerCase();
  if (r === "relevant") return "badge-relevant";
  return "badge-unreviewed";
}
