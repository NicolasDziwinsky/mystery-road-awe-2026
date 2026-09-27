import { handleHashChange } from "./navigation.js";
import {
  handleSearchInput,
  renderEvidenceList,
  clearFilters,
} from "./views/evidence.js";
import { renderTimeline } from "./views/timeline.js";
// ---------------------------------------------------------------------
// EVENT LISTENER SETUP
// ---------------------------------------------------------------------

export function setupEventListeners() {
  window.addEventListener("hashchange", handleHashChange);

  const navButtons = document.querySelectorAll<HTMLElement>(".nav-btn");
  for (const button of navButtons) {
    button.addEventListener("click", () => {
      const targetView = button.getAttribute("data-view");
      console.log("nav clicked:", targetView);
    });
  }

  const evidenceSearch = document.getElementById("evidenceSearch");
  if (evidenceSearch) {
    evidenceSearch.addEventListener("input", handleSearchInput);
  }

  const filterType = document.getElementById("filterType");
  if (filterType) filterType.addEventListener("change", renderEvidenceList);
  const filterPerson = document.getElementById("filterPerson");
  if (filterPerson) filterPerson.addEventListener("change", renderEvidenceList);
  const filterLocation = document.getElementById("filterLocation");
  if (filterLocation) filterLocation.addEventListener("change", renderEvidenceList);
  const filterStatus = document.getElementById("filterStatus");
  if (filterStatus) filterStatus.addEventListener("change", renderEvidenceList);
  const filterRelevance = document.getElementById("filterRelevance");
  if (filterRelevance) filterRelevance.addEventListener("change", renderEvidenceList);
  const sortEvidence = document.getElementById("sortEvidence");
  if (sortEvidence) sortEvidence.addEventListener("change", renderEvidenceList);

  const clearFiltersBtn = document.getElementById("clearFiltersBtn");
  if (clearFiltersBtn) clearFiltersBtn.addEventListener("click", clearFilters);

  const timelineOrder = document.getElementById("timelineOrder");
  if (timelineOrder) timelineOrder.addEventListener("change", renderTimeline);
  const timelinePersonFilter = document.getElementById("timelinePersonFilter");
  if (timelinePersonFilter) timelinePersonFilter.addEventListener("change", renderTimeline);
  const timelineLocationFilter = document.getElementById("timelineLocationFilter");
  if (timelineLocationFilter) timelineLocationFilter.addEventListener("change", renderTimeline);
  const timelineTypeFilter = document.getElementById("timelineTypeFilter");
  if (timelineTypeFilter) timelineTypeFilter.addEventListener("change", renderTimeline);

  const hypConfidence = document.getElementById("hypConfidence");
  const hypConfidenceValue = document.getElementById("hypConfidenceValue");
  if (hypConfidence && hypConfidenceValue) {
    hypConfidence.addEventListener("input", (event: Event) => {
      const target = event.target as HTMLInputElement | null;
      if (target) hypConfidenceValue.textContent = target.value;
    });
  }
}
