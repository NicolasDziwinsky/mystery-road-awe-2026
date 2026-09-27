import { state } from "../data.js";
import {
  formatDate,
  findLocationById,
  findEvidenceById,
} from "../lookupHelpers.js";
import { openEvidenceDetail } from "./evidence.js";
import { navigateTo } from "../navigation.js";

// ---------------------------------------------------------------------
// TIMELINE
// ---------------------------------------------------------------------

function getElement<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

export function populateTimelineDropdowns(): void {
  const personSelect = getElement<HTMLSelectElement>("timelinePersonFilter");
  const locationSelect = getElement<HTMLSelectElement>("timelineLocationFilter");
  const typeSelect = getElement<HTMLSelectElement>("timelineTypeFilter");
  if (!personSelect || !locationSelect || !typeSelect) return;

  personSelect.innerHTML = '<option value="">All people</option>';
  for (const person of state.allPeople) {
    personSelect.innerHTML +=
      '<option value="' + person.id + '">' + person.name + "</option>";
  }

  locationSelect.innerHTML = '<option value="">All locations</option>';
  for (const location of state.allLocations) {
    locationSelect.innerHTML +=
      '<option value="' + location.id + '">' +
      location.id +
      " - " +
      location.name +
      "</option>";
  }

  const types: string[] = [];
  for (const item of state.allTimeline) {
    if (!types.includes(item.type)) types.push(item.type);
  }
  typeSelect.innerHTML = '<option value="">All event types</option>';
  for (const type of types) {
    typeSelect.innerHTML += '<option value="' + type + '">' + type + "</option>";
  }
}

export function renderTimeline(): void {
  const container = getElement<HTMLElement>("timelineContainer");
  if (!container) return;

  const orderSelect = getElement<HTMLSelectElement>("timelineOrder");
  const personFilterSelect = getElement<HTMLSelectElement>("timelinePersonFilter");
  const locationFilterSelect = getElement<HTMLSelectElement>("timelineLocationFilter");
  const typeFilterSelect = getElement<HTMLSelectElement>("timelineTypeFilter");

  if (!orderSelect || !personFilterSelect || !locationFilterSelect || !typeFilterSelect) {
    return;
  }

  const order = orderSelect.value;
  const personFilter = personFilterSelect.value;
  const locationFilter = locationFilterSelect.value;
  const typeFilter = typeFilterSelect.value;

  let events = state.allTimeline.filter((evt) => {
    if (personFilter && !evt.personIds.includes(personFilter)) return false;
    if (locationFilter && !evt.locationIds.includes(locationFilter)) return false;
    if (typeFilter && evt.type !== typeFilter) return false;
    return true;
  });

  events = [...events].sort((a, b) => {
    const diff = new Date(a.time).getTime() - new Date(b.time).getTime();
    return order === "desc" ? -diff : diff;
  });

  let html = "";
  for (const item of events) {
    html += '<div class="timeline-event certainty-' + item.certainty + '">';
    html +=
      '<div class="timeline-time">' +
      formatDate(item.time) +
      '&nbsp;&middot;&nbsp;<span class="badge badge-' +
      certaintyBadgeClass(item.certainty) +
      '">' +
      item.certainty +
      "</span></div>";
    html += "<h3>" + item.title + "</h3>";
    html += "<p>" + item.description + "</p>";

    const eventLocationNames: string[] = [];
    for (const locationId of item.locationIds) {
      const evtLoc = findLocationById(locationId);
      eventLocationNames.push(evtLoc ? evtLoc.name : locationId);
    }
    if (eventLocationNames.length > 0) {
      html +=
        '<p class="evidence-meta">Location: ' +
        eventLocationNames.join(", ") +
        "</p>";
    }

    for (const evidenceId of item.evidenceIds) {
      html +=
        '<button type="button" class="evidence-link-btn" data-evidence-id="' +
        evidenceId +
        '">View ' +
        evidenceId +
        "</button>";
    }
    html += "</div>";
  }
  if (events.length === 0) {
    html = "<p>No timeline events match the current filters.</p>";
  }
  container.innerHTML = html;

  const linkButtons = container.querySelectorAll<HTMLButtonElement>(".evidence-link-btn");
  for (const button of linkButtons) {
    button.addEventListener("click", (event: MouseEvent) => {
      const target = event.currentTarget as HTMLButtonElement | null;
      if (target) {
        openEvidenceModal(target.dataset.evidenceId ?? "");
      }
    });
  }
}

function certaintyBadgeClass(certainty: string): string {
  if (certainty === "confirmed") return "reviewed";
  if (certainty === "contradictory") return "critical";
  if (certainty === "reported") return "flagged";
  return "unreviewed";
}

// --- Quick-view modal (used from the timeline) -------------------------
function openEvidenceModal(evidenceId: string): void {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;

  let modal = document.getElementById("quickViewModal") as HTMLElement | null;
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "quickViewModal";
    document.body.appendChild(modal);
  }

  modal.innerHTML =
    '<div class="modal-backdrop"><div class="modal-box">' +
    '<button type="button" class="modal-close-btn" aria-label="Close">&times;</button>' +
    "<h3>" +
    ev.title +
    "</h3>" +
    '<p class="evidence-meta">' +
    ev.id +
    " &middot; " +
    ev.type +
    " &middot; " +
    formatDate(ev.timestamp) +
    "</p>" +
    "<p>" +
    ev.summary +
    "</p>" +
    '<button type="button" class="btn btn-primary btn-small" data-open-full="' +
    ev.id +
    '">Open full evidence</button>' +
    "</div></div>";

  state.modalCloseListenerCount++;
  console.log(
    "modal opened, active close listeners:",
    state.modalCloseListenerCount,
  );

  modal.addEventListener("click", (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    if (
      target.classList.contains("modal-close-btn") ||
      target.classList.contains("modal-backdrop")
    ) {
      modal.innerHTML = "";
      return;
    }

    const openFullId = target.getAttribute("data-open-full");
    if (openFullId) {
      modal.innerHTML = "";
      navigateTo("evidence");
      setTimeout(() => {
        openEvidenceDetail(openFullId);
      }, 0);
    }
  });
}
