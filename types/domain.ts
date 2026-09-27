export type CaseStatus = "open" | "closed" | "unknown";

export type PersonReference = string;

export interface CaseRecord {
  caseId: string;
  title: string;
  subtitle: string;
  status: CaseStatus | string;
  opened: string;
  summary: string;
  location: string;
  leadInvestigator: string;
  notes: string;
}

export interface EvidenceRecord {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  summary: string;
  content: string;
  // This field is intentionally modeled as a loose identifier string because the
  // source data mixes canonical IDs like "patch-vector" with display names such
  // as "Nova Byte" and "Root Harbor" in the same array.
  personIds: PersonReference[];
  locationIds: string[];
  tags: string[];
  status: string;
  relevance: string;
  bookmarked?: boolean;
}

export interface PersonRecord {
  id: string;
  name: string;
  role: string;
  speciality: string;
  responsibilities: string[];
  statement: string;
  background: string;
  avatar: string;
}

export interface LocationRecord {
  id: string;
  name: string;
  description: string;
  contains: string[];
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  type: string;
  certainty: string;
  personIds: string[];
  locationIds: string[];
  evidenceIds: string[];
}

export interface AppState {
  allEvidence: EvidenceRecord[];
  filteredEvidence: EvidenceRecord[];
  selectedEvidence: EvidenceRecord | null;
  bookmarks: string[];
  currentPage: string;

  allPeople: PersonRecord[];
  allLocations: LocationRecord[];
  allTimeline: TimelineEvent[];
  caseData: CaseRecord | null;

  currentPeopleTab: string;
  loadingStepsRemaining: number;
  evidenceViewLoading: boolean;

  viewRendered: {
    dashboard: boolean;
    evidence: boolean;
    people: boolean;
    timeline: boolean;
    workspace: boolean;
  };

  notesStore: Record<string, string>;
  modalCloseListenerCount: number;

  STORAGE_KEY_BOOKMARKS: string;
  STORAGE_KEY_NOTES: string;
  STORAGE_KEY_HYPOTHESIS: string;
}
