Demo 1 — Split the app into JS modules

What is the difference between a classic `<script>` and a `<script type="module">`? Name at
least two behavioral differences that are relevant to this app.

    a classic script shares the pages global environment with other classic scripts which creates a wide shared surface.
    

Before your refactor, `allEvidence` was a global `var`, readable and writable from anywhere in `app.js`. After splitting into modules, what has to happen for a different module to read or change that value? What error do you get if you forget, and why is that error actually useful?

    My data.js module, which contains the state, was not able to be overwritten, the error told me that the variables where read only. This prevents modules from breaking the state of other modules.
    So i had to encapsulate the entire state into its own object. When i import the object its properties can be changed, making everthing a bit more deliberate.

What's the difference between a named export and a default export? Point to one place in your refactor where you chose one over the other, and explain why.

    Using named exports allows a deliberate selection of functions and variables to be imported via {}, while a default export allows import without {}. 
    The default export is useful if a module only has one main function that is has to share.
    In my case i used it inside the dataLoading function, because only app.js needs the loadAllData() function, while all other functions of the module are only used internally.


Why won't `type="module"` scripts run at all if you open `index.html` directly from disk(`file://...`) instead of through a local HTTP server? (You already need a server for`fetch()` — is this the same reason, a different one, or both?)

    Fetch needs a Server structure to prevent the browser from accessing files on the users pc
    ES Modules are also restricted by the browser when loaded in a file:// context for security reasons.
    So it would be technically possible to run ES modules locally without a Server, but for security reasons it is restricted, because the browser neets to run it with browser security rules and mime type rules


Demo 2 — Bug hunt: a mutation/reference bug

    Steps for reproduction: Change the filter inside the evidence view -> changes filtering of the evidence inside the workspace view

Hypothesis (noted down in Obsidian while working):
    Hypothesis: the handleSortChange function may change the state in an unwanted way OR the workspace takes part of the state in a way that is unwanted OR the workspace references the evidence list, when it should be copying it.

Didnt find anything that breaks

Difference Referency and Copy:
    A reference is a variable that references the same value in memory, so changes to one are visible at the other one
    A copy does not share memory space and is completely seperate

I wrote down my chain of thought inside obsidian, and i guess i could have found the bug by just following the change in systemstate. But with my knowledge from 20 minutes ago i could not have figured it out. 

Demo 3

Steps: Enter the People View and reload the page, the number of evidence is going to be zero.

Hypothesis: 
    When i reload the page while in the People View, it fetches the evidence data (which is needed to display the number correctly), but the people cards get rendered before the fetch is done. This can be seen when reloading the page on a different view (which causes the people not to render yet), then switching to the people view. The numbers are displayed correctly, because the fetch could happen before the people got rendered

Conformation: 
    Inside App.js, loadAllData() gets called and waits for a promise to start handleHashChange(). So the promise probably finishes earlier than expected.

    Inside loadAllData(), the function loadCorePeopleAndLocations() gets called, when it is done it calls loadEvidenceData and loadTimelineData, but App.js is not waiting for those two to finish, which causes the bug

Answer:
    The Bug revolves around loadEvidenceData(), which fetches evidence.json
    The fetch returns a promise, and stores the evidence data in state when the request succeeds.
    While the evidence Fetch is still Pending, loadAllData() (which called loadAllEvidence) did not wait for loadEvidenceData. This caused handleHashChange() to be called before the state was properly loaded, causing the number in the person view to be wrongly displayed.

    It was visible through seeing how the people page behaves if i switch into it from another view before the people cards were rendered, and by checking the promise chain.

Demo 4

Task 3

The Bug happens after switching views when pressing buttons in the header.
The Output:
	Uncaught TypeError: can't access property "getAttribute", navButtons[i] is undefined
	    setupEventListeners http://localhost:3000/eventListenerSetup.js:14
	    setupEventListeners http://localhost:3000/eventListenerSetup.js:13
	    initApp http://localhost:3000/app.js:12
	    EventListener.handleEvent* http://localhost:3000/app.js:21
	eventListenerSetup.js:14:24
	    setupEventListeners http://localhost:3000/eventListenerSetup.js:14
	    (Async: EventListener.handleEvent)
	    setupEventListeners http://localhost:3000/eventListenerSetup.js:13
	    initApp http://localhost:3000/app.js:12
	    (Async: EventListener.handleEvent)
	    <anonymous> http://localhost:3000/app.js:21

Line responsible: var targetView = navButtons[i].getAttribute("data-view");

Fix: Change the i inside the loop from var to let
Why?: Because var is function scoped, and let is block scoped, so each iteration gets its own i (block scoped binding instead of function scoped binding)

I did not notice the bug before looking in the console