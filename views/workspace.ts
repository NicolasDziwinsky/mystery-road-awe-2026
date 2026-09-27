import { state } from "../data.js";
import { openEvidenceDetail } from "./evidence.js";
import { navigateTo } from "../navigation.js";

// ---------------------------------------------------------------------
// WORKSPACE
// ---------------------------------------------------------------------

export function renderWorkspace(): void {
  renderBookmarksList();
  renderNotesList();
  populateHypothesisDropdowns();
  loadHypothesisFromStorage();
}

function renderBookmarksList(): void {
  const container = document.getElementById("bookmarksList") as HTMLElement | null;
  if (!container) return;

  const bookmarkedItems = state.allEvidence.filter((ev) => ev.bookmarked);

  if (bookmarkedItems.length === 0) {
    container.innerHTML =
      "<p>No bookmarked evidence yet. Bookmark items from the Evidence view.</p>";
    return;
  }

  let html = "";
  for (const ev of bookmarkedItems) {
    html +=
      '<div class="mini-list-item"><strong>' +
      ev.id +
      "</strong> &mdash; " +
      ev.title +
      ' <button type="button" class="btn btn-small btn-secondary" data-open-evidence="' +
      ev.id +
      '">Open</button></div>';
  }
  container.innerHTML = html;

  const openButtons = container.querySelectorAll<HTMLButtonElement>("[data-open-evidence]");
  for (const button of openButtons) {
    button.addEventListener("click", () => {
      navigateTo("evidence");
      const id = button.dataset.openEvidence ?? "";
      setTimeout(() => {
        openEvidenceDetail(id);
      }, 0);
    });
  }
}

function renderNotesList(): void {
  const container = document.getElementById("notesList") as HTMLElement | null;
  if (!container) return;

  const noteEntries: Array<{ index: number; evidenceId: string; title: string; text: string }> = [];
  for (let i = 0; i < state.allEvidence.length; i++) {
    const note = state.notesStore[state.allEvidence[i].id];
    if (note) {
      noteEntries.push({
        index: i,
        evidenceId: state.allEvidence[i].id,
        title: state.allEvidence[i].title,
        text: note,
      });
    }
  }

  if (noteEntries.length === 0) {
    container.innerHTML =
      "<p>No notes yet. Add one from an evidence item's detail view.</p>";
    return;
  }

  let html = "";
  for (const entry of noteEntries) {
    html +=
      '<div class="mini-list-item"><strong>' +
      entry.evidenceId +
      "</strong> &mdash; " +
      entry.title;
    html += '<div id="noteText-' + entry.index + '">' + entry.text + "</div></div>";
  }
  container.innerHTML = html;
}

export function populateHypothesisDropdowns(): void {
  const suspectSelect = document.getElementById("hypSuspect") as HTMLSelectElement | null;
  const evidenceSelect = document.getElementById("hypEvidence") as HTMLSelectElement | null;
  if (!suspectSelect || !evidenceSelect) return;

  const currentSuspect = suspectSelect.value;
  suspectSelect.innerHTML = '<option value="">Select a person…</option>';
  for (const person of state.allPeople) {
    suspectSelect.innerHTML +=
      '<option value="' + person.id + '">' + person.name + "</option>";
  }
  suspectSelect.value = currentSuspect;

  evidenceSelect.innerHTML = "";
  for (const evidence of state.allEvidence) {
    evidenceSelect.innerHTML +=
      '<option value="' + evidence.id + '">' + evidence.id + " - " + evidence.title + "</option>";
  }
}

function saveHypothesis(): void {
  const suspectSelect = document.getElementById("hypSuspect") as HTMLSelectElement | null;
  const natureSelect = document.getElementById("hypNature") as HTMLSelectElement | null;
  const evidenceSelect = document.getElementById("hypEvidence") as HTMLSelectElement | null;
  const confidenceInput = document.getElementById("hypConfidence") as HTMLInputElement | null;
  const explanationInput = document.getElementById("hypExplanation") as HTMLTextAreaElement | null;
  const alternativeInput = document.getElementById("hypAlternative") as HTMLTextAreaElement | null;

  if (!suspectSelect || !natureSelect || !evidenceSelect || !confidenceInput || !explanationInput || !alternativeInput) {
    return;
  }

  const draft = {
    suspectId: suspectSelect.value,
    nature: natureSelect.value,
    evidenceIds: getSelectedOptions(evidenceSelect),
    confidence: confidenceInput.value,
    explanation: explanationInput.value,
    alternative: alternativeInput.value,
    savedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(state.STORAGE_KEY_HYPOTHESIS, JSON.stringify(draft));
  } catch (err) {
    console.error("Could not save hypothesis draft", err);
    alert("Your hypothesis could not be saved to local storage.");
    return;
  }

  const msg = document.getElementById("hypothesisSavedMsg") as HTMLElement | null;
  if (msg) {
    msg.classList.remove("hidden");
    setTimeout(() => {
      msg.classList.add("hidden");
    }, 2000);
  }
}

function getSelectedOptions(selectEl: HTMLSelectElement): string[] {
  const result: string[] = [];
  for (let i = 0; i < selectEl.options.length; i++) {
    if (selectEl.options[i].selected) result.push(selectEl.options[i].value);
  }
  return result;
}

function loadHypothesisFromStorage(): void {
  const raw = localStorage.getItem(state.STORAGE_KEY_HYPOTHESIS);
  if (!raw) return;

  const draft = JSON.parse(raw) as {
    suspectId?: string;
    nature?: string;
    evidenceIds?: string[];
    confidence?: string | number;
    explanation?: string;
    alternative?: string;
  };

  const suspectSelect = document.getElementById("hypSuspect") as HTMLSelectElement | null;
  const natureSelect = document.getElementById("hypNature") as HTMLSelectElement | null;
  const confidenceInput = document.getElementById("hypConfidence") as HTMLInputElement | null;
  const confidenceValue = document.getElementById("hypConfidenceValue") as HTMLElement | null;
  const explanationInput = document.getElementById("hypExplanation") as HTMLTextAreaElement | null;
  const alternativeInput = document.getElementById("hypAlternative") as HTMLTextAreaElement | null;
  const evidenceSelect = document.getElementById("hypEvidence") as HTMLSelectElement | null;

  if (suspectSelect) suspectSelect.value = draft.suspectId || "";
  if (natureSelect) natureSelect.value = draft.nature || "";
  if (confidenceInput) confidenceInput.value = String(draft.confidence ?? 50);
  if (confidenceValue) confidenceValue.textContent = String(draft.confidence ?? 50);
  if (explanationInput) explanationInput.value = draft.explanation || "";
  if (alternativeInput) alternativeInput.value = draft.alternative || "";

  if (!evidenceSelect) return;
  const savedIds = draft.evidenceIds || [];
  for (let i = 0; i < evidenceSelect.options.length; i++) {
    evidenceSelect.options[i].selected = savedIds.includes(evidenceSelect.options[i].value);
  }
}

window.saveHypothesis = saveHypothesis;
