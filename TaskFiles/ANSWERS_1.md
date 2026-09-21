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


Demo 5

I chose bug 2 (-Review Process show percent correctly one some of the time?)
To show the percentage correctly, one had to reload the page, set one evidence to reviewed, and then go to the dashboard view and load it the first time. The percentage shown at that point would be locked down

When i fixed bug 3 (onChange handleSortChange not defined) i fixed the inital bug (the not defined part). Then it got revealed that the whole handleSortChange function does not work as intended, because it calls renderEvidenceList() after it sortet the evidenceList, reverting all the sorting it did.

Demo 6

Step over executes a function call without entering the function, while Step into enters the called function. In this app, stepping over getFilteredEvidence() would be useful if I only wanted to inspect the returned results. Stepping into it is better when investigating why the filtered evidence array has unexpected contents.

Call stack:
The call stack shows the chain of functions that led to the current line. In this app it helped establish that handleSortChange() called renderEvidenceList(), which then called getFilteredEvidence(). That showed me where the sorted array was subsequently being replaced.

Conditional breakpoint:
A conditional breakpoint pauses only when a specified expression is true. For example, i === 5 lets me inspect one particular iteration without manually resuming through every earlier iteration.

DevTools breakpoint vs debugger;:
A DevTools breakpoint is added externally and doesn't modify the source code. A debugger; statement is written into the source and explicitly causes execution to pause when a debugger is attached. DevTools breakpoints are preferable for temporary investigation; debugger; can be useful when I deliberately want a pause at a particular point during development.

Why console.log wasn't enough:
console.log can show the value of a variable, but it doesn't let me pause execution and inspect the state between individual operations. With the debugger, I could step through renderEvidenceList() and see that state.evidenceViewLoading was still true, causing the function to take the loading branch and return before rendering the evidence cards. I could also inspect the call stack to determine which function had triggered the render.

Demo 7

console.log vs console.warn vs console.error

console.log() — general debugging/information.
console.warn() — indicates something potentially problematic; DevTools can filter it separately as a warning.
console.error() — indicates an error condition and is typically displayed prominently and included in the error log.

Network: Status, Type, Time

For example, if an app's JSON fetch() request shows:

Status: 200
Type:   fetch
Time:   120 ms

that means the request succeeded, it was made as a fetch request, and it took approximately 120 ms.

If it returned 404, the server couldn't find the requested resource. Whether the UI crashes, remains empty, shows an error, or falls back to something else depends on the application's fetch() error handling.

LocalStorageKeys

remotion_bookmarks, remotion_hytothesis, remotion_notes
Uncaught SyntaxError: JSON.parse: unexpected character at line 1 column 1 of the JSON data when i change it, because the json parse is encountering symbols it does not expect at the correct places

The Searchbar in athe evidence view shows up first when throttled, then the evidence gets loaded. 

Demo 8

var is function-scoped and can be reassigned.
let is block-scoped and can be reassigned.
const is block-scoped and cannot be reassigned.

A concrete bug in the original app.js is in the navigation event setup. The code uses var i in a loop and then refers to navButtons[i] inside a click callback:

var navButtons = document.querySelectorAll(".nav-btn");

for (var i = 0; i < navButtons.length; i++) {
  navButtons[i].addEventListener("click", function () {
    var targetView = navButtons[i].getAttribute("data-view");
    console.log("nav clicked:", targetView);
  });
}

Because var i is function-scoped, all of the callbacks share the same i. By the time a user clicks a button, the loop has already finished, so i has the final value. This can cause the callback to access the wrong element or undefined.


An accidental global happens when code assigns a value to a variable without declaring it:

evidenceCount = 10;

In non-strict-mode JavaScript, this can create a property on the global object instead of producing an immediate error. That makes the variable available globally and can cause hidden dependencies or naming conflicts.

ES modules are always strict mode, so the same mistake does not silently create a global. Instead:

evidenceCount = 10;

throws a ReferenceError because evidenceCount was never declared.

This is safer because the mistake is detected immediately rather than creating hidden global state.


One example is the duplicate hashchange event listener. The app registers handleHashChange in setupEventListeners(), but it is also registered again later in the file:

window.addEventListener("hashchange", handleHashChange);

The app can still appear to work because both listeners call the same handler. However, the duplicate registration is still worth refactoring because it makes the event setup harder to understand and creates unnecessary repeated work whenever the hash changes.

The real cost is maintenance and bug risk: someone reading the code may not realize the handler is registered twice, and future changes could make the duplicated behavior cause visible bugs.

A clean version should have each event listener registered in one clear place.

Demo 9

The deepest chain is loadCorePeopleAndLocations():
It is six nested .then() callbacks deep. Each stage must complete successfully before the next request begins:

1. Fetch case.json
2. Parse it
3. Fetch people.json
4. Parse it
5. Fetch locations.json
6. Parse it
7. Update state and render

So this is deliberately sequential, not parallel.

Why is the nested .then() version harder to reason about?

The nested version spreads the sequence across multiple callback functions. To understand what happens next, you repeatedly have to move inward through another .then():

The async/await version expresses the same asynchronous sequence in top-to-bottom order

They run with equivalent Promise behavior, but async/await makes the dependencies between steps easier to see because the code visually resembles synchronous code.

What does await actually do? What is the rest of the program doing?

await pauses only the execution of the current async function until the awaited Promise settles.

It does not freeze JavaScript or the whole application. While this function is waiting:

- the browser can continue processing events
- other JavaScript tasks can run
- rendering can occur
- other Promise callbacks can run
- network requests can continue

What happens if you call .then() on the result of your refactored function?

it would still return a Promise { pending }, but it would return the value undefined

What is the async/await equivalent of .catch()

catch (err) { console.log("timeline load error", err); 
If it fails without a catch, the function returns a failed catch statement, which can still be handled by the calling function

Is async/await faster than .then()?

these things remain unchanged:

- the same files are fetched,
- the requests still happen sequentially,
- each request still waits for the previous step,
- the same JSON parsing occurs,
- the same state updates and rendering occur.

What changes is primarily how the asynchronous control flow is expressed.
So the speed does not really change

What happens if you remove one await

const peopleRes = await fetch("data/people.json");
to
const peopleRes = fetch("data/people.json");

Now peopleRes is a Promise, not a Response
The next line:

const peopleJson = await peopleRes.json();

will fail because a Promise does not have a .json() method.

Demo 10

Schlechte Funktion für Arrow Function wäre loadNoteAsync()


Regular functions get their own this depending on how the function is called.

Arrow functions do not create their own this. They inherit this from the surrounding scope.


Arrow functions:

cannot be called with new

don't have their own arguments object

No. None of the functions converted used new or their own arguments.

All my functions were declared before they were called


Use regular function declarations for named, reusable functions; use arrow functions for callbacks and short functions that don't need their own this.