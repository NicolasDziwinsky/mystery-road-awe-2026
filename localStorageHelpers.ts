import { state } from "./data.js";

// ---------------------------------------------------------------------
// LOCAL STORAGE HELPERS (bookmarks & notes)
// ---------------------------------------------------------------------

export function saveBookmarksToStorage(): void {
  localStorage.setItem(
    state.STORAGE_KEY_BOOKMARKS,
    JSON.stringify(state.bookmarks),
  );
}

export function loadBookmarksFromStorage(): void {
  try {
    const raw = localStorage.getItem(state.STORAGE_KEY_BOOKMARKS);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    state.bookmarks = Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch (err) {
    console.warn("Could not read stored bookmarks, starting empty", err);
    state.bookmarks = [];
  }
}

export function saveNoteForEvidence(evidenceId: string, text: string): void {
  state.notesStore = {
    ...state.notesStore,
    [evidenceId]: text,
  };

  localStorage.setItem(
    state.STORAGE_KEY_NOTES,
    JSON.stringify(state.notesStore),
  );
}

export function loadNoteForEvidence(evidenceId: string): string {
  return state.notesStore?.[evidenceId] ?? "";
}

export function loadNotesFromStorage(): void {
  const raw = localStorage.getItem(state.STORAGE_KEY_NOTES);
  if (!raw) {
    state.notesStore = {};
    return;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    state.notesStore =
      parsed && typeof parsed === "object"
        ? Object.fromEntries(
            Object.entries(parsed as Record<string, unknown>).map(([key, value]) => [
              key,
              String(value),
            ]),
          )
        : {};
  } catch (err) {
    console.warn("Could not read stored notes, starting empty", err);
    state.notesStore = {};
  }
}

export function loadNoteAsync(evidenceId: string): Promise<string> {
  return Promise.resolve(state.notesStore?.[evidenceId] ?? "");
}
