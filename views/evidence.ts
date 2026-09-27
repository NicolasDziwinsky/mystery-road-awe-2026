import { state } from "../data.js";
import type { EvidenceRecord } from "../types/domain";
import { populateTimelineDropdowns } from "./timeline.js";
import { populateHypothesisDropdowns } from "./workspace.js";
import {
  evidenceMentionsPerson,
  getStatusBadgeClass,
  getRelevanceBadgeClass,
  formatDate,
  findEvidenceById,
  findPersonById,
  findLocationById,
} from "../lookupHelpers.js";
import {
  saveNoteForEvidence,
  loadNoteForEvidence,
  saveBookmarksToStorage,
} from "../localStorageHelpers.js";

// ---------------------------------------------------------------------
// EVIDENCE CATALOGUE
// ---------------------------------------------------------------------

const getElement = <T extends HTMLElement>(id: string): T | null =>
  document.getElementById(id) as T | null;

export function populateAllDropdowns(): void {
  populateEvidenceDropdowns();
  populateTimelineDropdowns();
  populateHypothesisDropdowns();
}

function populateEvidenceDropdowns(): void {
  const typeSelect = getElement<HTMLSelectElement>("filterType");
  const personSelect = getElement<HTMLSelectElement>("filterPerson");
  const locationSelect = getElement<HTMLSelectElement>("filterLocation");
  if (!typeSelect || !personSelect || !locationSelect) return;

  const types = Array.from(
    new Set(state.allEvidence.map((item) => item.type.toLowerCase())),
  );

  typeSelect.innerHTML = '<option value="">All types</option>';
  for (const type of types) {
    typeSelect.innerHTML += '<option value="' + type + '">' + type + "</option>";
  }

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
}

function getFilteredEvidence(): EvidenceRecord[] {
  const searchBox = getElement<HTMLInputElement>("evidenceSearch");
  const searchTerm = searchBox ? searchBox.value.toLowerCase().trim() : "";

  const typeSelect = getElement<HTMLSelectElement>("filterType");
  const personSelect = getElement<HTMLSelectElement>("filterPerson");
  const locationSelect = getElement<HTMLSelectElement>("filterLocation");
  const statusSelect = getElement<HTMLSelectElement>("filterStatus");
  const relevanceSelect = getElement<HTMLSelectElement>("filterRelevance");

  const typeVal = typeSelect?.value ?? "";
  const personVal = personSelect?.value ?? "";
  const locationVal = locationSelect?.value ?? "";
  const statusVal = statusSelect?.value ?? "";
  const relevanceVal = relevanceSelect?.value ?? "";

  const results: EvidenceRecord[] = [];
  for (const item of state.allEvidence) {
    let matches = true;

    if (searchTerm) {
      const haystack = (
        item.title +
        " " +
        item.summary +
        " " +
        item.tags.join(" ")
      ).toLowerCase();
      if (!haystack.includes(searchTerm)) matches = false;
    }
    if (matches && typeVal && item.type.toLowerCase() !== typeVal) matches = false;
    if (matches && personVal) {
      const person = findPersonById(personVal);
      if (!person || !evidenceMentionsPerson(item, person)) matches = false;
    }
    if (matches && locationVal && !item.locationIds.includes(locationVal)) matches = false;
    if (matches && statusVal && (item.status || "").toLowerCase() !== statusVal) matches = false;
    if (matches && relevanceVal && (item.relevance || "").toLowerCase() !== relevanceVal) matches = false;

    if (matches) results.push(item);
  }

  state.filteredEvidence = results;
  handleSortChange();
  return results;
}

export function renderEvidenceList(): void {
  const container = getElement<HTMLElement>("evidenceList");
  if (!container) return;

  const loadingIndicator = getElement<HTMLElement>("evidenceLoadingIndicator");
  state.evidenceViewLoading = false;
  if (state.evidenceViewLoading) {
    if (loadingIndicator) loadingIndicator.classList.remove("hidden");
    container.innerHTML = "";
    return;
  }

  if (loadingIndicator) loadingIndicator.classList.add("hidden");

  const results = getFilteredEvidence();

  let html = "";
  if (results.length === 0) {
    html = "<p>No evidence matches the current filters.</p>";
  }
  for (const result of results) {
    html += renderEvidenceCardHTML(result);
  }
  container.innerHTML = html;

  container.addEventListener("click", handleEvidenceListClick);
}

function renderEvidenceCardHTML(ev: EvidenceRecord): string {
  const isBookmarked = state.bookmarks.includes(ev.id);
  let html = '<div class="evidence-card" data-id="' + ev.id + '">';
  html +=
    '<button class="bookmark-btn ' +
    (isBookmarked ? "active" : "") +
    '" data-action="bookmark" data-id="' +
    ev.id +
    '" aria-label="Toggle bookmark for ' +
    ev.title +
    '"><span class="bookmark-icon">' +
    (isBookmarked ? "★" : "☆") +
    "</span></button>";
  html += "<h3>" + ev.title + "</h3>";
  html +=
    '<div class="evidence-meta">' +
    ev.id +
    " &middot; " +
    ev.type +
    " &middot; " +
    formatDate(ev.timestamp) +
    "</div>";
  html += '<div class="evidence-summary">' + ev.summary + "</div>";

  if (ev.tags.includes("critical")) {
    html += '<span class="badge badge-critical">Critical</span>';
  }
  html +=
    '<span class="badge ' +
    getStatusBadgeClass(ev.status) +
    '">' +
    ev.status +
    "</span>";
  html +=
    '<span class="badge ' +
    getRelevanceBadgeClass(ev.relevance) +
    '">' +
    ev.relevance +
    "</span>";
  html += "<div>";
  for (const tag of ev.tags) {
    html += '<span class="tag-chip">' + tag + "</span>";
  }
  html += "</div>";
  html += "</div>";
  return html;
}

function handleEvidenceListClick(event: MouseEvent): void {
  const target = event.target as HTMLElement | null;
  if (!target) return;

  const bookmarkButton = target.closest<HTMLButtonElement>("[data-action='bookmark']");
  if (bookmarkButton) {
    event.stopPropagation();
    handleBookmarkClick(bookmarkButton.dataset.id ?? "");
    return;
  }

  const card = target.closest<HTMLElement>(".evidence-card");
  if (card) {
    openEvidenceDetail(card.dataset.id ?? "");
  }
}

function handleBookmarkClick(evidenceId: string): void {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;

  if (!state.bookmarks.includes(evidenceId)) {
    state.bookmarks.push(evidenceId);
    ev.bookmarked = true;
  } else {
    state.bookmarks = state.bookmarks.filter((id) => id !== evidenceId);
    ev.bookmarked = false;
  }
  saveBookmarksToStorage();
  if (state.currentPage === "evidence") renderEvidenceList();
}

export function applyStoredBookmarkFlags(): void {
  for (const item of state.allEvidence) {
    item.bookmarked = state.bookmarks.includes(item.id);
  }
}

export function handleSortChange(): void {
  console.log("Sorting evidence list...");
  const sortValue = getElement<HTMLSelectElement>("sortEvidence")?.value ?? "date-desc";

  if (sortValue === "title-asc") {
    state.filteredEvidence.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortValue === "title-desc") {
    state.filteredEvidence.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sortValue === "date-asc") {
    state.filteredEvidence.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  } else {
    state.filteredEvidence.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }
}

export function clearFilters(): void {
  const evidenceSearch = getElement<HTMLInputElement>("evidenceSearch");
  const filterType = getElement<HTMLSelectElement>("filterType");
  const filterPerson = getElement<HTMLSelectElement>("filterPerson");
  const filterLocation = getElement<HTMLSelectElement>("filterLocation");
  const filterStatus = getElement<HTMLSelectElement>("filterStatus");
  const filterRelevance = getElement<HTMLSelectElement>("filterRelevance");

  if (evidenceSearch) evidenceSearch.value = "";
  if (filterType) filterType.value = "";
  if (filterPerson) filterPerson.value = "";
  if (filterLocation) filterLocation.value = "";
  if (filterStatus) filterStatus.value = "";
  if (filterRelevance) filterRelevance.value = "";
  renderEvidenceList();
}

function simulateAsyncSearch(term: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(term);
    }, 300);
  });
}

let latestSearchRequestId = 0;

export function handleSearchInput(event: Event): void {
  const target = event.target as HTMLInputElement | null;
  const term = target?.value ?? "";
  const requestId = ++latestSearchRequestId;

  simulateAsyncSearch(term).then((resolvedTerm) => {
    void resolvedTerm;
    if (requestId !== latestSearchRequestId) return;
    renderEvidenceList();
  });
}

// ---------------------------------------------------------------------
// EVIDENCE DETAIL
// ---------------------------------------------------------------------

export function openEvidenceDetail(evidenceId: string): void {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;
  state.selectedEvidence = ev;

  const section = getElement<HTMLElement>("evidenceDetailSection");
  if (!section) return;
  section.classList.remove("hidden");

  renderEvidenceDetail(ev);
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function closeEvidenceDetail(): void {
  const section = getElement<HTMLElement>("evidenceDetailSection");
  if (!section) return;
  section.classList.add("hidden");
  section.innerHTML = "";
  state.selectedEvidence = null;
}

function renderEvidenceDetail(ev: EvidenceRecord): void {
  const section = getElement<HTMLElement>("evidenceDetailSection");
  if (!section) return;

  const personNames = ev.personIds.map((personId) => {
    const person = findPersonById(personId);
    return person ? person.name : personId;
  });

  const locationNames = ev.locationIds.map((locationId) => {
    const loc = findLocationById(locationId);
    return loc ? loc.id + " - " + loc.name : locationId;
  });

  const tagsHtml = ev.tags
    .map((tag) => '<span class="tag-chip">' + tag + "</span>")
    .join("");

  const storedNote = loadNoteForEvidence(ev.id);

  let html = "";
  html += '<div class="evidence-detail-header">';
  html += "<div><h2>" + ev.title + "</h2>";
  html +=
    '<div class="evidence-meta">' +
    ev.id +
    " &middot; " +
    ev.type +
    " &middot; " +
    formatDate(ev.timestamp) +
    "</div></div>";
  html +=
    '<button type="button" class="btn btn-secondary btn-small" onclick="closeEvidenceDetail()">Close</button>';
  html += "</div>";

  if (ev.tags.includes("critical")) {
    html +=
      '<div class="warning-banner">This item is tagged as critical evidence.</div>';
  }

  html +=
    '<div class="detail-field"><strong>Summary</strong>' +
    ev.summary +
    "</div>";
  html += '<div class="evidence-detail-content">' + ev.content + "</div>";
  html +=
    '<div class="detail-field"><strong>Related people</strong>' +
    personNames.join(", ") +
    "</div>";
  html +=
    '<div class="detail-field"><strong>Related locations</strong>' +
    locationNames.join(", ") +
    "</div>";
  html +=
    '<div class="detail-field"><strong>Tags</strong>' + tagsHtml + "</div>";

  html += '<div class="detail-field"><strong>Review status</strong>';
  html += '<select id="detailStatusSelect">';
  html += statusOptionHTML(ev.status, "unreviewed", "Unreviewed");
  html += statusOptionHTML(ev.status, "reviewed", "Reviewed");
  html += statusOptionHTML(ev.status, "flagged", "Flagged");
  html += "</select></div>";

  html += '<div class="detail-field"><strong>Relevance</strong>';
  html += '<select id="detailRelevanceSelect">';
  html += statusOptionHTML(ev.relevance, "unknown", "Unknown");
  html += statusOptionHTML(ev.relevance, "relevant", "Relevant");
  html += statusOptionHTML(ev.relevance, "irrelevant", "Irrelevant");
  html += "</select></div>";

  html += '<div class="detail-field"><strong>Investigator note</strong>';
  html +=
    '<textarea id="evidenceNoteInput" class="note-textarea" rows="3" data-evidence-id="' +
    ev.id +
    '" placeholder="Add a private note about this evidence...">' +
    storedNote +
    "</textarea>";
  html +=
    '<button type="button" class="btn btn-primary btn-small" style="margin-top:6px;" onclick="saveCurrentNote()">Save note</button>';
  html += "</div>";

  html +=
    '<div class="detail-field"><strong>Note preview</strong><div id="notePreview">' +
    storedNote +
    "</div></div>";

  section.innerHTML = html;

  const statusSelect = getElement<HTMLSelectElement>("detailStatusSelect");
  const relevanceSelect = getElement<HTMLSelectElement>("detailRelevanceSelect");

  if (statusSelect) {
    statusSelect.addEventListener("change", (event: Event) => {
      const target = event.target as HTMLSelectElement | null;
      if (!target) return;
      ev.status = target.value;
      renderEvidenceDetail(ev);
      if (state.viewRendered.evidence) renderEvidenceList();
    });
  }

  if (relevanceSelect) {
    relevanceSelect.addEventListener("change", (event: Event) => {
      const target = event.target as HTMLSelectElement | null;
      if (!target) return;
      ev.relevance = target.value;
      renderEvidenceDetail(ev);
      if (state.viewRendered.evidence) renderEvidenceList();
    });
  }
}

function statusOptionHTML(
  current: string | null | undefined,
  value: string,
  label: string,
): string {
  const currentLower = (current ?? "").toLowerCase();
  const selected = currentLower === value ? " selected" : "";
  return '<option value="' + value + '"' + selected + ">" + label + "</option>";
}

export function saveCurrentNote(): void {
  const textarea = getElement<HTMLTextAreaElement>("evidenceNoteInput");
  if (!textarea) return;
  const evidenceId = textarea.dataset.evidenceId ?? "";
  const text = textarea.value;
  saveNoteForEvidence(evidenceId, text);
  const preview = document.getElementById("notePreview");
  if (preview) preview.innerHTML = text;
}
