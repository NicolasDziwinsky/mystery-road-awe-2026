import { state } from "./data.js";
import { renderEvidenceList } from "./views/evidence.js";
import { renderDashboard } from "./views/dashboard.js";
import { renderPeople, renderLocations } from "./views/peopleLocations.js";
import { renderTimeline } from "./views/timeline.js";
import { renderWorkspace } from "./views/workspace.js";

// ---------------------------------------------------------------------
// NAVIGATION / HASH ROUTING
// ---------------------------------------------------------------------

export function navigateTo(viewName: string) {
  window.location.hash = viewName;
}

export function handleHashChange() {
  const hash = window.location.hash.replace("#", "") || "dashboard";
  const validViews = [
    "dashboard",
    "evidence",
    "people",
    "timeline",
    "workspace",
  ] as const;
  const normalizedHash = validViews.includes(hash as (typeof validViews)[number])
    ? hash
    : "dashboard";
  state.currentPage = normalizedHash;

  const sections = document.querySelectorAll<HTMLElement>(".view");
  for (const section of sections) {
    section.classList.remove("active");
  }
  const targetSection = document.getElementById("view-" + normalizedHash);
  if (targetSection) targetSection.classList.add("active");

  const navButtons = document.querySelectorAll<HTMLElement>(".nav-btn");
  for (const button of navButtons) {
    button.classList.remove("active");
    if (button.getAttribute("data-view") === normalizedHash) {
      button.classList.add("active");
    }
  }

  if (normalizedHash === "dashboard" && !state.viewRendered.dashboard) {
    renderDashboard();
  } else if (normalizedHash === "evidence" && !state.viewRendered.evidence) {
    renderEvidenceList();
    state.viewRendered.evidence = true;
  } else if (normalizedHash === "people" && !state.viewRendered.people) {
    renderPeople();
    renderLocations();
    state.viewRendered.people = true;
  } else if (normalizedHash === "timeline" && !state.viewRendered.timeline) {
    renderTimeline();
    state.viewRendered.timeline = true;
  } else if (normalizedHash === "workspace") {
    renderWorkspace();
  }
}

// Expose functions to the global scope for inline onclick handlers
window.navigateTo = navigateTo;
window.handleHashChange = handleHashChange;
