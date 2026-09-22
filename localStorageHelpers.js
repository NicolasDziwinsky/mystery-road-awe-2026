/**
 * @typedef {Record<string, string>} NotesStore
 */

import { state } from "./data.js";

// ---------------------------------------------------------------------
// LOCAL STORAGE HELPERS (bookmarks & notes)
// ---------------------------------------------------------------------

export function saveBookmarksToStorage() {
  localStorage.setItem(
    state.STORAGE_KEY_BOOKMARKS,
    JSON.stringify(state.bookmarks),
  );
}

export function loadBookmarksFromStorage() {
  try {
    const raw = localStorage.getItem(state.STORAGE_KEY_BOOKMARKS);
    const parsed = raw ? JSON.parse(raw) : [];
    state.bookmarks = Array.isArray(parsed)
      ? parsed.filter((value) => typeof value === "string")
      : [];
  } catch (err) {
    console.warn("Could not read stored bookmarks, starting empty", err);
    state.bookmarks = [];
  }
}

/**
 * @param {string} evidenceId
 * @param {string} text
 */
export function saveNoteForEvidence(evidenceId, text) {
  state.notesStore = {
    ...state.notesStore,
    [evidenceId]: text,
  };

  localStorage.setItem(
    state.STORAGE_KEY_NOTES,
    JSON.stringify(state.notesStore),
  );
}

/**
 * @param {string} evidenceId
 * @returns {string}
 */
export function loadNoteForEvidence(evidenceId) {
  return state.notesStore?.[evidenceId] ?? "";
}

export function loadNotesFromStorage() {
  const raw = localStorage.getItem(state.STORAGE_KEY_NOTES);
  if (!raw) {
    state.notesStore = {};
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    state.notesStore =
      parsed && typeof parsed === "object"
        ? Object.fromEntries(
            Object.entries(parsed).map(([key, value]) => [key, String(value)]),
          )
        : {};
  } catch (err) {
    console.warn("Could not read stored notes, starting empty", err);
    state.notesStore = {};
  }
}

/**
 * @param {string} evidenceId
 * @returns {Promise<string>}
 */
export function loadNoteAsync(evidenceId) {
  return Promise.resolve(state.notesStore?.[evidenceId] ?? "");
}
