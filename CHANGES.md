Exercise 1 

1. Js Modules

    -I split all premade borders inside app.js into seperate files. 
    -The Views were moved into the newly made views folder
    -After noticing that the modules couldnt change the global state (the variables inside data.js were read only), i put all variables inside a state object.
    -The most work were the two following parts that were done through manual reading of code, the vd code search function and errors in the Firefox dev console:
        -Checking which modules where depending on which functions from other modules and exporting and importing only the relevant functions.
        -Changing all references to the global state to "state. " 
    -One additional fix was needed to make the navigation work:
        -Imported navigateTo into eventListenerSetup 
        -changed the onclick function for the nav buttons to use navigate to
        -exposed multiple functions inside the modules for inline functions inside the html file

        (Had to remove part of the fix in eventListenerSetup that fixed a bug not yet to be fixed)

2. 
    Inside dataLoading.js

    function loadEvidenceData() {
  fetch("data/evidence.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      state.allEvidence = data;
      applyStoredBookmarkFlags();
      state.filteredEvidence = [...state.allEvidence]; <--- instead of state.filteredEvidence = state.allEvidence;
      renderDashboard();
      populateAllDropdowns();
      if (state.currentPage === "evidence") renderEvidenceList();
    })
    .catch(function (err) {
      console.error("Failed to load evidence.json", err);
      alert("Evidence could not be loaded. Some views may be incomplete.");
    });
}

3. 
    Fix: Two Changes are necessary
    1. Return Promise.all for loadEvidenceData and loadTimelineData so App.js only continues when both are finished.
    2. add return to the outer most fetch inside loadEvidenceData like in loadTimelineData so it returns its promise

4. 
    Change the i inside the loop from var to let inside eventListenerSetup on line 12