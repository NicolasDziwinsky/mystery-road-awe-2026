import {loadBookmarksFromStorage, loadNotesFromStorage, loadNoteAsync} from "/localStorageHelpers.js";
import {setupEventListeners} from "/eventListenerSetup.js";
import loadAllData from "/dataLoading.js";

// ---------------------------------------------------------------------
// INIT
// ---------------------------------------------------------------------

function initApp() {
  loadBookmarksFromStorage();
  loadNotesFromStorage();
  setupEventListeners();

  loadAllData().then(function () {
    handleHashChange();
    var firstNote = loadNoteAsync("E01");
    console.log("First note preview:", firstNote);
  });
}

window.addEventListener("DOMContentLoaded", initApp);
window.addEventListener("hashchange", handleHashChange);
