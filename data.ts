// ---------------------------------------------------------------------
// GLOBAL STATE
// ---------------------------------------------------------------------

import type { AppState } from "./types/domain";

export const state: AppState = {
  allEvidence: [],
  filteredEvidence: [],
  selectedEvidence: null,
  bookmarks: [],
  currentPage: "dashboard",

  allPeople: [],
  allLocations: [],
  allTimeline: [],
  caseData: null,

  currentPeopleTab: "people",
  loadingStepsRemaining: 2,
  evidenceViewLoading: true,

  viewRendered: {
    dashboard: false,
    evidence: false,
    people: false,
    timeline: false,
    workspace: false,
  },

  notesStore: {},
  modalCloseListenerCount: 0,

  STORAGE_KEY_BOOKMARKS: "remotion_bookmarks",
  STORAGE_KEY_NOTES: "remotion_notes",
  STORAGE_KEY_HYPOTHESIS: "remotion_hypothesis",
};
