import { renderDashboard } from "./views/dashboard.js";
import { state } from "./data.js";
import {
  populateAllDropdowns,
  applyStoredBookmarkFlags,
  renderEvidenceList,
} from "./views/evidence.js";
import { renderTimeline } from "./views/timeline.js";
import type {
  CaseRecord,
  EvidenceRecord,
  LocationRecord,
  PersonRecord,
  TimelineEvent,
} from "./types/domain.ts";

// ---------------------------------------------------------------------
// DATA LOADING
// ---------------------------------------------------------------------

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return (await response.json()) as T;
};

const showLoadingOverlay = (msg: string) => {
  const overlay = document.getElementById("loadingOverlay");
  const text = document.getElementById("loadingText");
  if (text) text.textContent = msg;
  if (overlay) overlay.classList.remove("hidden");
};

const hideLoadingStep = () => {
  state.loadingStepsRemaining--;
  if (state.loadingStepsRemaining <= 0) {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.add("hidden");
  }
};

async function loadCorePeopleAndLocations() {
  const caseData = await fetchJson<CaseRecord>("/data/case.json");
  state.caseData = caseData;

  const people = await fetchJson<PersonRecord[]>("/data/people.json");
  state.allPeople = people;

  const locations = await fetchJson<LocationRecord[]>("/data/locations.json");
  state.allLocations = locations;

  hideLoadingStep();
  renderDashboard();
  populateAllDropdowns();
}

function loadEvidenceData() {
  return fetchJson<EvidenceRecord[]>("/data/evidence.json")
    .then((data) => {
      state.allEvidence = data;
      applyStoredBookmarkFlags();
      state.filteredEvidence = [...state.allEvidence];
      renderDashboard();
      populateAllDropdowns();
      if (state.currentPage === "evidence") renderEvidenceList();
    })
    .catch((err: unknown) => {
      console.error("Failed to load evidence.json", err);
      alert("Evidence could not be loaded. Some views may be incomplete.");
    });
}

async function loadTimelineData() {
  try {
    const data = await fetchJson<TimelineEvent[]>("/data/timeline.json");

    state.allTimeline = data;
    renderDashboard();

    if (state.currentPage === "timeline") {
      renderTimeline();
    }

    populateAllDropdowns();
  } catch (err: unknown) {
    console.log("timeline load error", err);
  } finally {
    hideLoadingStep();
  }
}

export default function loadAllData() {
  showLoadingOverlay("Loading case file…");
  state.loadingStepsRemaining = 2;

  return loadCorePeopleAndLocations().then(function () {
    return Promise.all([loadEvidenceData(), loadTimelineData()]);
  });
}
